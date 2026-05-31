const WhatsAppAccountModel = require("../models/WhatsAppAccountModel");

const connectWhatsAppAccount = async (data) => {
  const existingAccount = await WhatsAppAccountModel.findOne({
    tenantId: data.tenantId,
  });

  if (existingAccount) {
    throw new Error("WhatsApp account already connected");
  }

  return await WhatsAppAccountModel.create(data);
};

const getWhatsAppAccount = async (tenantId) => {
  const account = await WhatsAppAccountModel.findOne({
    tenantId,
    isActive: true,
  }).select("-accessToken");

  if (!account) {
    throw new Error("WhatsApp account not found");
  }

  return account;
};

const updateWhatsAppAccount = async (tenantId, data) => {
  const account = await WhatsAppAccountModel.findOneAndUpdate(
    {
      tenantId,
      isActive: true,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  ).select("-accessToken");

  if (!account) {
    throw new Error("WhatsApp account not found");
  }

  return account;
};

const disconnectWhatsAppAccount = async (tenantId) => {
  const account = await WhatsAppAccountModel.findOneAndUpdate(
    {
      tenantId,
      isActive: true,
    },
    {
      status: "disconnected",
      isActive: false,
    },
    {
      new: true,
    }
  ).select("-accessToken");

  if (!account) {
    throw new Error("WhatsApp account not found");
  }

  return account;
};

const getWhatsAppAccountWithToken = async (tenantId) => {
  const account = await WhatsAppAccountModel.findOne({
    tenantId,
    isActive: true,
    status: "connected",
  });

  if (!account) {
    throw new Error("WhatsApp account not connected");
  }

  return account;
};

module.exports = {
  connectWhatsAppAccount,
  getWhatsAppAccount,
  updateWhatsAppAccount,
  disconnectWhatsAppAccount,
  getWhatsAppAccountWithToken,
};