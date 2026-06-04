const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenant.controller");
const tenantAuth = require("../middleware/tenantAuth");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");

router.post("/register", validate.tenantRegister, tenantController.registerCompany);
router.post("/verify-otp", validate.tenantVerifyOtp, tenantController.verifyCompanyOtp);
router.get("/me", tenantAuth, tenantController.getTenantProfile);
router.patch("/me", tenantAuth, authorizeRoles("owner"), tenantController.updateTenantProfile);


module.exports = router;
