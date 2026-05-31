const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const registrationOtpSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
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
    },

    ownerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,

    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

registrationOtpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

registrationOtpSchema.index({ ownerEmail: 1 });

module.exports = mongoose.model(
  "RegistrationOtp",
  registrationOtpSchema
);