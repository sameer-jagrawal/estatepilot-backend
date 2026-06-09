const express = require("express");
const router = express.Router();

const superAdminController = require("../controllers/superAdmin.controller");
const adminAuth = require("../middleware/adminAuth");
const validate = require("../middleware/validate");

router.post("/create", validate.superAdminCreate, superAdminController.createSuperAdmin);
router.post("/login", validate.login, superAdminController.loginSuperAdmin);
router.post("/logout", superAdminController.logoutSuperAdmin);
router.get("/me", adminAuth, superAdminController.me);

module.exports = router;
