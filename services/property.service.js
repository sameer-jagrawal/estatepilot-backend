const PropertyModel = require("../models/PropertyModel");
const activityLogService = require("./activityLog.service");

const safeCreateActivityLog = async (logData) => {
  try {
    await activityLogService.createActivityLog(logData);
  } catch (error) {
    console.log("Activity log failed:", error.message);
  }
};

const generatePropertyCode = async (
  tenantId,
  propertyType,
  city = "Jaipur"
) => {
  const typeMap = {
    flat: "FLT",
    villa: "VIL",
    plot: "PLT",
    commercial: "COM",
    office: "OFF",
    shop: "SHP",
  };

  const cityCode = city.slice(0, 3).toUpperCase();
  const typeCode = typeMap[propertyType] || "PRO";

  const count = await PropertyModel.countDocuments({
    tenantId,
  });

  const sequence = String(count + 1).padStart(4, "0");

  return `EST-${cityCode}-${typeCode}-${sequence}`;
};

const createProperty = async (data) => {
  const propertyCode = await generatePropertyCode(
    data.tenantId,
    data.propertyType,
    data.city
  );

  const existingProperty = await PropertyModel.findOne({
    tenantId: data.tenantId,
    propertyCode,
  });

  if (existingProperty) {
    throw new Error("Property already exists");
  }

  const property = await PropertyModel.create({
    ...data,
    propertyCode,
  });

  await safeCreateActivityLog({
    tenantId: property.tenantId,
    userId: property.createdBy || data.userId || null,
    module: "property",
    action: "property_created",
    description: `Property created: ${property.title}`,
    entityType: "property",
    entityId: property._id,
    metadata: {
      propertyCode: property.propertyCode,
      propertyType: property.propertyType,
      purpose: property.purpose,
      price: property.price,
      location: property.location,
    },
  });

  return property;
};

const getProperties = async (tenantId, query) => {
  const filter = {
    tenantId,
    isActive: true,
  };

  if (query.propertyType) {
    filter.propertyType = query.propertyType;
  }

  if (query.purpose) {
    filter.purpose = query.purpose;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.location) {
    filter.location = {
      $regex: query.location,
      $options: "i",
    };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};

    if (query.minPrice) {
      filter.price.$gte = Number(query.minPrice);
    }

    if (query.maxPrice) {
      filter.price.$lte = Number(query.maxPrice);
    }
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { propertyCode: { $regex: query.search, $options: "i" } },
      { location: { $regex: query.search, $options: "i" } },
    ];
  }

  return await PropertyModel.find(filter)
    .populate("createdBy", "name email phone role")
    .sort({ createdAt: -1 });
};

const getPropertyById = async (tenantId, propertyId) => {
  const property = await PropertyModel.findOne({
    _id: propertyId,
    tenantId,
    isActive: true,
  }).populate("createdBy", "name email phone role");

  if (!property) {
    throw new Error("Property not found");
  }

  return property;
};

const updateProperty = async (tenantId, propertyId, data) => {
  const hasStatusChange = Object.prototype.hasOwnProperty.call(data, "status");
  const userId = data.userId || null;
  delete data.tenantId;
  delete data.userId;
  delete data.createdBy;
  delete data.propertyCode;

  const property = await PropertyModel.findOneAndUpdate(
    {
      _id: propertyId,
      tenantId,
      isActive: true,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("createdBy", "name email phone role");

  if (!property) {
    throw new Error("Property not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId,
    module: "property",
    action: "property_updated",
    description: `Property updated: ${property.title}`,
    entityType: "property",
    entityId: property._id,
    metadata: {
      propertyCode: property.propertyCode,
      propertyType: property.propertyType,
      purpose: property.purpose,
      price: property.price,
      location: property.location,
    },
  });

  if (hasStatusChange) {
    await safeCreateActivityLog({
      tenantId,
      userId,
      module: "property",
      action: "property_status_changed",
      description: `Property status changed to ${data.status}`,
      entityType: "property",
      entityId: property._id,
      metadata: {
        propertyCode: property.propertyCode,
        status: data.status,
      },
    });
  }

  return property;
};

const deleteProperty = async (tenantId, propertyId) => {
  const property = await PropertyModel.findOneAndUpdate(
    {
      _id: propertyId,
      tenantId,
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      new: true,
    }
  );

  if (!property) {
    throw new Error("Property not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: null,
    module: "property",
    action: "property_deleted",
    description: `Property deleted: ${property.title}`,
    entityType: "property",
    entityId: property._id,
    metadata: {
      propertyCode: property.propertyCode,
      propertyType: property.propertyType,
      purpose: property.purpose,
      price: property.price,
      location: property.location,
    },
  });

  return property;
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
