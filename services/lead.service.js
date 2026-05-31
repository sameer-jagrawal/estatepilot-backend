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

// create lead
const createLead = async (data) => {
  const duplicateLead = await LeadModel.findOne({
    tenantId: data.tenantId,
    phone: data.phone,
  });

  if (duplicateLead) {
    throw new Error("Lead already exists");
  }

  if (data.assignedTo) {
    const user = await UserModel.findOne({
      _id: data.assignedTo,
      tenantId: data.tenantId,
      isActive: true,
    });

    if (!user) {
      throw new Error("Assigned user not found");
    }
  }

  const lead = await LeadModel.create(data);

  await safeCreateActivityLog({
    tenantId: lead.tenantId,
    userId: data.userId || data.createdBy || data.assignedTo || null,
    module: "lead",
    action: "lead_created",
    description: `Lead created: ${lead.name}`,
    entityType: "lead",
    entityId: lead._id,
    metadata: {
      leadName: lead.name,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
    },
  });

  return lead;
};


// get all leads
const getLeads = async (tenantId, query) => {
  const filter = {
    tenantId,
    isActive: true,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }

  if (query.source) {
    filter.source = query.source;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
      { locationPreference: { $regex: query.search, $options: "i" } },
    ];
  }

  return await LeadModel.find(filter)
    .populate("assignedTo", "name email phone role")
    .sort({ createdAt: -1 });
};


// get lead by id
const getLeadById = async (tenantId, leadId, user = null) => {
  const filter = {
    _id: leadId,
    tenantId,
    isActive: true,
  };

  if (user?.role === "agent") {
    filter.assignedTo = user.userId;
  }

  const lead = await LeadModel.findOne(filter).populate("assignedTo", "name email phone role");

  if (!lead) {
    throw new Error("Lead not found");
  }

  return lead;
};


// update lead
const updateLead = async (tenantId, leadId, data) => {
  const hasStatusChange = Object.prototype.hasOwnProperty.call(data, "status");
  delete data.tenantId;

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

  const lead = await LeadModel.findOneAndUpdate(
    {
      _id: leadId,
      tenantId,
      isActive: true,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("assignedTo", "name email phone role");

  if (!lead) {
    throw new Error("Lead not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: data.userId || data.createdBy || data.assignedTo || null,
    module: "lead",
    action: "lead_updated",
    description: `Lead updated: ${lead.name}`,
    entityType: "lead",
    entityId: lead._id,
    metadata: {
      leadName: lead.name,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
    },
  });

  if (hasStatusChange) {
    await safeCreateActivityLog({
      tenantId,
      userId: data.userId || data.createdBy || data.assignedTo || null,
      module: "lead",
      action: "lead_status_changed",
      description: `Lead status changed to ${data.status}`,
      entityType: "lead",
      entityId: lead._id,
      metadata: {
        leadName: lead.name,
        status: data.status,
      },
    });
  }

  return lead;
};


// delete lead
const deleteLead = async (tenantId, leadId) => {
  const lead = await LeadModel.findOneAndUpdate(
    {
      _id: leadId,
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

  if (!lead) {
    throw new Error("Lead not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: null,
    module: "lead",
    action: "lead_deleted",
    description: `Lead deleted: ${lead.name}`,
    entityType: "lead",
    entityId: lead._id,
    metadata: {
      leadName: lead.name,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
    },
  });

  return lead;
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};
