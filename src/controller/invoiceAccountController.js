const expressValidator = require("express-validator");
const invoice_account = require("../models/invoiceAccountSchema");
const encryptData = require("../helper/encrptData");
const decryptData = require("../helper/decryptData");

// add data
const createAccount = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)
        
        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        for (const key in req.body) {
            if (key !== "invoice_id") {
                req.body[key] = encryptData(req.body[key])
            }
        }

        const response = await invoice_account.create(req.body);
        return res.status(201).json({
            message: "Data added successfully.",
            success: true
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        });
    }
}

// update data
const updateAccount = async (req, res) => {
    try {
        const {id} = req.params;

        const errors = expressValidator.validationResult(req)
        
        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        for (const key in req.body) {
            if (key !== "invoice_id") {
                req.body[key] = encryptData(req.body[key])
            }
        }

        const response = await invoice_account.findByIdAndUpdate({_id : id},req.body);
        return res.status(200).json({
            message: "Data updated successfully.",
            success: true
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        });
    }
}

// single data get
const getSingleAccount = async(req,res) => {
    try {
        const {invoiceId} = req.params;
        
        const result = await invoice_account.findOne({invoice_id  : invoiceId});

        let decryptResult = "";
        if(result){
            decryptResult = {
                bank: decryptData(result.bank),
                account_number: decryptData(result.account_number),
                ifsc_code: decryptData(result.ifsc_code),
                branch_name: decryptData(result.branch_name),
                name: decryptData(result.name),
                invoice_id: result.invoice_id,
                createdAt: result.createdAt,
                _id : result._id
            }
        }
         
        return res.status(200).json({
            message: "Data fetch successfully.",
            success: true,
            data : decryptResult
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        });
    }
}

module.exports = { createAccount, updateAccount, getSingleAccount};