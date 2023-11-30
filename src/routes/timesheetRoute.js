const { Router } = require('express');
const timeSheetRouter = Router(); 
const Auth = require("../middlewares/authtication");
const { getTimeSheet } = require('../controller/timeSheetController');
const { timesheetPermission } = require('../middlewares/permission');

// Get all time sheet Routes
timeSheetRouter.get('/', Auth,timesheetPermission, getTimeSheet)

module.exports = timeSheetRouter