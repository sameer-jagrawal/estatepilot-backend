const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const authorizeRoles = require("../middleware/authorizeRoles");
const propertyController = require("../controllers/property.controller");
const validate = require("../middleware/validate");

router.post("/create", tenantAuth, authorizeRoles("owner", "manager"), validate.propertyCreate, propertyController.createProperty);
router.get("/", tenantAuth, propertyController.getProperties);
router.get("/:id", tenantAuth, validate.objectId("id"), propertyController.getPropertyById);
router.patch("/:id", tenantAuth, authorizeRoles("owner", "manager"), validate.propertyUpdate, propertyController.updateProperty);
router.delete("/:id", tenantAuth, authorizeRoles("owner", "manager"), validate.objectId("id"), propertyController.deleteProperty);

module.exports = router;
