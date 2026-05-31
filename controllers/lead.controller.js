const leadService = require("../services/lead.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendConflict,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createLead = async (req, res) => {
  try {
    const lead = await leadService.createLead({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    return sendCreated(res, "Lead created successfully", lead);
  } catch (error) {
    if (error.message === "Lead already exists") {
      return sendConflict(res, error.message);
    }

    if (error.message === "Assigned user not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getLeads = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role === "agent") {
      query.assignedTo = req.user.userId;
    }

    const leads = await leadService.getLeads(
      req.user.tenantId,
      query
    );

    return sendSuccess(res, "Leads fetched successfully", leads);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await leadService.getLeadById(
      req.user.tenantId,
      req.params.id,
      req.user
    );

    return sendSuccess(res, "Lead fetched successfully", lead);
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await leadService.updateLead(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Lead updated successfully", lead);
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

const deleteLead = async (req, res) => {
  try {
    await leadService.deleteLead(
      req.user.tenantId,
      req.params.id
    );

    return sendDelete(res, "Lead deleted successfully");
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};
