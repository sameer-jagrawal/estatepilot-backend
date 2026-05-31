const mongoose = require("mongoose");

const whatsAppTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["marketing", "utility", "authentication"],
      default: "utility",
    },

    language: {
      type: String,
      default: "en",
    },

    body: {
      type: String,
      required: true,
    },

    variables: [
      {
        type: String,
      },
    ],

    metaTemplateId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
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

whatsAppTemplateSchema.index({
  tenantId: 1,
  name: 1,
});

module.exports = mongoose.model(
  "WhatsAppTemplate",
  whatsAppTemplateSchema
);