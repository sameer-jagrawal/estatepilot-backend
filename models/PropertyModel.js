const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    propertyCode: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: [
        "flat",
        "villa",
        "plot",
        "commercial",
        "office",
        "shop",
      ],
      required: true,
    },

    purpose: {
      type: String,
      enum: ["sale", "rent"],
      default: "sale",
    },

    price: {
      type: Number,
      required: true,
    },

    area: {
      type: Number,
      required: true,
    },

    areaUnit: {
      type: String,
      enum: [
        "sqft",
        "sqyd",
        "sqm",
      ],
      default: "sqft",
    },

    bedrooms: {
      type: Number,
      default: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
    },

    furnishing: {
      type: String,
      enum: [
        "unfurnished",
        "semi-furnished",
        "fully-furnished",
      ],
      default: "unfurnished",
    },

    location: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      default: "Jaipur",
    },

    address: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    amenities: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: [
        "available",
        "sold",
        "rented",
        "blocked",
      ],
      default: "available",
    },

    isFeatured: {
      type: Boolean,
      default: false,
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

propertySchema.index({
  tenantId: 1,
  propertyType: 1,
});

propertySchema.index({
  tenantId: 1,
  location: 1,
});

propertySchema.index({
  tenantId: 1,
  price: 1,
});

propertySchema.index({
  tenantId: 1,
  propertyCode: 1,
});

module.exports = mongoose.model(
  "Property",
  propertySchema
);