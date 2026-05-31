const NoteModel = require("../models/NoteModel");
const LeadModel = require("../models/LeadModel");
const ActivityModel = require("../models/ActivityModel");
const activityLogService = require("./activityLog.service");

const safeCreateActivityLog = async (logData) => {
  try {
    await activityLogService.createActivityLog(logData);
  } catch (error) {
    console.log("Activity log failed:", error.message);
  }
};

const createNote = async (data) => {
  const lead = await LeadModel.findOne({
    _id: data.leadId,
    tenantId: data.tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const note = await NoteModel.create(data);

  await ActivityModel.create({
    tenantId: data.tenantId,
    leadId: data.leadId,
    userId: data.userId,
    type: "note_added",
    title: "Note added",
    description: data.note,
    metadata: {
      noteId: note._id,
    },
  });

  await safeCreateActivityLog({
    tenantId: note.tenantId,
    userId: note.userId || data.userId || null,
    module: "note",
    action: "note_created",
    description: "Note added to lead",
    entityType: "note",
    entityId: note._id,
    metadata: {
      leadId: note.leadId,
      note: note.note,
      isPinned: note.isPinned,
    },
  });

  return note;
};

const getNotes = async (tenantId, query = {}) => {
  const filter = {
    tenantId,
    isActive: true,
  };

  if (query.leadId) {
    filter.leadId = query.leadId;
  }

  if (query.createdBy) {
    filter.userId = query.createdBy;
  }

  if (query.isImportant !== undefined) {
    filter.isImportant = query.isImportant === "true";
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.date) {
    const start = new Date(query.date);
    const end = new Date(query.date);
    end.setDate(end.getDate() + 1);

    if (!Number.isNaN(start.getTime())) {
      filter.createdAt = {
        $gte: start,
        $lt: end,
      };
    }
  }

  if (query.search) {
    filter.note = { $regex: query.search, $options: "i" };
  }

  const sortMap = {
    oldest: { createdAt: 1 },
    updated: { updatedAt: -1 },
    priority: { priority: -1, createdAt: -1 },
    recent: { createdAt: -1 },
  };

  return await NoteModel.find(filter)
    .populate("leadId", "name email phone status source locationPreference")
    .populate("userId", "name email phone role")
    .sort(sortMap[query.sort] || sortMap.recent);
};

const getNoteById = async (tenantId, noteId) => {
  const note = await NoteModel.findOne({
    _id: noteId,
    tenantId,
    isActive: true,
  })
    .populate("leadId", "name email phone status source locationPreference")
    .populate("userId", "name email phone role");

  if (!note) {
    throw new Error("Note not found");
  }

  return note;
};

const getLeadNotes = async (tenantId, leadId) => {
  const lead = await LeadModel.findOne({
    _id: leadId,
    tenantId,
    isActive: true,
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return await NoteModel.find({
    tenantId,
    leadId,
    isActive: true,
  })
    .populate("userId", "name email phone role")
    .sort({
      isPinned: -1,
      createdAt: -1,
    });
};

const updateNote = async (tenantId, noteId, data) => {
  const userId = data.userId || null;
  delete data.tenantId;
  delete data.leadId;
  delete data.userId;

  const note = await NoteModel.findOneAndUpdate(
    {
      _id: noteId,
      tenantId,
      isActive: true,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("leadId", "name email phone status source locationPreference")
    .populate("userId", "name email phone role");

  if (!note) {
    throw new Error("Note not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: userId || note.userId || null,
    module: "note",
    action: "note_updated",
    description: "Note updated",
    entityType: "note",
    entityId: note._id,
    metadata: {
      leadId: note.leadId,
      note: note.note,
      isPinned: note.isPinned,
    },
  });

  return note;
};

const deleteNote = async (tenantId, noteId) => {
  const note = await NoteModel.findOneAndUpdate(
    {
      _id: noteId,
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

  if (!note) {
    throw new Error("Note not found");
  }

  await safeCreateActivityLog({
    tenantId,
    userId: note.userId || null,
    module: "note",
    action: "note_deleted",
    description: "Note deleted",
    entityType: "note",
    entityId: note._id,
    metadata: {
      leadId: note.leadId,
      note: note.note,
      isPinned: note.isPinned,
    },
  });

  return note;
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  getLeadNotes,
  updateNote,
  deleteNote,
};
