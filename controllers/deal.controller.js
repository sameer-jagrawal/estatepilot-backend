const dealService = require("../services/deal.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendConflict,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createDeal = async (req, res) => {
  try {
    const deal = await dealService.createDeal({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    return sendCreated(res, "Deal created successfully", deal);
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message === "Property not found" ||
      error.message === "Agent not found"
    ) {
      return sendNotFound(res, error.message);
    }

    if (error.message === "Deal already exists") {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getDeals = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role === "agent") {
      query.agentId = req.user.userId;
    }

    const deals = await dealService.getDeals(
      req.user.tenantId,
      query
    );

    return sendSuccess(res, "Deals fetched successfully", deals);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getDealById = async (req, res) => {
  try {
    const deal = await dealService.getDealById(
      req.user.tenantId,
      req.params.id
    );

    return sendSuccess(res, "Deal fetched successfully", deal);
  } catch (error) {
    if (error.message === "Deal not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateDeal = async (req, res) => {
  try {
    const deal = await dealService.updateDeal(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Deal updated successfully", deal);
  } catch (error) {
    if (error.message === "Deal not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const closeDeal = async (req, res) => {
  try {
    const deal = await dealService.closeDeal(
      req.user.tenantId,
      req.params.id
    );

    return sendUpdate(res, "Deal closed successfully", deal);
  } catch (error) {
    if (error.message === "Deal not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const cancelDeal = async (req, res) => {
  try {
    const deal = await dealService.cancelDeal(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Deal cancelled successfully", deal);
  } catch (error) {
    if (error.message === "Deal not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deleteDeal = async (req, res) => {
  try {
    await dealService.deleteDeal(req.user.tenantId, req.params.id);

    return sendDelete(res, "Deal deleted successfully");
  } catch (error) {
    if (error.message === "Deal not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  closeDeal,
  cancelDeal,
  deleteDeal,
};
