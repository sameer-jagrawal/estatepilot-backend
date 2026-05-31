const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const dashboardController = require("../controllers/dashboard.controller");

router.get(
  "/stats",
  tenantAuth,
  dashboardController.getDashboardStats
);

router.get(
  "/leads",
  tenantAuth,
  dashboardController.getLeadStats
);

router.get(
  "/deals",
  tenantAuth,
  dashboardController.getDealStats
);

module.exports = router;
