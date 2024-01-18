const { Router } = require("express");
const { getAttendance, clockIn, clockOut, sendRegulationMail, getAttendanceRegulation, addComment, statusChange } = require("../controller/attendanceController");
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { attendancePermission } = require("../middlewares/permission");

const route = Router();

// validation part
const clockInvalidation = [
    check("clock_in", "clock in time is a required field.").notEmpty()
]
const clockOutvalidation = [
    check("clock_out", "clock out time is a required field.").notEmpty(),
]
const regulationValidation = [
    check("clockIn", "Clock in time is a required field.").notEmpty(),
    check("clockOut", "Clock out time is a required field.").notEmpty(),
    check("explanation", "Explanation is a required field.").notEmpty(),
    check("timestamp", "Timestamp is a required field.").notEmpty(),
    check("userId", "User id is a required field.").isMongoId(),
]
const commentValidation = [
    check("attendanceRegulationId", "attendanceRegulation id is a required field.").isMongoId(),
    check('status', "Invalid status.Please enter the status value for Declined or Approved.").isIn(["Declined", "Approved"]),
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

// status change
route.patch('/:id', Auth, statusChange)


module.exports = route;