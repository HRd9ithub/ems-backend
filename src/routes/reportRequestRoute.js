const { Router } = require('express');
const ReportRequestRoute = Router();
const Auth = require('../middlewares/authtication');
const { check, validationResult } = require('express-validator');
const ReportRequestSchema = require('../models/reportRequestSchema');
const report = require('../models/workReportSchema');
const createActivity = require('../helper/addActivity');
const role = require('../models/roleSchema');
const getAdminEmail = require("../helper/getAdminEmail");
const workReportMail = require('../handler/workReportEmail');
const moment = require('moment');
const { default: mongoose } = require('mongoose');
const user = require('../models/userSchema');

// * check data 
const validation = [
    check("title", "Title is a required field.").notEmpty(),
    check("date", "Invalid Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: "YYYY-MM-DD" }),
    check("totalHours", "Total hours is a required field.").notEmpty(),
    check("extraTotalHours", "Extra total hours is a required field.").notEmpty(),
    check('work', "Insert values ​​into the array.").isArray(),
    check('work.*.projectId', "Project is a required field.").notEmpty(),
    check('work.*.description', "Description is a required field.").notEmpty(),
    check('work.*.hours', "Working hours is a required field.").notEmpty().custom(async (totalHours, { req }) => {
        if (totalHours && (totalHours.toString() > 24 || totalHours.toString() < 0)) {
            throw new Error('Working hours range from 0 to 24 hours.')
        }
    }),
    check('extraWork', "Extra work data Insert values ​​into the array.").isArray(),
    check('extraWork.*.projectId', "Extra project is a required field.").notEmpty(),
    check('extraWork.*.description', "Extra description is a required field.").notEmpty(),
    check('extraWork.*.hours', "Extra working hours is a required field.").notEmpty().custom(async (totalHours, { req }) => {
        if (totalHours && (totalHours.toString() > 24 || totalHours.toString() < 0)) {
            throw new Error('Extra working hours range from 0 to 24 hours.')
        }
    })
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
        let { work, date, totalHours, title, wortReportId, extraWork, extraTotalHours } = req.body;

        if (work.length < 1 && extraWork.length < 1) {
            return res.status(422).json({ error: ["Please add for work data or extra Work data, and try again."], success: false })
        }

        if (req.body.title === "Add Request") {
            let data = await report.findOne({ date: req.body.date, userId: req.user._id })

            if (data) return res.status(400).json({ success: false, message: "There is existing data for this date. Please modify the data in the edit request." })
        }

        // role name get 
        let roleData = await role.findOne({ _id: req.user.role_id });

        const reportRequestData = new ReportRequestSchema({
            title: title,
            userId: req.user._id,
            work,
            date,
            totalHours,
            wortReportId: wortReportId && wortReportId,
            extraWork,
            extraTotalHours
        })
        const reportRequestDataResponse = await reportRequestData.save();

        const emaiList = await getAdminEmail();

        const workData = await ReportRequestSchema.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(reportRequestDataResponse._id)
                }
            },
            {
                $unwind: {
                    path: '$extraWork',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'extraWork.projectId',
                    foreignField: '_id',
                    as: 'extraWork.project'
                }
            },
            {
                $unwind: {
                    path: '$extraWork.project',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    originalDocument: { $first: '$$ROOT' },
                    extraWork: { $push: '$extraWork' }
                }
            },
            {
                $addFields: {
                    'originalDocument.extraWork': {
                        $filter: {
                            input: '$extraWork',
                            as: 'ew',
                            cond: { $ne: ['$$ew', {}] }
                        }
                    }
                }
            },
            {
                $replaceRoot: { newRoot: '$originalDocument' }
            }, {
                $unwind: {
                    path: '$work',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'work.projectId',
                    foreignField: '_id',
                    as: 'work.project'
                }
            },
            {
                $unwind: {
                    path: '$work.project',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    originalDocument: { $first: '$$ROOT' },
                    work: { $push: '$work' }
                }
            },
            {
                $addFields: {
                    'originalDocument.work': {
                        $filter: {
                            input: '$work',
                            as: 'w',
                            cond: { $ne: ['$$w', {}] }  // This filters out empty objects from the array
                        }
                    }
                }
            },
            {
                $replaceRoot: { newRoot: '$originalDocument' }
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    userId: 1,
                    totalHours: 1,
                    work: 1,
                    extraWork: 1,
                    updatedAt: 1,
                    createdAt: 1,
                }
            }
        ])

        if (workData.length !== 0) {

            const workResult = workData[0].work?.map((val) => {
                return { description: val.description, hours: val.hours, project: val.project?.name }
            });

            let extraWork = workData[0].extraWork?.map((val) => {
                return { description: val.description, hours: val.hours, project: val.project?.name }
            });

            const contentData = {
                timestamp: moment(req.body.date).format("DD MMM YYYY"),
                name: req.user?.first_name.concat(" ", req.user.last_name),
                title: req.body.title,
                work: workResult,
                totalHours,
                isAdmin: false,
                extraWork
            }

            await workReportMail(res, emaiList, contentData)

            if (roleData.name.toLowerCase() !== "admin") {
                if (req.body.title === "Add Request") {
                    createActivity(req.user._id, "Add work report request added by")
                } else {
                    createActivity(req.user._id, "Edit work report request added by")
                }
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
        const reportRequestRoute = await ReportRequestSchema.findByIdAndUpdate({ _id: req.params.id }, { $set: { deleteAt: new Date() } });
        if (reportRequestRoute) {
            return res.status(200).json({ success: true, message: "Request has been successfully deleted." })
        } else {
            return res.status(404).json({ success: false, message: "Record is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }

})
// status change reportRequestRoutes
ReportRequestRoute.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;

        let reportRequestRoute = "";

        if (status === "Read") {
            reportRequestRoute = await ReportRequestSchema.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: status } });
        } else {
            reportRequestRoute = await ReportRequestSchema.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: status, deleteAt: new Date() } });

            if (reportRequestRoute) {
                const users = await user.findOne({ _id: reportRequestRoute.userId })

                await workReportMail(res, users.email, {
                    status: "Declined",
                    timestamp: moment(reportRequestRoute.date).format("DD MMM YYYY"),
                    name: users?.first_name.concat(" ", users.last_name),
                    isAdmin: true
                });
            }
        }
        if (reportRequestRoute) {
            return res.status(200).json({ success: true, message: "Status changed successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Record is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }

})

module.exports = ReportRequestRoute