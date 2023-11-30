const express = require("express")
const Auth = require("../middlewares/authtication");
const { addAccount } = require("../controller/accountController");
const { check } = require("express-validator");
const accountRoute = express.Router();


let accountValidation = [
    check('bank_name', "Bank name field is required.").notEmpty(),
    check('user_id', "User id is Required.").isMongoId(),
    check('name', "Name field is required.").notEmpty(),
    check('branch_name', "Branch name field is required.").notEmpty(),
    check("account_number", "Account number is Required.").notEmpty().custom(async (account_number, { req }) => {
        if (account_number && account_number.toString().length < 12) {
            throw new Error('Account number must be at least 12 character.')
        }
    }),
    check("ifsc_code", "IFSC code is Required.").notEmpty().custom(async (ifsc_code, { req }) => {
        if (ifsc_code && ifsc_code.toString().length !== 11) {
            throw new Error('IFSC code must be at least 11 character.')
        }
    })
]


// account detail add api
accountRoute.post('/', Auth,accountValidation, addAccount)


module.exports = accountRoute