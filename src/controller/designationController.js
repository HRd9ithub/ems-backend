const designation = require("../models/designationSchema");
const expressValidator = require("express-validator");

// create designation function
const createDesignation = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        const response = await designation.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } });

        if (response && response.name.toLowerCase() == req.body.name.toLowerCase()) {
            return res.status(400).json({ success: false, error: ["Designation name already exists."] })
        }

        // not exists designation name for add database
        const designationData = new designation(req.body);
        const data = await designationData.save();
        return res.status(201).json({ success: true, message: "Data added successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update designation function
const updateDesignation = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // find designation name in database
        const data = await designation.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } });

        if (data && data._id != req.params.id && data.name.toLowerCase() == req.body.name.toLowerCase()) {
            // exists designation name for send message
            return res.status(400).json({ error: ["Designation name already exists."], success: false })
        }

        // not exists designation name for update database
        const response = await designation.findByIdAndUpdate({ _id: req.params.id }, req.body)

        if (response) {
            return res.status(200).json({ success: true, message: "Data updated successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Designation name is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update designation function
const deleteDesignation = async (req, res) => {
    try {
        const response = await designation.findByIdAndDelete({ _id: req.params.id })
        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Designation is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get designation function
const getDesignation = async (req, res) => {
    try {
        // get designation data in database
        const data = await designation.find()

        return res.status(200).json({ success: true, message: "Successfully fetch a designation data.", data: data, permissions: req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// check Designation existing function
const checkDesignation = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)
        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        const response = await designation.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } });

        if (response && response._id != req.body.id && response.name.toLowerCase() == req.body.name.toLowerCase()) {
            return res.status(400).json({ success: false, message: "Designation name already exists." })
        }
        return res.status(200).json({ success: true, message: "Designation name not exist" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error", success: false })
    }
}

module.exports = { createDesignation, updateDesignation, deleteDesignation, getDesignation, checkDesignation }