const adminPlanService = require("../services/adminPlan.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendBadRequest,
  sendConflict,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createPlan = async (req, res) => {
  try {
    const { name, displayName } = req.body;

    if (!name || !displayName) {
      return sendBadRequest(res, "Plan name and display name are required");
    }

    const plan = await adminPlanService.createPlan(req.body);

    return sendCreated(res, "Plan created successfully", plan);
  } catch (error) {
    if (error.message === "Plan already exists") {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await adminPlanService.getPlans(req.query);

    return sendSuccess(res, "Plans fetched successfully", plans);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = await adminPlanService.getPlanById(req.params.planId);

    return sendSuccess(res, "Plan fetched successfully", plan);
  } catch (error) {
    if (error.message === "Plan not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = await adminPlanService.updatePlan(
      req.params.planId,
      req.body
    );

    return sendUpdate(res, "Plan updated successfully", plan);
  } catch (error) {
    if (error.message === "Plan not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deletePlan = async (req, res) => {
  try {
    await adminPlanService.deletePlan(req.params.planId);

    return sendDelete(res, "Plan deleted successfully");
  } catch (error) {
    if (error.message === "Plan not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};