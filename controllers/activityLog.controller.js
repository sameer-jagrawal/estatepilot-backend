const activityLogService = require("../services/activityLog.service");

const {
  sendSuccess,
  sendServerError,
} = require("../utils/response");

const getActivityLogs = async (req, res) => {
  try {
    const logs = await activityLogService.getActivityLogs(
      req.user.tenantId,
      req.query
    );

    return sendSuccess(res, "Activity logs fetched successfully", logs);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getEntityActivityLogs = async (req, res) => {
  try {
    const logs = await activityLogService.getEntityActivityLogs(
      req.user.tenantId,
      req.params.entityType,
      req.params.entityId
    );

    return sendSuccess(res, "Entity activity logs fetched successfully", logs);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

module.exports = {
  getActivityLogs,
  getEntityActivityLogs,
};