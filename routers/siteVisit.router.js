const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const siteVisitController = require("../controllers/siteVisit.controller");
const validate = require("../middleware/validate");

router.post("/create", tenantAuth, validate.siteVisitCreate, siteVisitController.createSiteVisit);
router.get("/", tenantAuth, siteVisitController.getSiteVisits);
router.get("/:id", tenantAuth, validate.objectId("id"), siteVisitController.getSiteVisitById);
router.patch("/:id", tenantAuth, validate.objectId("id"), siteVisitController.updateSiteVisit);
router.patch("/:id/complete", tenantAuth, validate.objectId("id"), siteVisitController.completeSiteVisit);
router.patch("/:id/cancel", tenantAuth, validate.objectId("id"), siteVisitController.cancelSiteVisit);
router.delete("/:id", tenantAuth, validate.objectId("id"), siteVisitController.deleteSiteVisit);

module.exports = router;
