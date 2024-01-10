const express = require("express");
const Auth = require("../middlewares/authtication");
const { createLeaveSetting, getLeaveSetting, updateLeaveSetting } = require("../controller/leaveSettingController");
const { body } = require("express-validator");
const { leaveSettingPermission } = require("../middlewares/permission");
const route = express.Router();

// validation for field
const leaveSettingValidation = [
    body("leaveTypeId", "Leave type id is a required field.").isMongoId(),
    body("totalLeave", "Total leave is a required field.").isNumeric()
]

// midderware use for
route.use(Auth);
route.use(leaveSettingPermission);

route.post("/",leaveSettingValidation,createLeaveSetting);

route.put("/:id",leaveSettingValidation,updateLeaveSetting);

route.get("/",getLeaveSetting);


module.exports = route;