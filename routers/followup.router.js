const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const followUpController = require("../controllers/followup.controller");
const validate = require("../middleware/validate");

router.post("/create", tenantAuth, validate.followupCreate, followUpController.createFollowUp);

router.get("/", tenantAuth, followUpController.getFollowUps);

router.get("/today", tenantAuth, followUpController.getTodayFollowUps);

router.get("/overdue", tenantAuth, followUpController.getOverdueFollowUps);

router.patch(
  "/:id",
  tenantAuth,
  validate.followupUpdate,
  followUpController.updateFollowUp
);

router.patch(
  "/:id/complete",
  tenantAuth,
  validate.objectId("id"),
  followUpController.markFollowUpCompleted
);

router.patch(
  "/:id/cancel",
  tenantAuth,
  validate.objectId("id"),
  followUpController.cancelFollowUp
);

module.exports = router;
