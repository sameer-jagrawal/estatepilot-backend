const ActivityLogModel = require("../models/ActivityLogModel");

const createActivityLog = async (data) => {
  return await ActivityLogModel.create(data);
};

const getActivityLogs = async (tenantId, query = {}) => {
  const filter = { tenantId };

  if (query.module) {
    filter.module = query.module;
  }

  if (query.userId) {
    filter.userId = query.userId;
  }

  if (query.entityType) {
    filter.entityType = query.entityType;
  }

  if (query.entityId) {
    filter.entityId = query.entityId;
  }

  if (query.search) {
    filter.$or = [
      { action: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  return await ActivityLogModel.find(filter)
    .populate("userId", "name email phone role")
    .sort({ createdAt: -1 })
    .limit(Number(query.limit) || 100);
};

const getEntityActivityLogs = async (tenantId, entityType, entityId) => {
  return await ActivityLogModel.find({
    tenantId,
    entityType,
    entityId,
  })
    .populate("userId", "name email phone role")
    .sort({ createdAt: -1 });
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  getEntityActivityLogs,
};