const propertyService = require("../services/property.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendConflict,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createProperty = async (req, res) => {
  try {
    const property = await propertyService.createProperty({
      ...req.body,
      tenantId: req.user.tenantId,
      createdBy: req.user.userId,
    });

    return sendCreated(res, "Property created successfully", property);
  } catch (error) {
    if (error.message === "Property already exists") {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await propertyService.getProperties(
      req.user.tenantId,
      req.query
    );

    return sendSuccess(res, "Properties fetched successfully", properties);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(
      req.user.tenantId,
      req.params.id
    );

    return sendSuccess(res, "Property fetched successfully", property);
  } catch (error) {
    if (error.message === "Property not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await propertyService.updateProperty(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Property updated successfully", property);
  } catch (error) {
    if (error.message === "Property not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deleteProperty = async (req, res) => {
  try {
    await propertyService.deleteProperty(req.user.tenantId, req.params.id);

    return sendDelete(res, "Property deleted successfully");
  } catch (error) {
    if (error.message === "Property not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};