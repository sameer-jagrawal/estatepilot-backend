const whatsappSendService = require("../services/whatsappSend.service");

const {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const sendMessageToLead = async (req, res) => {
  try {
    const { leadId, message } = req.body;

    console.log(req.body,"message info.")
    if (!leadId || !message) {
      return sendBadRequest(res, "Lead and message are required");
    }

    const result = await whatsappSendService.sendMessageToLead({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      leadId,
      message,
    });

    return sendSuccess(res, "WhatsApp message sent successfully", result);
  } catch (error) {
    if (
      error.message === "Lead not found" ||
      error.message === "WhatsApp account not connected"
    ) {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  sendMessageToLead,
};