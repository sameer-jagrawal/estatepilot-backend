const bcrypt = require("bcryptjs");

const UserModel = require("../models/UserModel");
const TenantModel = require("../models/TenantModel");
const activityLogService = require("./activityLog.service");

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
  });

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
  getUsersByTenant,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  changeUserPassword,
  suspendUser,
  unsuspendUser,
};
