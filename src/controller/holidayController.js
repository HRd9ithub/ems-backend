const holiday = require("../models/holidaySchema");
const expressValidator = require("express-validator");

// create holiday function
const createHoliday = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        // add data in database
        const holidayData = new holiday(req.body);
        const response = await holidayData.save();
        return res.status(201).json({ success: true, message: "Data added successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update holiday function
const updateHoliday = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        const response = await holiday.findByIdAndUpdate({ _id: req.params.id }, req.body)
        if (response) {
            return res.status(200).json({ success: true, message: "Data updated successfully" })
        } else {
            return res.status(404).json({ success: false, message: "Holiday is not found." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update holiday function
const deleteHoliday = async (req, res) => {
    try {
        const response = await holiday.findByIdAndDelete({ _id: req.params.id })
        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Holiday is not found." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get holiday function
const getHoliday = async (req, res) => {
    try {
        // get holiday data in database
        const data = await holiday.find()

        return res.status(200).json({ success: true, message: "Successfully fetch a holiday data.", data: data,permissions: req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}



module.exports = { createHoliday, updateHoliday, deleteHoliday, getHoliday }