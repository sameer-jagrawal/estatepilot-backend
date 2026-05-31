const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
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

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["call", "whatsapp", "meeting", "site_visit", "payment", "other"],
      default: "call",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      default: "",
    },

    dueAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "missed", "cancelled"],
      default: "pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

followUpSchema.index({
  tenantId: 1,
  assignedTo: 1,
  dueAt: 1,
});

followUpSchema.index({
  tenantId: 1,
  leadId: 1,
});

module.exports = mongoose.model("FollowUp", followUpSchema);