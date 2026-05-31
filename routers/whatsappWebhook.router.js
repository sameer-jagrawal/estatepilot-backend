const express = require("express");

const router = express.Router();

const whatsappWebhookController =
  require("../controllers/whatsappWebhook.controller");

router.get(
  "/meta",
  whatsappWebhookController.verifyWebhook
);

module.exports = router;