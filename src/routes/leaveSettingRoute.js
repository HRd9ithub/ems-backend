const express = require("express");
const Auth = require("../middlewares/authtication");
const { createLeaveSetting, getLeaveSetting, updateLeaveSetting, deleteLeaveSetting } = require("../controller/leaveSettingController");
const { body } = require("express-validator");
const route = express.Router();

// validation for field
const leaveSettingValidation = [
    body("leaveTypeId", "Leave type id is a required field.").isMongoId(),
    body("userId", "User id is a required field.").isMongoId(),
    body("totalLeave", "Total leave is a required field.").isNumeric()
]

// midderware use for
route.use(Auth);

route.post("/",leaveSettingValidation,createLeaveSetting);

route.put("/:id",leaveSettingValidation,updateLeaveSetting);

route.delete("/:id",deleteLeaveSetting);

route.get("/:userId",getLeaveSetting);


module.exports = route;