const mongoose = require("mongoose");

const userVerificationOtpSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tanent",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    resendAvailableAt: {
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

userVerificationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
userVerificationOtpSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("UserVerificationOtp", userVerificationOtpSchema);
