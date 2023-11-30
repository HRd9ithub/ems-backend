let expressValidator = require("express-validator");
const Leave = require("../models/leaveSchema");
const moment = require("moment");
const ReportRequestSchema = require("../models/reportRequestSchema");
const { default: mongoose } = require("mongoose");
const createActivity = require("../helper/addActivity");
const role = require("../models/roleSchema");
const decryptData = require("../helper/decryptData");

// add leave
const addLeave = async (req, res) => {
    let { user_id, leave_type_id, from_date, to_date, leave_for, duration, reason, status } = req.body;
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        let checkData = await Leave.find({
            user_id: user_id || req.user._id,
            $or: [
                {
                    $and: [
                        { 'from_date': { $gte: from_date } },
                        { 'from_date': { $lte: to_date } },
                    ]
                },
                {
                    $and: [
                        { 'to_date': { $gte: from_date } },
                        { 'to_date': { $lte: to_date } },
                    ]
                }
            ],
            status: { $ne: "Declined" }
        })

        if (checkData.length !== 0) return res.status(400).json({ error: ["It appears that the date you selected for leave has already been used."], success: false })

        let leaveRoute = new Leave({ user_id: user_id || req.user._id, leave_type_id, from_date, to_date, leave_for, duration, reason, status })
        let response = await leaveRoute.save()

        if (req.permissions.name.toLowerCase() !== "admin") {
            createActivity(req.user._id, "Leave added by")
        }
        res.status(201).json({ message: "Data added successfully.", success: true, checkData: checkData })
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get leave
const getLeave = async (req, res) => {
    let { id, startDate, endDate } = req.query;
    try {
        // date validation
        var a = moment(startDate, "YYYY-MM-DD");
        var b = moment(endDate, "YYYY-MM-DD");
        a.isValid();
        if (!a.isValid() || !b.isValid()) {
            return res.status(400).json({ message: "Please enter startDate and endDate.", success: false })
        }

        // check for id 
        let identify = id || req.permissions.name.toLowerCase() !== "admin";

        // get data for leave
        let leaveData = await Leave.aggregate([
            {
                $match: {
                    user_id: !identify ? { $nin: [] } : { $eq: new mongoose.Types.ObjectId(id || req.user._id) },
                    $and: [
                        { from_date: { $gte: moment(startDate).format("YYYY-MM-DD") } },
                        { to_date: { $lte: moment(endDate).format("YYYY-MM-DD") } }
                    ],
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $lookup:
                {
                    from: "leavetypes",
                    localField: "leave_type_id",
                    foreignField: "_id",
                    as: "leaveType"
                }
            },
            {
                $unwind:
                {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "user_id": 1,
                    "leave_type_id": 1,
                    "from_date": 1,
                    "to_date": 1,
                    "leave_for": 1,
                    "duration": 1,
                    "reason": 1,
                    "status": 1,
                    "createdAt": 1,
                    "leaveType": { $first: "$leaveType.name" },
                    "user.employee_id": 1,
                    "user.profile_image": 1,
                    "user.first_name": 1,
                    "user.last_name": 1,
                    "user.status": 1,
                }
            }
        ]);

        // data decrypt 
        let result = leaveData.map((val) => {
            return {
                ...val,
                user: {
                    first_name: decryptData(val.user.first_name),
                    last_name: decryptData(val.user.last_name),
                    status: val.user.status,
                }
            }
        })

        return res.status(200).json({ message: "Leave data fetch successfully.", success: true, data: result, permissions: req.permissions })
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// single get leave 
const singleGetLeave = async (req, res) => {
    try {
        let { id } = req.params;

        const leaveData = await Leave.findOne({ _id: id })

        res.status(200).json({ message: "Leave data fetch successfully.", success: true, data: leaveData })
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update leave
const updateLeave = async (req, res) => {
    let { user_id, leave_type_id, from_date, to_date, leave_for, duration, reason, status } = req.body;
    let { id } = req.params;
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        let checkData = await Leave.find({
            user_id: user_id || req.user._id,
            $or: [
                {
                    $and: [
                        { 'from_date': { $gte: from_date } },
                        { 'from_date': { $lte: to_date } },
                        { "_id": { $ne: id } }
                    ]
                },
                {
                    $and: [
                        { 'to_date': { $gte: from_date } },
                        { 'to_date': { $lte: to_date } },
                        { "_id": { $ne: id } }
                    ]
                }
            ],
            status: { $ne: "Declined" }
        });

        if (checkData.length !== 0) return res.status(400).json({ error: ["It appears that the date you selected for leave has already been used."], success: false })


        const leave_detail = await Leave.findByIdAndUpdate({ _id: id }, {
            user_id: user_id || req.user._id, leave_type_id, from_date, to_date, leave_for, duration, reason, status
        }, { new: true })

        if (leave_detail) {
            if (req.permissions.name.toLowerCase() !== "admin") {
                createActivity(req.user._id, "Leave updated by")
            }
            return res.status(200).json({ message: "Data updated successfully.", success: true })
        } else {
            return res.status(404).json({ message: "Leave is not found.", success: false })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// change status by id
const changeStatus = async (req, res) => {
    let { id } = req.params;
    let { status } = req.body;
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        const leave_detail = await Leave.findByIdAndUpdate({ _id: id }, {
            status
        }, { new: true })

        if (leave_detail) {
            return res.status(200).json({ message: "Status Updated successfully.", success: true })
        } else {
            return res.status(404).json({ message: "Leave is not found.", success: false })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// change status view all
const allChangeStatus = async (req, res) => {
    try {
        let { key } = req.query;
        const leave_detail = await Leave.updateMany({ status: "Pending" }, {
            status: "Read"
        }, { new: true });
        if (key) {
            let result = await ReportRequestSchema.deleteMany({})
        }

        return res.status(200).json({ message: "Status Updated successfully.", success: true })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

const getNotifications = async (req, res) => {
    try {
        let leaveData = await Leave.aggregate([
            { $match: { status: "Pending" } },
            {
                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $match: {
                    // "user.status": "Active",
                    "user.delete_at": { $exists: false },
                    "user.joining_date": { "$lte": new Date(moment(new Date()).format("YYYY-MM-DD")) },
                    $or: [
                        { "user.leaveing_date": { $eq: null } },
                        { "user.leaveing_date": { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
                    ]
                }

            },
            {
                $lookup:
                {
                    from: "leavetypes",
                    localField: "leave_type_id",
                    foreignField: "_id",
                    as: "leaveType"
                }
            },
            {
                $unwind:
                {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "user_id": 1,
                    "leave_type_id": 1,
                    "createdAt": 1,
                    "from_date": 1,
                    "to_date": 1,
                    "leave_for": 1,
                    "duration": 1,
                    "reason": 1,
                    "status": 1,
                    "leaveType": { $first: "$leaveType.name" },
                    "user.employee_id": 1,
                    "user.profile_image": 1,
                    "user.first_name": 1,
                    "user.last_name": 1,
                    "user.status": 1,
                }
            }
        ])
        let result = await ReportRequestSchema.aggregate([
            {
                $lookup:
                    { from: "users", localField: 'userId', foreignField: "_id", as: 'user' }
            },
            {
                $unwind:
                {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { "createdAt": -1 } },
            {
                $project: {
                    userId: 1,
                    createdAt: 1,
                    title: 1,
                    description: 1,
                    date: 1,
                    "user.employee_id": 1,
                    "user.profile_image": 1,
                    "user.first_name": 1,
                    "user.last_name": 1,
                    "user.status": 1
                }
            }
        ])
        let totalNotification = leaveData.concat(result);

        let notification = totalNotification.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt)
        })

        let finalData = notification.map((val) => {
            return {
                ...val,
                user: {
                    first_name: decryptData(val.user.first_name),
                    last_name: decryptData(val.user.last_name),
                    status: val.user.status,
                    profile_image: val.user.profile_image,
                }
            }
        })
        res.status(200).json({ message: "Notification data fetch successfully.", success: true, notification: finalData })
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// delete leave
const deleteLeave = async (req, res) => {
    try {
        let { id } = req.params;

        const deletedUser = await Leave.findByIdAndDelete({ _id: id });

        if (deletedUser) {
            let roleData = await role.findOne({ _id: req.user.role_id });
            if (roleData.name.toLowerCase() !== "admin") {
                createActivity(req.user._id, "Leave deleted by")
            }
            return res.status(200).json({ success: true, message: "Data deleted successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Record is not found." });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server errror." })
    }
}

module.exports = { addLeave, getLeave, singleGetLeave, updateLeave, deleteLeave, changeStatus, allChangeStatus, getNotifications }