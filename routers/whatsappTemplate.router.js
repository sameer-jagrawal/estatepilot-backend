const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const whatsappTemplateController = require("../controllers/whatsappTamplate.controller");

router.post("/create", tenantAuth, whatsappTemplateController.createTemplate);
router.get("/", tenantAuth, whatsappTemplateController.getTemplates);
router.get("/:id", tenantAuth, whatsappTemplateController.getTemplateById);
router.patch("/:id", tenantAuth, whatsappTemplateController.updateTemplate);
router.delete("/:id", tenantAuth, whatsappTemplateController.deleteTemplate);

module.exports = router;
