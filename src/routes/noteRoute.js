let express = require("express");
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { notePermission } = require("../middlewares/permission");
const { createNote, updateNote, getNotes, deleteNote } = require("../controller/noteController");

let noteRoute = express.Router();

let noteValidation = [
  check("title", "Title is a required field.").trim().notEmpty(),
  check("note", "Note is a required field.").trim().notEmpty()
]


//? add note
noteRoute.post("/", Auth, notePermission, noteValidation, createNote);

//? update note
noteRoute.put("/:id", Auth, notePermission, noteValidation, updateNote);

//? get note
noteRoute.get("/", Auth, notePermission, getNotes);

//? delete note
noteRoute.delete("/:id", Auth, notePermission, deleteNote);




module.exports = noteRoute;
