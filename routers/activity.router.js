const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const activityController = require("../controllers/activity.controller");

router.post("/create", tenantAuth, activityController.createActivity);

router.get("/", tenantAuth, activityController.getAllActivities);

router.get(
  "/lead/:leadId",
  tenantAuth,
  activityController.getLeadActivities
);

router.delete(
  "/:id",
  tenantAuth,
  activityController.deleteActivity
);

module.exports = router;
