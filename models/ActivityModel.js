const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
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

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "lead_created",
        "lead_updated",
        "lead_assigned",
        "status_changed",
        "followup_created",
        "followup_completed",
        "property_shared",
        "whatsapp_sent",
        "whatsapp_received",
        "note_added",
        "other",
      ],
      default: "other",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({
  tenantId: 1,
  leadId: 1,
});

activitySchema.index({
  tenantId: 1,
  userId: 1,
});

module.exports = mongoose.model("Activity", activitySchema);