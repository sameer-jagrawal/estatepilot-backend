const noteService = require("../services/note.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendNotFound,
  sendServerError,
} = require("../utils/response");

const createNote = async (req, res) => {
  try {
    const note = await noteService.createNote({
      ...req.body,
      tenantId: req.user.tenantId,
      userId: req.user.userId,
    });

    return sendCreated(res, "Note created successfully", note);
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await noteService.getNotes(
      req.user.tenantId,
      req.query
    );

    return sendSuccess(res, "Notes fetched successfully", notes);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await noteService.getNoteById(
      req.user.tenantId,
      req.params.noteId
    );

    return sendSuccess(res, "Note fetched successfully", note);
  } catch (error) {
    if (error.message === "Note not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getLeadNotes = async (req, res) => {
  try {
    const notes = await noteService.getLeadNotes(
      req.user.tenantId,
      req.params.leadId
    );

    return sendSuccess(res, "Lead notes fetched successfully", notes);
  } catch (error) {
    if (error.message === "Lead not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await noteService.updateNote(
      req.user.tenantId,
      req.params.id,
      req.body
    );

    return sendUpdate(res, "Note updated successfully", note);
  } catch (error) {
    if (error.message === "Note not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deleteNote = async (req, res) => {
  try {
    await noteService.deleteNote(
      req.user.tenantId,
      req.params.id
    );

    return sendDelete(res, "Note deleted successfully");
  } catch (error) {
    if (error.message === "Note not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  getLeadNotes,
  updateNote,
  deleteNote,
};
