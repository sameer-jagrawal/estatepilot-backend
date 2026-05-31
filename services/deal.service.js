const DealModel = require("../models/DealModel");
const LeadModel = require("../models/LeadModel");
const PropertyModel = require("../models/PropertyModel");
const UserModel = require("../models/UserModel");
const ActivityModel = require("../models/ActivityModel");
const activityLogService = require("./activityLog.service");

const safeCreateActivityLog = async (logData) => {
  try {
    await activityLogService.createActivityLog(logData);
  } catch (error) {
    console.log("Activity log failed:", error.message);
  }
};

const createDeal = async (data) => {
  const lead = await LeadModel.findOne({
    _id: data.leadId,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const property = await PropertyModel.findOne({
    _id: data.propertyId,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!property) {
    throw new Error("Property not found");
  }

  const agent = await UserModel.findOne({
    _id: data.agentId,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!agent) {
    throw new Error("Agent not found");
  }

  const existingDeal = await DealModel.findOne({
    tenantId: data.tenantId,
    leadId: data.leadId,
    propertyId: data.propertyId,
    isActive: true,
  });

  if (existingDeal) {
    throw new Error("Deal already exists");
  }

  const deal = await DealModel.create(data);

  await LeadModel.findOneAndUpdate(
    {
      _id: data.leadId,
      tenantId: data.tenantId,
    },
    {
      status: "booked",
    }
  );

  await PropertyModel.findOneAndUpdate(
    {
      _id: data.propertyId,
      tenantId: data.tenantId,
    },
    {
      status: data.dealType === "rent" ? "rented" : "sold",
    }
  );

  await ActivityModel.create({
    tenantId: data.tenantId,
    leadId: data.leadId,
    userId: data.agentId,
    type: "other",
    title: "Deal created",
    description: `Deal created for ${property.title}`,
    metadata: {
      dealId: deal._id,
      propertyId: property._id,
      dealAmount: data.dealAmount,
      commissionAmount: data.commissionAmount || 0,
    },
  });

  await safeCreateActivityLog({
    tenantId: deal.tenantId,
    userId: data.userId || deal.agentId || null,
    module: "deal",
    action: "deal_created",
    description: "Deal created",
    entityType: "deal",
    entityId: deal._id,
    metadata: {
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      agentId: deal.agentId,
      dealAmount: deal.dealAmount,
      commissionAmount: deal.commissionAmount,
      dealStatus: deal.dealStatus,
      paymentStatus: deal.paymentStatus,
    },
  });

  return deal;
};

const getDeals = async (tenantId, query) => {
  const filter = {
    tenantId,
    isActive: true,
  };

  if (query.dealStatus) {
    filter.dealStatus = query.dealStatus;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  if (query.dealType) {
    filter.dealType = query.dealType;
  }

  if (query.agentId) {
    filter.agentId = query.agentId;
  }

  if (query.leadId) {
    filter.leadId = query.leadId;
  }

  if (query.propertyId) {
    filter.propertyId = query.propertyId;
  }

  const deals = await DealModel.find(filter)
    .populate("leadId", "name phone status")
    .populate("propertyId", "title propertyCode location price status")
    .populate("agentId", "name email phone role")
    .sort({ createdAt: -1 });

  if (!query.search) {
    return deals;
  }

  const search = query.search.toLowerCase();
  return deals.filter((deal) => {
    const text = [
      deal.leadId?.name,
      deal.leadId?.phone,
      deal.propertyId?.title,
      deal.propertyId?.propertyCode,
      deal.propertyId?.location,
      deal.agentId?.name,
      deal.agentId?.email,
    ].join(" ").toLowerCase();

    return text.includes(search);
  });
};

const getDealById = async (tenantId, dealId) => {
  const deal = await DealModel.findOne({
    _id: dealId,
    tenantId,
    isActive: true,
  })
    .populate("leadId", "name phone status")
    .populate("propertyId", "title propertyCode location price status")
    .populate("agentId", "name email phone role");

  if (!deal) {
    throw new Error("Deal not found");
  }

  return deal;
};

const updateDeal = async (tenantId, dealId, data) => {
  const userId = data.userId || null;
  delete data.tenantId;
  delete data.userId;

  const deal = await DealModel.findOneAndUpdate(
    {
      _id: dealId,
      tenantId,
      isActive: true,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("leadId", "name phone status")
    .populate("propertyId", "title propertyCode location price status")
    .populate("agentId", "name email phone role");

  if (!deal) {
    throw new Error("Deal not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: userId || deal.agentId || null,
    module: "deal",
    action: "deal_updated",
    description: "Deal updated",
    entityType: "deal",
    entityId: deal._id,
    metadata: {
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      agentId: deal.agentId,
      dealAmount: deal.dealAmount,
      commissionAmount: deal.commissionAmount,
      dealStatus: deal.dealStatus,
      paymentStatus: deal.paymentStatus,
    },
  });

  return deal;
};

const closeDeal = async (tenantId, dealId) => {
  const deal = await DealModel.findOneAndUpdate(
    {
      _id: dealId,
      tenantId,
      isActive: true,
    },
    {
      dealStatus: "closed",
      paymentStatus: "paid",
      closingDate: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!deal) {
    throw new Error("Deal not found");
  }

  await LeadModel.findOneAndUpdate(
    {
      _id: deal.leadId,
      tenantId,
    },
    {
      status: "booked",
    }
  );

  await safeCreateActivityLog({
    tenantId,
    userId: deal.agentId || null,
    module: "deal",
    action: "deal_closed",
    description: "Deal closed successfully",
    entityType: "deal",
    entityId: deal._id,
    metadata: {
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      agentId: deal.agentId,
      dealAmount: deal.dealAmount,
      commissionAmount: deal.commissionAmount,
      dealStatus: deal.dealStatus,
      paymentStatus: deal.paymentStatus,
    },
  });

  return deal;
};

const cancelDeal = async (tenantId, dealId, data) => {
  const deal = await DealModel.findOneAndUpdate(
    {
      _id: dealId,
      tenantId,
      isActive: true,
    },
    {
      dealStatus: "cancelled",
      notes: data.notes || "",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!deal) {
    throw new Error("Deal not found");
  }

  await PropertyModel.findOneAndUpdate(
    {
      _id: deal.propertyId,
      tenantId,
    },
    {
      status: "available",
    }
  );

  await safeCreateActivityLog({
    tenantId,
    userId: deal.agentId || null,
    module: "deal",
    action: "deal_cancelled",
    description: "Deal cancelled",
    entityType: "deal",
    entityId: deal._id,
    metadata: {
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      agentId: deal.agentId,
      dealAmount: deal.dealAmount,
      commissionAmount: deal.commissionAmount,
      dealStatus: deal.dealStatus,
      paymentStatus: deal.paymentStatus,
    },
  });

  return deal;
};

const deleteDeal = async (tenantId, dealId) => {
  const deal = await DealModel.findOneAndUpdate(
    {
      _id: dealId,
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

  if (!deal) {
    throw new Error("Deal not found");
  }

  return deal;
};

module.exports = {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  closeDeal,
  cancelDeal,
  deleteDeal,
};
