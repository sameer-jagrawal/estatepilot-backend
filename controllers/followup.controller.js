const followUpService = require("../services/followup.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createFollowUp = async (req, res) => {
  try {
    const followUp = await followUpService.createFollowUp({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    return sendCreated(res, "Follow-up created successfully", followUp);
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message === "Assigned user not found"
    ) {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getFollowUps = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role === "agent") {
      query.assignedTo = req.user.userId;
    }

    const followUps = await followUpService.getFollowUps(
      req.user.tenantId,
      query
    );

    return sendSuccess(res, "Follow-ups fetched successfully", followUps);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getTodayFollowUps = async (req, res) => {
  try {
    const followUps = await followUpService.getTodayFollowUps(req.user.tenantId);

    return sendSuccess(res, "Today follow-ups fetched successfully", followUps);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getOverdueFollowUps = async (req, res) => {
  try {
    const followUps = await followUpService.getOverdueFollowUps(req.user.tenantId);

    return sendSuccess(res, "Overdue follow-ups fetched successfully", followUps);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const followUp = await followUpService.updateFollowUp(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Follow-up updated successfully", followUp);
  } catch (error) {
    if (
      error.message === "Follow-up not found" ||
      error.message === "Assigned user not found"
    ) {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const markFollowUpCompleted = async (req, res) => {
  try {
    const followUp = await followUpService.markFollowUpCompleted(
      req.user.tenantId,
      req.params.id
    );

    return sendUpdate(res, "Follow-up completed successfully", followUp);
  } catch (error) {
    if (error.message === "Follow-up not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const cancelFollowUp = async (req, res) => {
  try {
    const followUp = await followUpService.cancelFollowUp(
      req.user.tenantId,
      req.params.id
    );

    return sendUpdate(res, "Follow-up cancelled successfully", followUp);
  } catch (error) {
    if (error.message === "Follow-up not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getTodayFollowUps,
  getOverdueFollowUps,
  updateFollowUp,
  markFollowUpCompleted,
  cancelFollowUp,
};
