const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenant.controller");
const tenantAuth = require("../middleware/tenantAuth");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  registerLimiter,
  verifyOtpLimiter,
} = require("../middleware/security");
const validate = require("../middleware/validate");

router.post("/register", registerLimiter, validate.tenantRegister, tenantController.registerCompany);
router.post("/verify-otp", verifyOtpLimiter, validate.tenantVerifyOtp, tenantController.verifyCompanyOtp);
router.get("/me", tenantAuth, tenantController.getTenantProfile);
router.patch("/me", tenantAuth, authorizeRoles("owner"), tenantController.updateTenantProfile);


module.exports = router;
