const mongoose = require("mongoose");

const siteVisitSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },

    feedback: {
      type: String,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

siteVisitSchema.index({
  tenantId: 1,
  scheduledAt: 1,
});

siteVisitSchema.index({
  tenantId: 1,
  assignedTo: 1,
});

module.exports = mongoose.model("SiteVisit", siteVisitSchema);