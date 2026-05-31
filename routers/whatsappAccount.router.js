const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const whatsAppAccountController = require("../controllers/whatsappAccount.controller");

router.post(
  "/connect",
  tenantAuth,
  whatsAppAccountController.connectWhatsAppAccount
);

router.get(
  "/",
  tenantAuth,
  whatsAppAccountController.getWhatsAppAccount
);

router.patch(
  "/",
  tenantAuth,
  whatsAppAccountController.updateWhatsAppAccount
);

router.patch(
  "/disconnect",
  tenantAuth,
  whatsAppAccountController.disconnectWhatsAppAccount
);

module.exports = router;
