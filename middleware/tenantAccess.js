const TenantModel = require("../models/TenantModel");
const {
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const tenantAccess = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return sendUnauthorized(res, "Tenant access required");
    }

    const tenant = await TenantModel.findById(tenantId);

    if (!tenant) {
      return sendNotFound(res, "Tenant not found");
    }

    if (tenant.status === "suspended") {
      return sendForbidden(res, "Your company account has been suspended");
    }

    if (tenant.status === "inactive") {
      return sendForbidden(res, "Your company account is inactive");
    }

    if (
      tenant.trialEndsAt &&
      tenant.trialEndsAt < new Date() &&
      tenant.plan === "free"
    ) {
      tenant.status = "expired";
      await tenant.save();

      return sendForbidden(res, "Your free trial has expired");
    }

    if (tenant.status === "expired") {
      return sendForbidden(res, "Your company trial has expired");
    }

    req.tenant = tenant;

    next();
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

module.exports = tenantAccess;
