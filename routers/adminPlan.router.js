const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const adminPlanController = require("../controllers/adminPlan.controller");
const validate = require("../middleware/validate");

router.post(
  "/create",
  adminAuth,
  validate.adminPlanCreate,
  adminPlanController.createPlan
);

router.get(
  "/",
  adminAuth,
  adminPlanController.getPlans
);

router.get(
  "/:planId",
  adminAuth,
  validate.objectId("planId"),
  adminPlanController.getPlanById
);

router.patch(
  "/:planId",
  adminAuth,
  validate.objectId("planId"),
  adminPlanController.updatePlan
);

router.delete(
  "/:planId",
  adminAuth,
  validate.objectId("planId"),
  adminPlanController.deletePlan
);

module.exports = router;
