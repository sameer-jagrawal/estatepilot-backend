const WhatsAppTemplateModel = require("../models/whatsappTemplateModel");

const createTemplate = async (data) => {
  const existingTemplate = await WhatsAppTemplateModel.findOne({
    tenantId: data.tenantId,
    name: data.name,
    isActive: true,
  });

  if (existingTemplate) {
    throw new Error("Template already exists");
  }

  return await WhatsAppTemplateModel.create(data);
};

const getTemplates = async (tenantId, query) => {
  const filter = {
    tenantId,
    isActive: true,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = query.category;
  }

  return await WhatsAppTemplateModel.find(filter).sort({
    createdAt: -1,
  });
};

const getTemplateById = async (tenantId, templateId) => {
  const template = await WhatsAppTemplateModel.findOne({
    _id: templateId,
    tenantId,
    isActive: true,
  });

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
};

const updateTemplate = async (tenantId, templateId, data) => {
  delete data.tenantId;

  const template = await WhatsAppTemplateModel.findOneAndUpdate(
    {
      _id: templateId,
      tenantId,
      isActive: true,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
};

const deleteTemplate = async (tenantId, templateId) => {
  const template = await WhatsAppTemplateModel.findOneAndUpdate(
    {
      _id: templateId,
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

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};