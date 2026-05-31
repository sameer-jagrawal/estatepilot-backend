const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const noteController = require("../controllers/note.controller");
const validate = require("../middleware/validate");

router.post("/create", tenantAuth, validate.noteCreate, noteController.createNote);
router.get("/", tenantAuth, noteController.getNotes);

router.get(
  "/lead/:leadId",
  tenantAuth,
  validate.objectId("leadId"),
  noteController.getLeadNotes
);

router.get("/:noteId", tenantAuth, validate.objectId("noteId"), noteController.getNoteById);

router.patch("/:id", tenantAuth, validate.objectId("id"), noteController.updateNote);

router.delete("/:id", tenantAuth, validate.objectId("id"), noteController.deleteNote);

module.exports = router;
