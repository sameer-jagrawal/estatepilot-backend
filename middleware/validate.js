const { body, param, validationResult } = require("express-validator");
const { sendValidationError } = require("../utils/response");

const objectId = (field = "id") => param(field).isMongoId().withMessage(`${field} must be a valid ObjectId`);
const optionalObjectIdBody = (field) => body(field).optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage(`${field} must be a valid ObjectId`);
const requiredString = (field) => body(field).trim().notEmpty().withMessage(`${field} is required`);
const optionalString = (field) => body(field).optional({ nullable: true }).trim();
const positiveNumber = (field) => body(field).isFloat({ min: 0 }).withMessage(`${field} must be zero or greater`);
const optionalPositiveNumber = (field) => body(field).optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage(`${field} must be zero or greater`);

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(
        res,
        "Validation failed",
        errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        }))
      );
    }

    return next();
  },
];

const phoneRule = body("phone")
  .optional({ nullable: true, checkFalsy: true })
  .trim()
  .matches(/^[0-9+\-\s()]{7,20}$/)
  .withMessage("phone must be a valid phone number");

const ownerPhoneRule = body("ownerPhone")
  .trim()
  .matches(/^[0-9+\-\s()]{7,20}$/)
  .withMessage("ownerPhone must be a valid phone number");

