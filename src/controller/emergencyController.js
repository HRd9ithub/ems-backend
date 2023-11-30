const expressValidator = require("express-validator");
const emergency_contact = require("../models/emergencySchema");
const role = require("../models/roleSchema");
const createActivity = require("../helper/addActivity");
const encryptData = require("../helper/encrptData");

// create emergency detail function
const addEmergency = async (req, res) => {
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
        const data = await emergency_contact.findOne({ user_id: req.body.user_id })
        // role name get 
        let roleData = await role.findOne({ _id: req.user.role_id });

        let value = {
            name: encryptData(req.body.name),
            email: encryptData(req.body.email),
            phone: encryptData(req.body.phone),
            user_id: req.body.user_id,
            address: encryptData(req.body.address),
            relationship: encryptData(req.body.relationship)
        };

        if (data) {
            let response = await emergency_contact.findByIdAndUpdate({ _id: data._id }, value);
            if (response) {
                if (roleData.name.toLowerCase() !== "admin") {
                    createActivity(req.user._id, "Emergency contact detail updated by");
                }
                return res.status(200).json({ success: true, message: "Data updated successfully." })
            } else {
                return res.status(404).json({ success: false, message: "Record Not found." })
            }
        } else {
            const emergency_contactData = new emergency_contact(value);
            const response = await emergency_contactData.save();
            if (roleData.name.toLowerCase() !== "admin") {
                createActivity(req.user._id, "Emergency contact detail added by");
            }
            return res.status(201).json({ success: true, message: "Data added successfully." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}

module.exports = { addEmergency }