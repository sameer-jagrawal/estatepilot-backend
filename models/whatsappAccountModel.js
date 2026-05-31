const mongoose = require("mongoose");

const whatsAppAccountSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      unique: true,
      index: true,
    },

    businessAccountId: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumberId: {
      type: String,
      required: true,
      trim: true,
    },

    displayPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    accessToken: {
      type: String,
      required: true,
      trim: true,
    },

    webhookVerifyToken: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["connected", "disconnected", "expired", "pending"],
      default: "pending",
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

module.exports = mongoose.model(
  "WhatsAppAccount",
  whatsAppAccountSchema
);