const SiteVisitModel = require("../models/SiteVisitModel");
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

const createSiteVisit = async (data) => {
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

  const user = await UserModel.findOne({
    _id: data.assignedTo,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!user) {
    throw new Error("Assigned user not found");
  }

  const siteVisit = await SiteVisitModel.create(data);

  await ActivityModel.create({
    tenantId: data.tenantId,
    leadId: data.leadId,
    userId: data.assignedTo,
    type: "other",
    title: "Site visit scheduled",
    description: `Site visit scheduled for ${property.title}`,
    metadata: {
      siteVisitId: siteVisit._id,
      propertyId: property._id,
      scheduledAt: data.scheduledAt,
    },
  });

  await safeCreateActivityLog({
    tenantId: siteVisit.tenantId,
    userId: data.userId || siteVisit.assignedTo || null,
    module: "site_visit",
    action: "site_visit_scheduled",
    description: "Site visit scheduled",
    entityType: "site_visit",
    entityId: siteVisit._id,
    metadata: {
      leadId: siteVisit.leadId,
      propertyId: siteVisit.propertyId,
      assignedTo: siteVisit.assignedTo,
      scheduledAt: siteVisit.scheduledAt,
      status: siteVisit.status,
    },
  });

  return siteVisit;
};

const getSiteVisits = async (tenantId, query) => {
  const filter = {
    tenantId,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.leadId) {
    filter.leadId = query.leadId;
  }

  if (query.propertyId) {
    filter.propertyId = query.propertyId;
  }

  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }

  return await SiteVisitModel.find(filter)
    .populate("leadId", "name phone status")
    .populate("propertyId", "title propertyCode location price")
    .populate("assignedTo", "name email phone role")
    .sort({ scheduledAt: 1 });
};

const getSiteVisitById = async (tenantId, siteVisitId) => {
  const siteVisit = await SiteVisitModel.findOne({
    _id: siteVisitId,
    tenantId,
  })
    .populate("leadId", "name phone status")
    .populate("propertyId", "title propertyCode location price")
    .populate("assignedTo", "name email phone role");

  if (!siteVisit) {
    throw new Error("Site visit not found");
  }

  return siteVisit;
};

const updateSiteVisit = async (tenantId, siteVisitId, data) => {
  const userId = data.userId || null;
  delete data.tenantId;
  delete data.userId;

  const siteVisit = await SiteVisitModel.findOneAndUpdate(
    {
      _id: siteVisitId,
      tenantId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("leadId", "name phone status")
    .populate("propertyId", "title propertyCode location price")
    .populate("assignedTo", "name email phone role");

  if (!siteVisit) {
    throw new Error("Site visit not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: userId || siteVisit.assignedTo || null,
    module: "site_visit",
    action: "site_visit_updated",
    description: "Site visit updated",
    entityType: "site_visit",
    entityId: siteVisit._id,
    metadata: {
      leadId: siteVisit.leadId,
      propertyId: siteVisit.propertyId,
      assignedTo: siteVisit.assignedTo,
      scheduledAt: siteVisit.scheduledAt,
      status: siteVisit.status,
    },
  });

  return siteVisit;
};

const completeSiteVisit = async (tenantId, siteVisitId, data) => {
  const siteVisit = await SiteVisitModel.findOneAndUpdate(
    {
      _id: siteVisitId,
      tenantId,
    },
    {
      status: "completed",
      feedback: data.feedback || "",
      completedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!siteVisit) {
    throw new Error("Site visit not found");
  }

  await ActivityModel.create({
    tenantId,
    leadId: siteVisit.leadId,
    userId: siteVisit.assignedTo,
    type: "other",
    title: "Site visit completed",
    description: data.feedback || "Site visit completed",
    metadata: {
      siteVisitId: siteVisit._id,
      feedback: data.feedback || "",
    },
  });

  await safeCreateActivityLog({
    tenantId,
    userId: siteVisit.assignedTo || null,
    module: "site_visit",
    action: "site_visit_completed",
    description: "Site visit completed",
    entityType: "site_visit",
    entityId: siteVisit._id,
    metadata: {
      leadId: siteVisit.leadId,
      propertyId: siteVisit.propertyId,
      assignedTo: siteVisit.assignedTo,
      scheduledAt: siteVisit.scheduledAt,
      status: siteVisit.status,
    },
  });

  return siteVisit;
};

const cancelSiteVisit = async (tenantId, siteVisitId, data) => {
  const siteVisit = await SiteVisitModel.findOneAndUpdate(
    {
      _id: siteVisitId,
      tenantId,
    },
    {
      status: "cancelled",
      cancelledReason: data.cancelledReason || "",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!siteVisit) {
    throw new Error("Site visit not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: siteVisit.assignedTo || null,
    module: "site_visit",
    action: "site_visit_cancelled",
    description: "Site visit cancelled",
    entityType: "site_visit",
    entityId: siteVisit._id,
    metadata: {
      leadId: siteVisit.leadId,
      propertyId: siteVisit.propertyId,
      assignedTo: siteVisit.assignedTo,
      scheduledAt: siteVisit.scheduledAt,
      status: siteVisit.status,
    },
  });

  return siteVisit;
};

const deleteSiteVisit = async (tenantId, siteVisitId) => {
  const siteVisit = await SiteVisitModel.findOneAndDelete({
    _id: siteVisitId,
    tenantId,
  });

  if (!siteVisit) {
    throw new Error("Site visit not found");
  }

  return siteVisit;
};

module.exports = {
  createSiteVisit,
  getSiteVisits,
  getSiteVisitById,
  updateSiteVisit,
  completeSiteVisit,
  cancelSiteVisit,
  deleteSiteVisit,
};
