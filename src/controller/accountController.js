const expressValidator = require("express-validator");
const account = require("../models/accountSchema");
const role = require("../models/roleSchema");
const createActivity = require("../helper/addActivity");
const encryptData = require("../helper/encrptData");

// * ===>  create ACCOUNT detail function
const addAccount = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        // check data exist or not
        const data = await account.findOne({ user_id: req.body.user_id })
        let roleData = await role.findOne({ _id: req.user.role_id });

        let value = {
            bank_name: encryptData(req.body.bank_name),
            account_number: encryptData(req.body.account_number),
            ifsc_code: encryptData(req.body.ifsc_code),
            user_id: req.body.user_id,
            name: encryptData(req.body.name),
            branch_name: encryptData(req.body.branch_name)
        };
        
        if (data) {
            let response = await account.findByIdAndUpdate({ _id: data._id }, value);
            if (response) {
                if (roleData.name.toLowerCase() !== "admin") {
                    createActivity(req.user._id, "Account detail updated by");

                }
                return res.status(200).json({ success: true, message: "Data updated Successfully." })
            } else {
                return res.status(400).json({ success: false, message: "Record Not found." })
            }
        } else {
            const accountData = new account(value);
            const response = await accountData.save();
            if (roleData.name.toLowerCase() !== "admin") {
                createActivity(req.user._id, "Account detail added by");
            }
            return res.status(201).json({ success: true, message: "Data added Successfully." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}

module.exports = { addAccount }