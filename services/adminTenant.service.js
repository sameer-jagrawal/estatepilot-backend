const TenantModel = require("../models/TenantModel");
const UserModel = require("../models/UserModel");

const getAllTenants = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.plan) {
    filter.plan = query.plan;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { slug: { $regex: query.search, $options: "i" } },
      { ownerName: { $regex: query.search, $options: "i" } },
      { ownerEmail: { $regex: query.search, $options: "i" } },
      { ownerPhone: { $regex: query.search, $options: "i" } },
    ];
  }

  return await TenantModel.find(filter).sort({ createdAt: -1 });
};

const getTenantById = async (tenantId) => {
  const tenant = await TenantModel.findById(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const users = await UserModel.find({ tenantId })
    .select("-password")
    .sort({ createdAt: -1 });

  return {
    tenant,
    usersCount: users.length,
    users,
  };
};

const suspendTenant = async (tenantId) => {
  const tenant = await TenantModel.findByIdAndUpdate(
    tenantId,
    {
      status: "suspended",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await UserModel.updateMany(
    { tenantId },
    { isSuspended: true }
  );

  return tenant;
};

const activateTenant = async (tenantId) => {
  const tenant = await TenantModel.findByIdAndUpdate(
    tenantId,
    {
      status: "active",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await UserModel.updateMany(
    { tenantId },
    { isSuspended: false }
  );

  return tenant;
};

const changeTenantPlan = async (tenantId, data) => {
  const allowedPlans = ["free", "starter", "team", "business"];

  if (!allowedPlans.includes(data.plan)) {
    throw new Error("Invalid plan");
  }

  const tenant = await TenantModel.findByIdAndUpdate(
    tenantId,
    {
      plan: data.plan,
      limits: data.limits,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
};

const updateTenantLimits = async (tenantId, limits) => {
  const tenant = await TenantModel.findByIdAndUpdate(
    tenantId,
    {
      limits,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
};

module.exports = {
  getAllTenants,
  getTenantById,
  suspendTenant,
  activateTenant,
  changeTenantPlan,
  updateTenantLimits,
};
