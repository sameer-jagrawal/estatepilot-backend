const bcrypt = require("bcryptjs");

const UserModel = require("../models/UserModel");
const TenantModel = require("../models/TenantModel");
const { generateToken } = require("../utils/jwt");

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

module.exports = {
  login,
};