const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserModel = require("../models/UserModel");
const TenantModel = require("../models/TenantModel");
const { generateToken } = require("../utils/jwt");
const sendPasswordResetMail = require("../utils/sendPasswordResetMail");

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const login = async (data) => {
  const { email, password } = data;

  const user = await UserModel.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email first");
  }

  if (!user.isActive) {
    throw new Error("Your account is inactive");
  }

  if (user.isSuspended) {
    throw new Error("Your account has been suspended");
  }

  const tenant = await TenantModel.findById(
    user.tenantId
  );

  if (!tenant) {
    throw new Error("Company account not found");
  }

  if (tenant.status === "suspended") {
    throw new Error(
      "Company account has been suspended"
    );
  }

  if (tenant.status === "inactive") {
    throw new Error(
      "Company account is inactive"
    );
  }

  if (
    tenant.trialEndsAt &&
    tenant.trialEndsAt < new Date() &&
    tenant.plan === "free"
  ) {
    tenant.status = "expired";
    await tenant.save();

    throw new Error(
      "Company free trial has expired"
    );
  }

  if (tenant.status === "expired") {
    throw new Error(
      "Company trial has expired"
    );
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);

  user.password = undefined;

  return {
    token,
    user,
  };
};

const requestPasswordReset = async ({ email }, clientUrl) => {
  const user = await UserModel.findOne({ email }).select(
    "+passwordResetToken +passwordResetExpiresAt"
  );

  if (!user) {
    return;
  }

  const tenant = await TenantModel.findById(user.tenantId);
  if (!tenant || tenant.status === "suspended" || tenant.status === "inactive") {
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashResetToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const baseClientUrl = (clientUrl || process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  const resetUrl = `${baseClientUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  try {
    await sendPasswordResetMail(user.email, resetUrl);
  } catch (error) {
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await user.save({ validateBeforeSave: false });
    throw error;
  }
};

const resetPassword = async ({ email, token, password }) => {
  const user = await UserModel.findOne({
    email,
    passwordResetToken: hashResetToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpiresAt");

  if (!user) {
    throw new Error("Invalid or expired reset link");
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  await user.save();
};

module.exports = {
  login,
  requestPasswordReset,
  resetPassword,
};
