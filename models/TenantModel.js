const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    ownerPhone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    businessType: {
      type: String,
      enum: ["broker", "builder", "agency", "developer"],
      default: "broker",
    },

    city: {
      type: String,
      default: "Jaipur",
    },

    address: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: null,
    },

    plan: {
      type: String,
      enum: ["free", "starter", "team", "business"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["trial", "active", "inactive", "suspended", "expired"],
      default: "trial",
    },

    trialEndsAt: {
      type: Date,
      default: null,
    },

    settings: {
      currency: {
        type: String,
        default: "INR",
      },

      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },

      leadAutoAssign: {
        type: Boolean,
        default: false,
      },
    },

    limits: {
      maxUsers: {
        type: Number,
        default: 5,
      },

      maxLeads: {
        type: Number,
        default: 1000,
      },

      maxProperties: {
        type: Number,
        default: 500,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tenantSchema.index({ slug: 1 });
tenantSchema.index({ ownerEmail: 1 });
tenantSchema.index({ ownerPhone: 1 });

module.exports = mongoose.model("Tanent", tenantSchema);
