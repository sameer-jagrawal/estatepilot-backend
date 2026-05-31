const ActivityModel = require("../models/ActivityModel");
const LeadModel = require("../models/LeadModel");

const createActivity = async (data) => {
  const lead = await LeadModel.findOne({
    _id: data.leadId,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return await ActivityModel.create(data);
};

const getLeadActivities = async (tenantId, leadId) => {
  const lead = await LeadModel.findOne({
    _id: leadId,
    tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return await ActivityModel.find({
    tenantId,
    leadId,
  })
    .populate("userId", "name email phone role")
    .sort({ createdAt: -1 });
};

const getAllActivities = async (tenantId, query) => {
  const filter = {
    tenantId,
  };

  if (query.leadId) {
    filter.leadId = query.leadId;
  }

  if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.type) {
    filter.type = query.type;
  }

  return await ActivityModel.find(filter)
    .populate("leadId", "name phone status")
    .populate("userId", "name email phone role")
    .sort({ createdAt: -1 });
};

const deleteActivity = async (tenantId, activityId) => {
  const activity = await ActivityModel.findOneAndDelete({
    _id: activityId,
    tenantId,
  });

  if (!activity) {
    throw new Error("Activity not found");
  }

  return activity;
};

module.exports = {
  createActivity,
  getLeadActivities,
  getAllActivities,
  deleteActivity,
};