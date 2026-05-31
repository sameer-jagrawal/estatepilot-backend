const express = require("express");
const router = express.Router();

const superAdminController = require("../controllers/superAdmin.controller");
const { loginLimiter } = require("../middleware/security");
const validate = require("../middleware/validate");

router.post("/create", superAdminController.createSuperAdmin);
router.post("/login", loginLimiter, validate.login, superAdminController.loginSuperAdmin);
router.post("/logout", superAdminController.logoutSuperAdmin);

module.exports = router;
