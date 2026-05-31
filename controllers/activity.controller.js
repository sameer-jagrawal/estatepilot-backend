const activityService = require("../services/activity.service");

const {
  sendSuccess,
  sendCreated,
  sendDelete,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createActivity = async (req, res) => {
  try {
    const activity = await activityService.createActivity({
      ...req.body,
      tenantId: req.user.tenantId,
      userId: req.user.userId,
    });

    return sendCreated(res, "Activity created successfully", activity);
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getLeadActivities = async (req, res) => {
  try {
    const activities = await activityService.getLeadActivities(
      req.user.tenantId,
      req.params.leadId
    );

    return sendSuccess(res, "Lead activities fetched successfully", activities);
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getAllActivities = async (req, res) => {
  try {
    const activities = await activityService.getAllActivities(
      req.user.tenantId,
      req.query
    );

    return sendSuccess(res, "Activities fetched successfully", activities);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const deleteActivity = async (req, res) => {
  try {
    await activityService.deleteActivity(
      req.user.tenantId,
      req.params.id
    );

    return sendDelete(res, "Activity deleted successfully");
  } catch (error) {
    if (error.message === "Activity not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createActivity,
  getLeadActivities,
  getAllActivities,
  deleteActivity,
};