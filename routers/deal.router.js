const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const authorizeRoles = require("../middleware/authorizeRoles");
const dealController = require("../controllers/deal.controller");
const validate = require("../middleware/validate");

router.post("/create", tenantAuth, authorizeRoles("owner", "manager"), validate.dealCreate, dealController.createDeal);
router.get("/", tenantAuth, dealController.getDeals);
router.get("/:id", tenantAuth, validate.objectId("id"), dealController.getDealById);
router.patch("/:id", tenantAuth, authorizeRoles("owner", "manager"), validate.objectId("id"), dealController.updateDeal);
router.patch("/:id/close", tenantAuth, authorizeRoles("owner", "manager"), validate.objectId("id"), dealController.closeDeal);
router.patch("/:id/cancel", tenantAuth, authorizeRoles("owner", "manager"), validate.objectId("id"), dealController.cancelDeal);
router.delete("/:id", tenantAuth, authorizeRoles("owner", "manager"), validate.objectId("id"), dealController.deleteDeal);

module.exports = router;
