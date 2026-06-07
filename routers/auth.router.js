const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const tenantAuth = require("../middleware/tenantAuth");
const validate = require("../middleware/validate");

router.post("/login", validate.login, authController.login);
router.post("/logout", authController.logout);
router.get("/me", tenantAuth, authController.me);
router.post("/forgot-password", validate.forgotPassword, authController.forgotPassword);
router.post("/reset-password", validate.resetPassword, authController.resetPassword);

module.exports = router;
