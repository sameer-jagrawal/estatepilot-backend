const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["owner", "manager", "agent"],
      default: "agent",
    },

    profileImage: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    suspensionReason: {
      type: String,
      default: null,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { tenantId: 1, email: 1 },
  { unique: true, sparse: true }
);

userSchema.index(
  { tenantId: 1, phone: 1 },
  { unique: true }
);

userSchema.index({
  tenantId: 1,
  role: 1,
  isActive: 1,
});

module.exports = mongoose.model(
  "User",
  userSchema
);
