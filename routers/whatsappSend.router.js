const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const whatsappSendController = require("../controllers/whatsappSend.controller");
const validate = require("../middleware/validate");

router.post("/send-message", tenantAuth, validate.whatsappSend, whatsappSendController.sendMessageToLead);

module.exports = router;
