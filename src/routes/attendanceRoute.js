const { Router } = require("express");
const { getAttendance, clockIn, clockOut, sendRegulationMail, getAttendanceRegulation, addComment } = require("../controller/attendanceController");
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { attendancePermission } = require("../middlewares/permission");

const route = Router();

// validation part
const clockInvalidation = [
    check("clock_in", "clock in time is required.").notEmpty()
]
const clockOutvalidation = [
    check("clock_out", "clock out time is required.").notEmpty(),
]
const regulationValidation = [
    check("clockIn", "Clock in time is required field.").notEmpty(),
    check("clockOut", "Clock out time is required field.").notEmpty(),
    check("explanation", "Explanation is required field.").notEmpty(),
    check("timestamp", "Timestamp is required field.").notEmpty(),
    check("userId", "User id is required field.").isMongoId(),
]
const commentValidation = [
    check("comment", "Comment is required field.").notEmpty(),
    check("attendanceRegulationId", "attendanceRegulation id is required field.").isMongoId(),
    check('status', "Invalid status.Please enter the status value for Reject or Approved.").isIn(["Reject", "Approved"]),
]

// add clock-in time for route
route.post("/", Auth, attendancePermission, clockInvalidation, clockIn);

// add clock-out time for route
route.put("/:id", Auth, attendancePermission, clockOutvalidation, clockOut);

// all data get for route
route.get("/", Auth, attendancePermission, getAttendance);

// regulation email send route
route.post("/regulation", Auth, regulationValidation, sendRegulationMail);

// regulationget single data
route.get("/regulation/:id", Auth, attendancePermission, getAttendanceRegulation);

// ADD COMMENT 
route.post('/comment', Auth, commentValidation, addComment)


module.exports = route;