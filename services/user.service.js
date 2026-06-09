const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserModel = require("../models/UserModel");
const TenantModel = require("../models/TenantModel");
const UserVerificationOtpModel = require("../models/UserVerificationOtpModel");
const activityLogService = require("./activityLog.service");
const { sendOtpEmail } = require("../utils/email.service");

const OTP_EXPIRES_MS = 5 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const safeCreateActivityLog = async (logData) => {
  try {
    await activityLogService.createActivityLog(logData);
  } catch (error) {
    console.log("Activity log failed:", error.message);
  }
};

const createUser = async (data) => {
  const tenant = await TenantModel.findById(data.tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const duplicateConditions = [{ phone: data.phone }];

  if (data.email) {
    duplicateConditions.push({ email: data.email });
  }

  const existingUser = await UserModel.findOne({
    tenantId: data.tenantId,
    $or: duplicateConditions,
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const userCount = await UserModel.countDocuments({
    tenantId: data.tenantId,
    isActive: true,
  });

  if (userCount >= tenant.limits.maxUsers) {
    throw new Error("User limit reached");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await UserModel.create({
    ...data,
    password: hashedPassword,
    isVerified: false,
  });

  if (user.email) {
    await createAndSendVerificationOtp({
      tenantId: user.tenantId,
      userId: user._id,
      force: true,
    });
  }

  await safeCreateActivityLog({
    tenantId: user.tenantId,
    userId: data.createdBy || data.userId || null,
    module: "user",
    action: "user_created",
    description: `User created: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return sanitizedUser;
};

const createAndSendVerificationOtp = async ({ tenantId, userId, force = false }) => {
  const user = await UserModel.findOne({
    _id: userId,
    tenantId,
  }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.email) {
    throw new Error("User email is required");
  }

  if (user.isVerified) {
    throw new Error("User already verified");
  }

  const existingOtp = await UserVerificationOtpModel.findOne({ tenantId, userId });
  const now = new Date();

  if (!force && existingOtp && existingOtp.resendAvailableAt > now) {
    throw new Error("Please wait before requesting another OTP");
  }

  const otp = generateOtp();

  await UserVerificationOtpModel.findOneAndUpdate(
    { tenantId, userId },
    {
      tenantId,
      userId,
      email: user.email,
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_EXPIRES_MS),
      resendAvailableAt: new Date(Date.now() + OTP_RESEND_MS),
      attempts: 0,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    await sendOtpEmail(user.email, otp, {
      toName: user.name,
      subject: "Verify your EstatePilot user account",
      purpose: `the account created for ${user.name}`,
      expiresIn: "5 minutes",
    });
  } catch (error) {
    await UserVerificationOtpModel.findOneAndDelete({ tenantId, userId });
    throw error;
  }

  return user;
};

const verifyUserOtp = async ({ tenantId, userId, otp, actorId = null }) => {
  const user = await UserModel.findOne({
    _id: userId,
    tenantId,
  }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    return user;
  }

  const otpRecord = await UserVerificationOtpModel.findOne({ tenantId, userId });

  if (!otpRecord) {
    throw new Error("OTP not found or expired");
  }

  if (otpRecord.expiresAt < new Date()) {
    await UserVerificationOtpModel.findByIdAndDelete(otpRecord._id);
    throw new Error("OTP expired. Please request a new OTP.");
  }

  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
    await UserVerificationOtpModel.findByIdAndDelete(otpRecord._id);
    throw new Error("Too many attempts. Please request a new OTP.");
  }

  if (otpRecord.otpHash !== hashOtp(otp)) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  await user.save();
  await UserVerificationOtpModel.findByIdAndDelete(otpRecord._id);

  await safeCreateActivityLog({
    tenantId,
    userId: actorId,
    module: "user",
    action: "user_verified",
    description: `User verified: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  return user;
};

const getUsersByTenant = async (tenantId, query = {}) => {
  const filter = { tenantId };

  if (query.role) {
    filter.role = query.role;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
    ];
  }

  return await UserModel.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });
};

const getUserById = async (tenantId, userId) => {
  const user = await UserModel.findOne({
    _id: userId,
    tenantId,
  }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateUser = async (tenantId, userId, data) => {
  const actorId = data.actorId || data.updatedBy || null;
  delete data.password;
  delete data.tenantId;
  delete data.actorId;
  delete data.updatedBy;

  const user = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      tenantId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: actorId,
    module: "user",
    action: "user_updated",
    description: `User updated: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return user;
};

const deactivateUser = async (tenantId, userId) => {
  const user = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      tenantId,
    },
    {
      isActive: false,
      isSuspended: true,
      suspendedAt: new Date(),
    },
    {
      new: true,
    }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: null,
    module: "user",
    action: "user_suspended",
    description: `User suspended: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return user;
};

const activateUser = async (tenantId, userId) => {
  const user = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      tenantId,
    },
    {
      isActive: true,
      isSuspended: false,
      suspensionReason: null,
      suspendedAt: null,
      suspendedBy: null,
    },
    {
      new: true,
    }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: null,
    module: "user",
    action: "user_activated",
    description: `User activated: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return user;
};

const changeUserPassword = async (tenantId, userId, newPassword, options = {}) => {
  const userToUpdate = await UserModel.findOne({
    _id: userId,
    tenantId,
  }).select("+password");

  if (!userToUpdate) {
    throw new Error("User not found");
  }

  if (options.requireCurrentPassword) {
    const isMatch = await bcrypt.compare(options.currentPassword || "", userToUpdate.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  userToUpdate.password = hashedPassword;
  await userToUpdate.save();
  const user = await UserModel.findOne({ _id: userId, tenantId }).select("-password");

  await safeCreateActivityLog({
    tenantId,
    userId: options.actorId || null,
    module: "user",
    action: "user_password_changed",
    description: `Password changed for user: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return user;
};


const suspendUser = async (
  tenantId,
  userId,
  suspendedBy,
  suspensionReason = ""
) => {
  const user =
    await UserModel.findOneAndUpdate(
      {
        _id: userId,
        tenantId,
      },
      {
        isActive: false,
        isSuspended: true,
        suspensionReason,
        suspendedAt: new Date(),
        suspendedBy,
      },
      {
        new: true,
      }
    ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: suspendedBy || null,
    module: "user",
    action: "user_suspended",
    description: `User suspended: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return user;
};

const unsuspendUser = async (
  tenantId,
  userId
) => {
  const user =
    await UserModel.findOneAndUpdate(
      {
        _id: userId,
        tenantId,
      },
      {
        isActive: true,
        isSuspended: false,
        suspensionReason: null,
        suspendedAt: null,
        suspendedBy: null,
      },
      {
        new: true,
      }
    ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: null,
    module: "user",
    action: "user_activated",
    description: `User activated: ${user.name}`,
    entityType: "user",
    entityId: user._id,
    metadata: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

  return user;
};

module.exports = {
  createUser,
  createAndSendVerificationOtp,
  verifyUserOtp,
  getUsersByTenant,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  changeUserPassword,
  suspendUser,
  unsuspendUser,
};