const validations = {
  login: validate([
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ]),

  tenantRegister: validate([
    requiredString("companyName"),
    requiredString("ownerName"),
    body("ownerEmail").isEmail().normalizeEmail().withMessage("Valid ownerEmail is required"),
    ownerPhoneRule,
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ]),

  tenantVerifyOtp: validate([
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("otp").trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
  ]),

  userCreate: validate([
    requiredString("name"),
    body("email").optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage("Valid phone is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["owner", "manager", "agent"]).withMessage("Invalid role"),
  ]),

  userUpdate: validate([
    objectId("userId"),
    optionalString("name"),
    body("email").optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail().withMessage("Valid email is required"),
    phoneRule,
    body("role").optional().isIn(["owner", "manager", "agent"]).withMessage("Invalid role"),
  ]),

  objectId: (field = "id") => validate([objectId(field)]),

  leadCreate: validate([
    requiredString("name"),
    body("phone").trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage("Valid phone is required"),
    body("email").optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail().withMessage("Valid email is required"),
    optionalObjectIdBody("assignedTo"),
    body("source").optional().isIn(["facebook", "instagram", "99acres", "magicbricks", "housing", "website", "whatsapp", "call", "walkin", "referral", "other"]).withMessage("Invalid lead source"),
    body("status").optional().isIn(["new", "contacted", "follow_up", "site_visit", "negotiation", "booked", "lost"]).withMessage("Invalid lead status"),
    body("interestedIn").optional().isIn(["flat", "villa", "plot", "commercial"]).withMessage("Invalid property interest"),
    optionalPositiveNumber("budgetMin"),
    optionalPositiveNumber("budgetMax"),
  ]),

  leadUpdate: validate([
    objectId("id"),
    optionalString("name"),
    phoneRule,
    body("email").optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail().withMessage("Valid email is required"),
    optionalObjectIdBody("assignedTo"),
    body("source").optional().isIn(["facebook", "instagram", "99acres", "magicbricks", "housing", "website", "whatsapp", "call", "walkin", "referral", "other"]).withMessage("Invalid lead source"),
    body("status").optional().isIn(["new", "contacted", "follow_up", "site_visit", "negotiation", "booked", "lost"]).withMessage("Invalid lead status"),
    body("interestedIn").optional().isIn(["flat", "villa", "plot", "commercial"]).withMessage("Invalid property interest"),
    optionalPositiveNumber("budgetMin"),
    optionalPositiveNumber("budgetMax"),
  ]),

  propertyCreate: validate([
    requiredString("title"),
    body("propertyType").isIn(["flat", "villa", "plot", "commercial", "office", "shop"]).withMessage("Invalid property type"),
    body("purpose").optional().isIn(["sale", "rent"]).withMessage("Invalid purpose"),
    positiveNumber("price"),
    positiveNumber("area"),
    body("areaUnit").optional().isIn(["sqft", "sqyd", "sqm"]).withMessage("Invalid area unit"),
    optionalPositiveNumber("bedrooms"),
    optionalPositiveNumber("bathrooms"),
    body("furnishing").optional().isIn(["unfurnished", "semi-furnished", "fully-furnished"]).withMessage("Invalid furnishing"),
    requiredString("location"),
    body("status").optional().isIn(["available", "sold", "rented", "blocked"]).withMessage("Invalid property status"),
  ]),

  propertyUpdate: validate([
    objectId("id"),
    optionalString("title"),
    body("propertyType").optional().isIn(["flat", "villa", "plot", "commercial", "office", "shop"]).withMessage("Invalid property type"),
    body("purpose").optional().isIn(["sale", "rent"]).withMessage("Invalid purpose"),
    optionalPositiveNumber("price"),
    optionalPositiveNumber("area"),
    body("areaUnit").optional().isIn(["sqft", "sqyd", "sqm"]).withMessage("Invalid area unit"),
    optionalPositiveNumber("bedrooms"),
    optionalPositiveNumber("bathrooms"),
    body("furnishing").optional().isIn(["unfurnished", "semi-furnished", "fully-furnished"]).withMessage("Invalid furnishing"),
    body("status").optional().isIn(["available", "sold", "rented", "blocked"]).withMessage("Invalid property status"),
  ]),

  followupCreate: validate([
    body("leadId").isMongoId().withMessage("leadId must be a valid ObjectId"),
    body("assignedTo").isMongoId().withMessage("assignedTo must be a valid ObjectId"),
    body("type").optional().isIn(["call", "whatsapp", "meeting", "site_visit", "payment", "other"]).withMessage("Invalid follow-up type"),
    requiredString("title"),
    body("dueAt").isISO8601().withMessage("dueAt must be a valid date"),
    body("status").optional().isIn(["pending", "completed", "missed", "cancelled"]).withMessage("Invalid follow-up status"),
  ]),

  followupUpdate: validate([
    objectId("id"),
    optionalObjectIdBody("assignedTo"),
    body("type").optional().isIn(["call", "whatsapp", "meeting", "site_visit", "payment", "other"]).withMessage("Invalid follow-up type"),
    optionalString("title"),
    body("dueAt").optional().isISO8601().withMessage("dueAt must be a valid date"),
    body("status").optional().isIn(["pending", "completed", "missed", "cancelled"]).withMessage("Invalid follow-up status"),
  ]),

  siteVisitCreate: validate([
    body("leadId").isMongoId().withMessage("leadId must be a valid ObjectId"),
    body("propertyId").isMongoId().withMessage("propertyId must be a valid ObjectId"),
    body("assignedTo").isMongoId().withMessage("assignedTo must be a valid ObjectId"),
    body("scheduledAt").isISO8601().withMessage("scheduledAt must be a valid date"),
    body("status").optional().isIn(["scheduled", "completed", "cancelled"]).withMessage("Invalid site visit status"),
  ]),

  dealCreate: validate([
    body("leadId").isMongoId().withMessage("leadId must be a valid ObjectId"),
    body("propertyId").isMongoId().withMessage("propertyId must be a valid ObjectId"),
    body("agentId").isMongoId().withMessage("agentId must be a valid ObjectId"),
    body("dealType").optional().isIn(["sale", "rent"]).withMessage("Invalid deal type"),
    positiveNumber("dealAmount"),
    optionalPositiveNumber("commissionAmount"),
    optionalPositiveNumber("tokenAmount"),
    body("paymentStatus").optional().isIn(["pending", "partial", "paid"]).withMessage("Invalid payment status"),
    body("dealStatus").optional().isIn(["booked", "closed", "cancelled"]).withMessage("Invalid deal status"),
  ]),

  noteCreate: validate([
    body("leadId").isMongoId().withMessage("leadId must be a valid ObjectId"),
    requiredString("note"),
  ]),

  whatsappSend: validate([
    body("leadId").isMongoId().withMessage("leadId must be a valid ObjectId"),
    requiredString("message"),
  ]),

  adminPlanCreate: validate([
    body("name").isIn(["free", "starter", "team", "business"]).withMessage("Invalid plan name"),
    requiredString("displayName"),
    optionalPositiveNumber("price"),
    body("billingCycle").optional().isIn(["monthly", "yearly", "lifetime"]).withMessage("Invalid billing cycle"),
  ]),

  adminTenantPlan: validate([
    objectId("tenantId"),
    body("plan").isIn(["free", "starter", "team", "business"]).withMessage("Invalid plan"),
  ]),
};

module.exports = validations;
