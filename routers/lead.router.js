const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const leadController = require("../controllers/lead.controller");
const validate = require("../middleware/validate");

router.post("/create", tenantAuth, validate.leadCreate, leadController.createLead);
router.get("/", tenantAuth, leadController.getLeads);
router.get("/:id", tenantAuth, validate.objectId("id"), leadController.getLeadById);
router.patch("/:id", tenantAuth, validate.leadUpdate, leadController.updateLead);
router.delete("/:id", tenantAuth, validate.objectId("id"), leadController.deleteLead);

module.exports = router;
