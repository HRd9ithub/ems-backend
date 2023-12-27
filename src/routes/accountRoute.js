const express = require("express")
const Auth = require("../middlewares/authtication");
const { addAccount } = require("../controller/accountController");
const { check } = require("express-validator");
const accountRoute = express.Router();


let accountValidation = [
    check('bank_name', "Bank name is a required field.").notEmpty(),
    check('user_id', "User id is Required.").isMongoId(),
    check('name', "Name is a required field.").notEmpty(),
    check('branch_name', "Branch name is a required field.").notEmpty(),
    check("account_number", "Account number is a required field.").notEmpty(),
    check("ifsc_code", "IFSC code is a required field.").notEmpty()
]


// account detail add api
accountRoute.post('/', Auth,accountValidation, addAccount)


module.exports = accountRoute