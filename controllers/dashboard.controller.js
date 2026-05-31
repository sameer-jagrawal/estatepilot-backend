const dashboardService = require("../services/dashboard.service");

const {
  sendSuccess,
  sendServerError,
} = require("../utils/response");

const getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats(
      req.user.tenantId
    );

    return sendSuccess(
      res,
      "Dashboard stats fetched successfully",
      stats
    );
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getLeadStats = async (req, res) => {
  try {
    const stats = await dashboardService.getLeadStats(
      req.user.tenantId
    );

    return sendSuccess(
      res,
      "Lead stats fetched successfully",
      stats
    );
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getDealStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDealStats(
      req.user.tenantId
    );

    return sendSuccess(
      res,
      "Deal stats fetched successfully",
      stats
    );
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

module.exports = {
  getDashboardStats,
  getLeadStats,
  getDealStats,
};