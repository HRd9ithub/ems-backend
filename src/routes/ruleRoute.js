let express = require("express");
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { rulePermission } = require("../middlewares/permission");
const { createRule, updateRule, getRules, getSingleRule, deleteRule } = require("../controller/ruleController");

let ruleRoute = express.Router();

let ruleValidation = [
  check("title", "Title is a required field.").trim().notEmpty(),
  check("rules", "Rules is a required field.").trim().notEmpty()
]

//? add rule
ruleRoute.post("/", Auth, rulePermission, ruleValidation, createRule);

//? update rule
ruleRoute.put("/:id", Auth, rulePermission, ruleValidation, updateRule);

//? get rule
ruleRoute.get("/", Auth, rulePermission, getRules);

//? get single rule
ruleRoute.get("/:id", Auth, rulePermission, getSingleRule);

//? delete rule
ruleRoute.delete("/:id", Auth, rulePermission, deleteRule);


module.exports = ruleRoute;
