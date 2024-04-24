const { Router } = require('express');
const leaveRouter = Router();
const Auth = require('../middlewares/authtication');
const { body } = require('express-validator');
const { addLeave, getLeave, singleGetLeave, updateLeave, changeStatus, getNotifications, deleteLeave, notificationDelete, getAllNotifications } = require('../controller/leaveController');
const { leavePermission, notificationPermission } = require('../middlewares/permission');

// Get all leave
leaveRouter.get('/', Auth, leavePermission, getLeave)

// Create a new leave
leaveRouter.post('/', Auth, leavePermission, [
    body("leave_type_id", "Leave type id field is Required.").isMongoId(),
    body('from_date', "Invalid From Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: 'YYYY-MM-DD' }),
    body('to_date', "Invalid To Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: 'YYYY-MM-DD' }),
    body('duration', "Duration field is Required.").notEmpty(),
    body('leave_for', "Invalid leave status. Please enter the leave status value for Full or First Half or Second Half.").isIn(['Full', 'First Half', 'Second Half']),
    body('reason', "Reason field is Required.").notEmpty(),
    body('status', "Status field is Required.").isIn(['Pending', 'Approved', "Declined"])
], addLeave)

// Get leave By ID
leaveRouter.get('/:id', Auth, singleGetLeave)

// Update leave By ID
leaveRouter.put('/:id', Auth, leavePermission, [
    body("leave_type_id", "Leave type id field is Required.").isMongoId(),
    body('from_date', "Invalid From Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: 'YYYY-MM-DD' }),
    body('to_date', "Invalid To Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: 'YYYY-MM-DD' }),
    body('duration', "Duration field is Required.").notEmpty(),
    body('leave_for', "Invalid leave status. Please enter the leave status value for Full or First Half or Second Half.").isIn(['Full', 'First Half', 'Second Half']),
    body('reason', "Reason field is Required.").notEmpty(),
    body('status', "Status field is Required.").isIn(['Pending', 'Approved', "Declined", "Read"])
], updateLeave)

// status change by id
leaveRouter.patch('/:id', Auth, leavePermission, [body('status', "Status field is Required.").isIn(['Pending', 'Approved', "Declined", "Read"])], changeStatus)

// all record status
leaveRouter.post('/status', Auth, leavePermission, notificationDelete)

leaveRouter.post('/notification', Auth, getNotifications)
leaveRouter.post('/notification/all', Auth, notificationPermission, getAllNotifications);

leaveRouter.delete('/:id', Auth, deleteLeave);

module.exports = leaveRouter