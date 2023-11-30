const express = require("express")
var bodyParser = require('body-parser');
const expressValidator = require("express-validator");
const upload = require("../middlewares/ImageProfile");
const { createUser, activeUser, getUser, updateUser, deleteUser, updateStatusUser, checkEmail, checkEmployeeId, changeImage, changePassword, getLoginInfo, getUserName } = require("../controller/userController");
const Auth = require("../middlewares/authtication");
const user = require("../models/userSchema");
const { userPermission } = require("../middlewares/permission");
const { userValidation, passwordValidation } = require("../helper/validation");

const userRoute = express.Router();

userRoute.use(bodyParser.json())

userRoute.use(bodyParser.urlencoded({ extended: false }));

// user create api
userRoute.post('/', Auth,userPermission, userValidation, createUser)

// active user get api
userRoute.get('/:id', Auth,userPermission, activeUser);

// user listing api
userRoute.get('/', Auth,userPermission, getUser);

// update user api
userRoute.put('/:id', Auth, updateUser);

// DELETE user api
userRoute.delete('/:id', Auth,userPermission, deleteUser)

// update user status api
userRoute.patch('/:id', Auth,userPermission, updateStatusUser)

//check email  api
userRoute.post('/email', Auth, [expressValidator.body('email', "Email must be a valid email.").isEmail()], checkEmail)

// check employee id
userRoute.post('/employeeId', Auth, [expressValidator.body('employee_id', "Employee Id is Required.").notEmpty()], checkEmployeeId)

// change profile image
userRoute.post('/image', Auth, changeImage);

// change password image
userRoute.post('/password', Auth,passwordValidation, changePassword);

//get login info
userRoute.post('/loginInfo', Auth,userPermission,[expressValidator.body('startDate', "Start date is required.").notEmpty(),
expressValidator.body('endDate', "End date is required.").notEmpty(),
expressValidator.body('id', "Please Enter valid userId.").isMongoId(),
], getLoginInfo);

//get only use name
userRoute.post('/username', Auth, getUserName);

module.exports = userRoute