const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const whatsappMessageController = require("../controllers/whatsappMessage.controller");

router.post(
  "/create",
  tenantAuth,
  whatsappMessageController.createMessage
);

router.get(
  "/",
  tenantAuth,
  whatsappMessageController.getAllMessages
);

router.get(
  "/lead/:leadId",
  tenantAuth,
  whatsappMessageController.getLeadMessages
);

router.patch(
  "/:id/status",
  tenantAuth,
  whatsappMessageController.updateMessageStatus
);

router.delete(
  "/:id",
  tenantAuth,
  whatsappMessageController.deleteMessage
);

module.exports = router;
