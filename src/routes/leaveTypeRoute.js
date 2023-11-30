const express = require("express")
const expressValidator = require("express-validator");
const Auth = require("../middlewares/authtication");
const { createLeaveType,checkLeaveType ,getLeaveType, deleteLeaveType, updateLeaveType} = require("../controller/leaveTypeController");
const { leaveTypePermission } = require("../middlewares/permission");

const leaveTypeRoute = express.Router();

// create leave type api
leaveTypeRoute.post('/', Auth,leaveTypePermission,[expressValidator.body("name","Leave type name is Required.").notEmpty()], createLeaveType);

// update leave type api
leaveTypeRoute.patch('/:id',Auth,leaveTypePermission,[expressValidator.body("name","Leave type name is Required.").notEmpty()],Auth,updateLeaveType);

// delete leave type api
leaveTypeRoute.delete('/:id',Auth,leaveTypePermission,deleteLeaveType);

// get leave type api
leaveTypeRoute.get('/',Auth,leaveTypePermission,getLeaveType);

// check DEPARTMENT
leaveTypeRoute.post('/name', Auth, [expressValidator.body("name","Leave type name is Required.").notEmpty()],checkLeaveType)

module.exports = leaveTypeRoute;