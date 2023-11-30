const leaveType = require("../models/leaveTypeSchema");
const expressValidator = require("express-validator");

// CREATE leaveType function
const createLeaveType = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // find leaveType name in database
        const data = await leaveType.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } })

        if (data && data.name.toLowerCase() == req.body.name.toLowerCase()) {
            return res.status(400).json({ error: "Leave Type already exists.", success: false })
        }
        // not exists leaveType name for add database
        const leaveTypeData = new leaveType(req.body);
        const RESPONSE = await leaveTypeData.save();
        return res.status(201).json({ success: true, message: "Data added successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update leaveType function
const updateLeaveType = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // find leaveType name in database
        const data = await leaveType.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } })

        if (data && data._id != req.params.id && data.name.toLowerCase() == req.body.name.toLowerCase()) {
            // exists leaveType name for send message
            return res.status(400).json({ error: "Leave Type already exists.", success: false })
        }

        // not exists leaveType name for update database
        const response = await leaveType.findByIdAndUpdate({ _id: req.params.id }, req.body)
        if (response) {
            return res.status(200).json({ success: true, message: "Data updated successfully." })
        } else {
            return res.status(404).json({ success: false, message: "LeaveType is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// delete leaveType function
const deleteLeaveType = async (req, res) => {
    try {
        const response = await leaveType.findByIdAndDelete({ _id: req.params.id })
        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        } else {
            return res.status(404).json({ success: false, message: "LeaveType is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get leaveType function
const getLeaveType = async (req, res) => {
    try {
        // get leaveType data in database
        const data = await leaveType.find()

        return res.status(200).json({ success: true, message: "Successfully fetch a leaveType data.", data: data, permissions: req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// check department existing function
const checkLeaveType = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)
        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }


        // find leaveType name in database
        const data = await leaveType.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } })

        if (data && data._id != req.params.id && data.name.toLowerCase() == req.body.name.toLowerCase()) {
            // exists leaveType name for send message
            return res.status(400).json({ error: "Leave Type already exists.", success: false })
        }

        return res.status(200).json({ success: true, message: "Leave Type not exist" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error", success: false })
    }
}

module.exports = { createLeaveType, updateLeaveType, deleteLeaveType, getLeaveType, checkLeaveType }