const adminDashboardService = require("../services/adminDashboard.service");

const {
  sendSuccess,
  sendServerError,
} = require("../utils/response");

const getAdminDashboardStats = async (req, res) => {
  try {
    const stats =
      await adminDashboardService.getAdminDashboardStats();

    return sendSuccess(
      res,
      "Admin dashboard stats fetched successfully",
      stats
    );
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

module.exports = {
  getAdminDashboardStats,
};