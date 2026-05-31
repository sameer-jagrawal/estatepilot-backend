const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    source: {
      type: String,
      enum: [
        "facebook",
        "instagram",
        "99acres",
        "magicbricks",
        "housing",
        "website",
        "whatsapp",
        "call",
        "walkin",
        "referral",
        "other",
      ],
      default: "other",
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "follow_up",
        "site_visit",
        "negotiation",
        "booked",
        "lost",
      ],
      default: "new",
    },

    interestedIn: {
      type: String,
      enum: [
        "flat",
        "villa",
        "plot",
        "commercial",
      ],
      default: "flat",
    },

    budgetMin: {
      type: Number,
      default: 0,
    },

    budgetMax: {
      type: Number,
      default: 0,
    },

    locationPreference: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    lastContactedAt: {
      type: Date,
      default: null,
    },

    nextFollowUpAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({
  tenantId: 1,
  assignedTo: 1,
});

leadSchema.index({
  tenantId: 1,
  phone: 1,
});

module.exports = mongoose.model(
  "Lead",
  leadSchema
);