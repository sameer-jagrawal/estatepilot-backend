const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const tenantAccess = require("../middleware/tenantAccess");
const activityLogController = require("../controllers/activityLog.controller");
const validate = require("../middleware/validate");

router.get(
  "/",
  protect,
  tenantAccess,
  activityLogController.getActivityLogs
);

router.get(
  "/entity/:entityType/:entityId",
  protect,
  tenantAccess,
  validate.objectId("entityId"),
  activityLogController.getEntityActivityLogs
);

module.exports = router;
