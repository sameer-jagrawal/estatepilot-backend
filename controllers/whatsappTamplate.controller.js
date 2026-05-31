const whatsappTemplateService = require("../services/whatsappTemplate.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendConflict,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createTemplate = async (req, res) => {
  try {
    const template = await whatsappTemplateService.createTemplate({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    return sendCreated(res, "Template created successfully", template);
  } catch (error) {
    if (error.message === "Template already exists") {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await whatsappTemplateService.getTemplates(
      req.user.tenantId,
      req.query
    );

    return sendSuccess(res, "Templates fetched successfully", templates);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await whatsappTemplateService.getTemplateById(
      req.user.tenantId,
      req.params.id
    );

    return sendSuccess(res, "Template fetched successfully", template);
  } catch (error) {
    if (error.message === "Template not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateTemplate = async (req, res) => {
  try {
    const template = await whatsappTemplateService.updateTemplate(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Template updated successfully", template);
  } catch (error) {
    if (error.message === "Template not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deleteTemplate = async (req, res) => {
  try {
    await whatsappTemplateService.deleteTemplate(
      req.user.tenantId,
      req.params.id
    );

    return sendDelete(res, "Template deleted successfully");
  } catch (error) {
    if (error.message === "Template not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};