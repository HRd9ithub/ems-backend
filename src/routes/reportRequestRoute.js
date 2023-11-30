const { Router } = require('express');
const ReportRequestRoute = Router();
const Auth = require('../middlewares/authtication');
const { check, validationResult } = require('express-validator');
const ReportRequestSchema = require('../models/reportRequestSchema');
const report = require('../models/workReportSchema');
const createActivity = require('../helper/addActivity');
const role = require('../models/roleSchema');

// * check data 
const validation = [
    check("description", "Description is a required field.").notEmpty(),
    check("title", "Title is a required field.").notEmpty(),
    check("date", "date is a required field.").notEmpty()
]

// Create a new reportRequestRoute
ReportRequestRoute.post('/', Auth, validation, async (req, res) => {
    try {
        const errors = validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: [...new Set(err)], success: false })
        }
        if (req.body.title === "Add Request") {
            let data = await report.findOne({ date: req.body.date, userId: req.user._id })

            if (data) return res.status(400).json({ success: false, message: "There is existing data for this date. Please modify the data in the edit request." })
        }

        // role name get 
        let roleData = await role.findOne({ _id: req.user.role_id });

        let reportRequestData = new ReportRequestSchema({
            userId: req.user._id,
            description: req.body.description,
            title: req.body.title,
            date: req.body.date
        })
        await reportRequestData.save();

        if (roleData.name.toLowerCase() !== "admin") {
            if (req.body.title === "Add Request") {
                createActivity(req.user._id, "Add work report request added by")
            } else {
                createActivity(req.user._id, "Edit work report request added by")
            }
        }

        return res.status(201).json({ success: true, message: "Your request has been sent successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
})
// delete reportRequestRoutes
ReportRequestRoute.delete('/:id', async (req, res) => {
    try {
        const reportRequestRoute = await ReportRequestSchema.findByIdAndDelete(req.params.id);
        if (reportRequestRoute) {
            return res.status(200).json({ success: true, message: "Request has been successfully deleted." })
        } else {
            return res.status(404).json({ success: false, message: "Record is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }

})

module.exports = ReportRequestRoute