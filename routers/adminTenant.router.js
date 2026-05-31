const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const adminTenantController = require("../controllers/adminTenant.controller");
const validate = require("../middleware/validate");

router.get(
  "/",
  adminAuth,
  adminTenantController.getAllTenants
);

router.get(
  "/:tenantId",
  adminAuth,
  validate.objectId("tenantId"),
  adminTenantController.getTenantById
);

router.patch(
  "/:tenantId/suspend",
  adminAuth,
  validate.objectId("tenantId"),
  adminTenantController.suspendTenant
);

router.patch(
  "/:tenantId/activate",
  adminAuth,
  validate.objectId("tenantId"),
  adminTenantController.activateTenant
);

router.patch(
  "/:tenantId/plan",
  adminAuth,
  validate.adminTenantPlan,
  adminTenantController.changeTenantPlan
);

router.patch(
  "/:tenantId/limits",
  adminAuth,
  validate.objectId("tenantId"),
  adminTenantController.updateTenantLimits
);

module.exports = router;
