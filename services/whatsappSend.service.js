const LeadModel = require("../models/LeadModel");
const WhatsappMessageModel = require("../models/WhatsappMessageModel");
const ActivityModel = require("../models/ActivityModel");
const whatsappAccountService = require("./whatsappAccount.service");
const metaWhatsappService = require("./metaWhatsapp.service");
const activityLogService = require("./activityLog.service");

const safeCreateActivityLog = async (logData) => {
  try {
    await activityLogService.createActivityLog(logData);
  } catch (error) {
    console.log("Activity log failed:", error.message);
  }
};

const sendMessageToLead = async ({ tenantId, userId, leadId, message }) => {
  const lead = await LeadModel.findOne({
    _id: leadId,
    tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const whatsappAccount =
    await whatsappAccountService.getWhatsAppAccountWithToken(tenantId);

  const metaResponse = await metaWhatsappService.sendTextMessage({
    phoneNumberId: whatsappAccount.phoneNumberId,
    accessToken: whatsappAccount.accessToken,
    to: lead.phone,
    message,
  });

  const whatsappMessage = await WhatsappMessageModel.create({
    tenantId,
    leadId,
    userId,
    direction: "outgoing",
    type: "text",
    message,
    whatsappMessageId: metaResponse?.messages?.[0]?.id || null,
    status: "sent",
    metadata: metaResponse,
  });

  await ActivityModel.create({
    tenantId,
    leadId,
    userId,
    type: "whatsapp_sent",
    title: "WhatsApp message sent",
    description: message,
    metadata: {
      messageId: whatsappMessage._id,
      whatsappMessageId: whatsappMessage.whatsappMessageId,
    },
  });

  await safeCreateActivityLog({
    tenantId,
    userId: userId || null,
    module: "whatsapp",
    action: "whatsapp_message_sent",
    description: "WhatsApp message sent",
    entityType: "whatsapp_message",
    entityId: whatsappMessage._id,
    metadata: {
      leadId,
      whatsappMessageId: whatsappMessage.whatsappMessageId,
      messagePreview: message.slice(0, 100),
      status: whatsappMessage.status,
    },
  });

  return whatsappMessage;
};

module.exports = {
  sendMessageToLead,
};
