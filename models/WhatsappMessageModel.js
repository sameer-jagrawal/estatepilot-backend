const mongoose = require("mongoose");

const whatsappMessageSchema =
  new mongoose.Schema(
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

      direction: {
        type: String,
        enum: ["incoming", "outgoing"],
        required: true,
      },

      type: {
        type: String,
        enum: [
          "text",
          "image",
          "document",
          "audio",
          "video",
          "template",
        ],
        default: "text",
      },

      message: {
        type: String,
        default: "",
      },

      mediaUrl: {
        type: String,
        default: null,
      },

      whatsappMessageId: {
        type: String,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "sent",
          "delivered",
          "read",
          "failed",
        ],
        default: "pending",
      },

      errorMessage: {
        type: String,
        default: null,
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

whatsappMessageSchema.index({
  tenantId: 1,
  leadId: 1,
});

whatsappMessageSchema.index({
  tenantId: 1,
  userId: 1,
});

module.exports = mongoose.model(
  "WhatsappMessage",
  whatsappMessageSchema
);