const whatsAppAccountService = require("../services/whatsappAccount.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendConflict,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const connectWhatsAppAccount = async (req, res) => {
  try {
    const account = await whatsAppAccountService.connectWhatsAppAccount({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    return sendCreated(res, "WhatsApp account connected successfully", account);
  } catch (error) {
    if (error.message === "WhatsApp account already connected") {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getWhatsAppAccount = async (req, res) => {
  try {
    const account = await whatsAppAccountService.getWhatsAppAccount(
      req.user.tenantId
    );

    return sendSuccess(res, "WhatsApp account fetched successfully", account);
  } catch (error) {
    if (error.message === "WhatsApp account not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateWhatsAppAccount = async (req, res) => {
  try {
    const account = await whatsAppAccountService.updateWhatsAppAccount(
      req.user.tenantId,
      req.body
    );

    return sendUpdate(res, "WhatsApp account updated successfully", account);
  } catch (error) {
    if (error.message === "WhatsApp account not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const disconnectWhatsAppAccount = async (req, res) => {
  try {
    const account = await whatsAppAccountService.disconnectWhatsAppAccount(
      req.user.tenantId
    );

    return sendUpdate(res, "WhatsApp account disconnected successfully", account);
  } catch (error) {
    if (error.message === "WhatsApp account not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  connectWhatsAppAccount,
  getWhatsAppAccount,
  updateWhatsAppAccount,
  disconnectWhatsAppAccount,
};