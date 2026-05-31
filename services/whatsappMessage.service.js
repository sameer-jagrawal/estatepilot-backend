const WhatsappMessageModel = require("../models/WhatsappMessageModel");
const LeadModel = require("../models/LeadModel");
const ActivityModel = require("../models/ActivityModel");

const createMessage = async (data) => {
  const lead = await LeadModel.findOne({
    _id: data.leadId,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const message = await WhatsappMessageModel.create(data);

  await ActivityModel.create({
    tenantId: data.tenantId,
    leadId: data.leadId,
    userId: data.userId,
    type:
      data.direction === "outgoing"
        ? "whatsapp_sent"
        : "whatsapp_received",
    title:
      data.direction === "outgoing"
        ? "WhatsApp message sent"
        : "WhatsApp message received",
    description: data.message || "",
    metadata: {
      messageId: message._id,
      whatsappMessageId: data.whatsappMessageId || null,
    },
  });

  return message;
};

const getLeadMessages = async (tenantId, leadId) => {
  const lead = await LeadModel.findOne({
    _id: leadId,
    tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return await WhatsappMessageModel.find({
    tenantId,
    leadId,
  })
    .populate("userId", "name email phone role")
    .sort({ createdAt: 1 });
};

const getAllMessages = async (tenantId, query) => {
  const filter = {
    tenantId,
  };

  if (query.leadId) {
    filter.leadId = query.leadId;
  }

  if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.direction) {
    filter.direction = query.direction;
  }

  if (query.status) {
    filter.status = query.status;
  }

  return await WhatsappMessageModel.find(filter)
    .populate("leadId", "name phone status")
    .populate("userId", "name email phone role")
    .sort({ createdAt: -1 });
};

const updateMessageStatus = async (tenantId, messageId, data) => {
  const message = await WhatsappMessageModel.findOneAndUpdate(
    {
      _id: messageId,
      tenantId,
    },
    {
      status: data.status,
      errorMessage: data.errorMessage || null,
      metadata: data.metadata || {},
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!message) {
    throw new Error("Message not found");
  }

  return message;
};

const deleteMessage = async (tenantId, messageId) => {
  const message = await WhatsappMessageModel.findOneAndDelete({
    _id: messageId,
    tenantId,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  return message;
};

module.exports = {
  createMessage,
  getLeadMessages,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
};