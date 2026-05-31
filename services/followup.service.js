const FollowUpModel = require("../models/FollowUpModel");
const LeadModel = require("../models/LeadModel");
const UserModel = require("../models/UserModel");
const activityLogService = require("./activityLog.service");

const safeCreateActivityLog = async (logData) => {
  try {
    await activityLogService.createActivityLog(logData);
  } catch (error) {
    console.log("Activity log failed:", error.message);
  }
};

// create follow ups
const createFollowUp = async (data) => {
  const lead = await LeadModel.findOne({
    _id: data.leadId,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const user = await UserModel.findOne({
    _id: data.assignedTo,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!user) {
    throw new Error("Assigned user not found");
  }

  const followUp = await FollowUpModel.create(data);

  await safeCreateActivityLog({
    tenantId: followUp.tenantId,
    userId: data.userId || followUp.assignedTo || null,
    module: "followup",
    action: "followup_created",
    description: "Follow-up scheduled",
    entityType: "followup",
    entityId: followUp._id,
    metadata: {
      leadId: followUp.leadId,
      assignedTo: followUp.assignedTo,
      followupType: followUp.followupType || followUp.type,
      dueAt: followUp.dueAt,
      priority: followUp.priority,
      status: followUp.status,
    },
  });

  return followUp;
};

const getFollowUps = async (tenantId, query) => {
  const filter = { tenantId };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }

  if (query.leadId) {
    filter.leadId = query.leadId;
  }

  return await FollowUpModel.find(filter)
    .populate("leadId", "name phone status")
    .populate("assignedTo", "name email phone role")
    .sort({ dueAt: 1 });
};

const getTodayFollowUps = async (tenantId) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return await FollowUpModel.find({
    tenantId,
    status: "pending",
    dueAt: {
      $gte: start,
      $lte: end,
    },
  })
    .populate("leadId", "name phone status")
    .populate("assignedTo", "name phone role")
    .sort({ dueAt: 1 });
};

const getOverdueFollowUps = async (tenantId) => {
  return await FollowUpModel.find({
    tenantId,
    status: "pending",
    dueAt: {
      $lt: new Date(),
    },
  })
    .populate("leadId", "name phone status")
    .populate("assignedTo", "name phone role")
    .sort({ dueAt: 1 });
};

const markFollowUpCompleted = async (tenantId, followUpId) => {
  const followUp = await FollowUpModel.findOneAndUpdate(
    {
      _id: followUpId,
      tenantId,
    },
    {
      status: "completed",
      completedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!followUp) {
    throw new Error("Follow-up not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: followUp.assignedTo || null,
    module: "followup",
    action: "followup_completed",
    description: "Follow-up completed",
    entityType: "followup",
    entityId: followUp._id,
    metadata: {
      leadId: followUp.leadId,
      assignedTo: followUp.assignedTo,
      followupType: followUp.followupType || followUp.type,
      dueAt: followUp.dueAt,
      priority: followUp.priority,
      status: followUp.status,
    },
  });

  return followUp;
};

const cancelFollowUp = async (tenantId, followUpId) => {
  const followUp = await FollowUpModel.findOneAndUpdate(
    {
      _id: followUpId,
      tenantId,
    },
    {
      status: "cancelled",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!followUp) {
    throw new Error("Follow-up not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: followUp.assignedTo || null,
    module: "followup",
    action: "followup_cancelled",
    description: "Follow-up cancelled",
    entityType: "followup",
    entityId: followUp._id,
    metadata: {
      leadId: followUp.leadId,
      assignedTo: followUp.assignedTo,
      followupType: followUp.followupType || followUp.type,
      dueAt: followUp.dueAt,
      priority: followUp.priority,
      status: followUp.status,
    },
  });

  return followUp;
};

const updateFollowUp = async (tenantId, followUpId, data) => {
  delete data.tenantId;
  delete data.leadId;

  if (data.assignedTo) {
    const user = await UserModel.findOne({
      _id: data.assignedTo,
      tenantId,
      isActive: true,
    });

    if (!user) {
      throw new Error("Assigned user not found");
    }
  }

  const followUp = await FollowUpModel.findOneAndUpdate(
    {
      _id: followUpId,
      tenantId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!followUp) {
    throw new Error("Follow-up not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: followUp.assignedTo || null,
    module: "followup",
    action: "followup_updated",
    description: "Follow-up updated",
    entityType: "followup",
    entityId: followUp._id,
    metadata: {
      leadId: followUp.leadId,
      assignedTo: followUp.assignedTo,
      followupType: followUp.followupType || followUp.type,
      dueAt: followUp.dueAt,
      priority: followUp.priority,
      status: followUp.status,
    },
  });

  return followUp;
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getTodayFollowUps,
  getOverdueFollowUps,
  updateFollowUp,
  markFollowUpCompleted,
  cancelFollowUp,
};
