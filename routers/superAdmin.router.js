const express = require("express");
const router = express.Router();

const superAdminController = require("../controllers/superAdmin.controller");
const validate = require("../middleware/validate");

router.post("/create", superAdminController.createSuperAdmin);
router.post("/login", validate.login, superAdminController.loginSuperAdmin);
router.post("/logout", superAdminController.logoutSuperAdmin);

module.exports = router;
