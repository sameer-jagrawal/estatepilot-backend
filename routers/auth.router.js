const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const tenantAuth = require("../middleware/tenantAuth");
const { loginLimiter } = require("../middleware/security");
const validate = require("../middleware/validate");

router.post("/login", loginLimiter, validate.login, authController.login);
router.post("/logout", authController.logout);
router.get("/me", tenantAuth, authController.me);

module.exports = router;
