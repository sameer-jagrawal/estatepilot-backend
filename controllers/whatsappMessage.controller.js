const whatsappMessageService = require("../services/whatsappMessage.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createMessage = async (req, res) => {
  try {
    const message = await whatsappMessageService.createMessage({
      ...req.body,
      tenantId: req.user.tenantId,
      userId: req.user.userId,
    });

    return sendCreated(res, "WhatsApp message saved successfully", message);
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getLeadMessages = async (req, res) => {
  try {
    const messages = await whatsappMessageService.getLeadMessages(
      req.user.tenantId,
      req.params.leadId
    );

    return sendSuccess(res, "Lead messages fetched successfully", messages);
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await whatsappMessageService.getAllMessages(
      req.user.tenantId,
      req.query
    );

    return sendSuccess(res, "Messages fetched successfully", messages);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const updateMessageStatus = async (req, res) => {
  try {
    const message = await whatsappMessageService.updateMessageStatus(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Message status updated successfully", message);
  } catch (error) {
    if (error.message === "Message not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deleteMessage = async (req, res) => {
  try {
    await whatsappMessageService.deleteMessage(
      req.user.tenantId,
      req.params.id
    );

    return sendDelete(res, "Message deleted successfully");
  } catch (error) {
    if (error.message === "Message not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createMessage,
  getLeadMessages,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
};