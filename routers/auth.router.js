const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const tenantAuth = require("../middleware/tenantAuth");
const validate = require("../middleware/validate");

router.post("/login", validate.login, authController.login);
router.post("/logout", authController.logout);
router.get("/me", tenantAuth, authController.me);

module.exports = router;
