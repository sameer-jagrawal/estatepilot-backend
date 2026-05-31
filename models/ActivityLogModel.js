const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    module: {
      type: String,
      enum: [
        "lead",
        "property",
        "followup",
        "site_visit",
        "deal",
        "note",
        "user",
        "whatsapp",
        "tenant",
        "auth",
        "system",
      ],
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      default: "",
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({
  tenantId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);