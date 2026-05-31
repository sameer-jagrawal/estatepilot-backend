const siteVisitService = require("../services/siteVisit.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createSiteVisit = async (req, res) => {
  try {
    const siteVisit = await siteVisitService.createSiteVisit({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    return sendCreated(res, "Site visit created successfully", siteVisit);
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message === "Property not found" ||
      error.message === "Assigned user not found"
    ) {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getSiteVisits = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role === "agent") {
      query.assignedTo = req.user.userId;
    }

    const siteVisits = await siteVisitService.getSiteVisits(
      req.user.tenantId,
      query
    );

    return sendSuccess(res, "Site visits fetched successfully", siteVisits);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getSiteVisitById = async (req, res) => {
  try {
    const siteVisit = await siteVisitService.getSiteVisitById(
      req.user.tenantId,
      req.params.id
    );

    return sendSuccess(res, "Site visit fetched successfully", siteVisit);
  } catch (error) {
    if (error.message === "Site visit not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateSiteVisit = async (req, res) => {
  try {
    const siteVisit = await siteVisitService.updateSiteVisit(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Site visit updated successfully", siteVisit);
  } catch (error) {
    if (error.message === "Site visit not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const completeSiteVisit = async (req, res) => {
  try {
    const siteVisit = await siteVisitService.completeSiteVisit(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Site visit completed successfully", siteVisit);
  } catch (error) {
    if (error.message === "Site visit not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const cancelSiteVisit = async (req, res) => {
  try {
    const siteVisit = await siteVisitService.cancelSiteVisit(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Site visit cancelled successfully", siteVisit);
  } catch (error) {
    if (error.message === "Site visit not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deleteSiteVisit = async (req, res) => {
  try {
    await siteVisitService.deleteSiteVisit(
      req.user.tenantId,
      req.params.id
    );

    return sendDelete(res, "Site visit deleted successfully");
  } catch (error) {
    if (error.message === "Site visit not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createSiteVisit,
  getSiteVisits,
  getSiteVisitById,
  updateSiteVisit,
  completeSiteVisit,
  cancelSiteVisit,
  deleteSiteVisit,
};
