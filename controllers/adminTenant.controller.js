const adminTenantService = require("../services/adminTenant.service");

const {
  sendSuccess,
  sendUpdate,
  sendBadRequest,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const getAllTenants = async (req, res) => {
  try {
    const tenants = await adminTenantService.getAllTenants(req.query);

    return sendSuccess(res, "Tenants fetched successfully", tenants);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getTenantById = async (req, res) => {
  try {
    const tenant = await adminTenantService.getTenantById(
      req.params.tenantId
    );

    return sendSuccess(res, "Tenant fetched successfully", tenant);
  } catch (error) {
    if (error.message === "Tenant not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const suspendTenant = async (req, res) => {
  try {
    const tenant = await adminTenantService.suspendTenant(
      req.params.tenantId
    );

    return sendUpdate(res, "Tenant suspended successfully", tenant);
  } catch (error) {
    if (error.message === "Tenant not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const activateTenant = async (req, res) => {
  try {
    const tenant = await adminTenantService.activateTenant(
      req.params.tenantId
    );

    return sendUpdate(res, "Tenant activated successfully", tenant);
  } catch (error) {
    if (error.message === "Tenant not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const changeTenantPlan = async (req, res) => {
  try {
    const tenant = await adminTenantService.changeTenantPlan(
      req.params.tenantId,
      req.body
    );

    return sendUpdate(res, "Tenant plan updated successfully", tenant);
  } catch (error) {
    if (error.message === "Tenant not found") {
      return sendNotFound(res, error.message);
    }

    if (error.message === "Invalid plan") {
      return sendBadRequest(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateTenantLimits = async (req, res) => {
  try {
    const tenant = await adminTenantService.updateTenantLimits(
      req.params.tenantId,
      req.body.limits
    );

    return sendUpdate(res, "Tenant limits updated successfully", tenant);
  } catch (error) {
    if (error.message === "Tenant not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  suspendTenant,
  activateTenant,
  changeTenantPlan,
  updateTenantLimits,
};