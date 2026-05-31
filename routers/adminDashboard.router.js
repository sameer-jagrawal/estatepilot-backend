const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const adminDashboardController = require("../controllers/adminDashboard.controller");

router.get(
  "/stats",
  adminAuth,
  adminDashboardController.getAdminDashboardStats
);

module.exports = router;