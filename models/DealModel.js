const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
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

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    dealType: {
      type: String,
      enum: ["sale", "rent"],
      default: "sale",
    },

    dealAmount: {
      type: Number,
      required: true,
    },

    commissionAmount: {
      type: Number,
      default: 0,
    },

    tokenAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    dealStatus: {
      type: String,
      enum: ["booked", "closed", "cancelled"],
      default: "booked",
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    closingDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
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

dealSchema.index({
  tenantId: 1,
  leadId: 1,
});

dealSchema.index({
  tenantId: 1,
  agentId: 1,
});

dealSchema.index({
  tenantId: 1,
  dealStatus: 1,
});

module.exports = mongoose.model("Deal", dealSchema);