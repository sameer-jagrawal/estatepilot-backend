const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      enum: ["free", "starter", "team", "business"],
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      default: "monthly",
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

    features: {
      type: [String],
      default: [],
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", planSchema);