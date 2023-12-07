const express = require("express")
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { createAccount, updateAccount, getSingleAccount } = require("../controller/invoiceAccountController");
const route = express.Router();

const accountValidation = [
    check('bank', "Bank name field is required.").notEmpty(),
    check('name', "Name field is required.").notEmpty(),
    check('branch_name', "Branch name field is required.").notEmpty(),
    check('invoice_id', "invoice_id field is required.").isMongoId(),
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
route.post('/', Auth,accountValidation, createAccount);

// account detail update api
route.put('/:id', Auth,accountValidation, updateAccount);

// account detail get data single
route.get('/:invoiceId', Auth, getSingleAccount);


module.exports = route