const { Router } = require("express");
const { getAttendance, clockIn, clockOut, sendRegulationMail, getAttendanceRegulation, addComment, statusChange, createNewAttendance } = require("../controller/attendanceController");
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
    check("id", "Id is a required field.").isMongoId()
]
const commentValidation = [
    check("attendanceRegulationId", "attendanceRegulation id is a required field.").isMongoId(),
    check('status', "Invalid status.Please enter the status value for Declined or Approved.").isIn(["Declined", "Approved"]),
]

const newAttendanceValidation = [
    check("userId", "UserId is a required field(mongoId).").isMongoId(),
    check("timestamp").isISO8601().withMessage('Invalid timestamp format. Use YYYY-MM-DD.').toDate(),
    check('time')
        .isArray({ min: 1 }).withMessage('Time must be a non-empty array')
        .custom((value) => {
            if (value && !value.every(item => typeof item === 'object')) {
                throw new Error('Each entry in time must be an object');
            }
            return true;
        }),

    // Validate clock_in - Required, must be in HH:mm:ss AM/PM format
    check('time.*.clock_in')
        .notEmpty().withMessage('Clock-in time is required').bail()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\s?(AM|PM)$/i)
        .withMessage('Clock-in must be in HH:mm:ss AM/PM format'),

    // Validate clock_out - Optional, must be in HH:mm:ss AM/PM format
    check('time.*.clock_out')
        .notEmpty().withMessage('Clock-out time is required').bail()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\s?(AM|PM)$/i)
        .withMessage('Clock-out must be in HH:mm:ss AM/PM format')
]
// 
route.post("/new", Auth, attendancePermission, newAttendanceValidation, createNewAttendance);
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