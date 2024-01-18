const expressValidator = require("express-validator");
const moment = require("moment");
const attendance = require("../models/attendanceSchema");
const { default: mongoose } = require("mongoose");
const decryptData = require("../helper/decryptData");
const user = require("../models/userSchema");
const regulationMail = require("../handler/regulationEmail");
const Attendance_Regulation = require("../models/attendanceRegulationSchema");
const getAdminEmail = require("../helper/getAdminEmail");

// add clockIn time
const clockIn = async (req, res) => {
    try {

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        const data = {
            userId: req.user._id,
            timestamp: moment(new Date()).format("YYYY-MM-DD"),
            clock_in: req.body.clock_in
        }

        // add database data
        let response = await attendance.create(data)

        return res.status(201).json({
            message: "Data added successfully.",
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error",
            success: false
        })
    }
}

// add logout time
const clockOut = async (req, res) => {
    try {

        const { id } = req.params;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        const record = await attendance.findOne({ _id: id })

        // generate total hours
        req.body.totalHours = moment.utc(moment(req.body.clock_out, "HH:mm:ss A").diff(moment(record.clock_in, "HH:mm:ss A"))).format("HH:mm")

        const attendanceData = await attendance.findByIdAndUpdate({ _id: id }, req.body)

        if (attendanceData) {
            return res.status(200).json({
                message: "Data updated successfully.",
                success: true
            })
        } else {
            return res.status(404).json({
                message: "Record not found.",
                success: false
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error",
            success: false
        })
    }
}

// get list of attendance
const getAttendance = async (req, res) => {
    try {
        const { id, startDate, endDate } = req.query;

        const identify = req.permissions?.name?.toLowerCase() !== "admin";

        const value = await attendance.aggregate([
            {
                $match: {
                    $and: [
                        { timestamp: { $gte: new Date(startDate) } },
                        { timestamp: { $lte: new Date(endDate) } }
                    ],
                    userId: !identify ? { $nin: [] } : { $eq: new mongoose.Types.ObjectId(req.user._id) }
                }
            },
            {
                $group:
                {
                    _id: {
                        date: "$timestamp",
                        userId: "$userId"
                    },
                    "child": { "$push": "$$ROOT" },
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    "path": "$user",
                }
            },
            {
                $lookup: {
                    from: "attendance_regulations",
                    localField: "child._id",
                    foreignField: "attendanceId",
                    pipeline: [
                        {
                            $match: {
                                "deleteAt": { $exists: false },
                            }
                        }
                    ], as: "attendance_regulations_data"
                }
            },
            {
                $unwind: {
                    "path": "$attendance_regulations_data",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $match: {
                    "user.delete_at": { $exists: false },
                    "user.joining_date": { "$lte": new Date(moment(new Date()).format("YYYY-MM-DD")) },
                    $or: [
                        { "user.leaveing_date": { $eq: null } },
                        { "user.leaveing_date": { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
                    ]
                }
            },
            { $sort: { "_id.date": -1 } },
            {
                $project: {
                    child: 1,
                    "user.first_name": 1,
                    "user.last_name": 1,
                    attendance_regulations_data: 1
                }
            }
        ])

        const result = value.map((val) => {
            return {
                ...val,
                user: {
                    name: decryptData(val.user.first_name).concat(" ", decryptData(val.user.last_name)),
                    status: val.user.status,
                }
            }
        })

        const currentData = await attendance.find({ timestamp: moment(new Date()).format("YYYY-MM-DD"), userId: req.user._id }).sort({ createdAt: -1 });


        return res.status(200).json({
            success: true,
            message: 'Successfully fetched data',
            data: result,
            currentData,
            permissions: req.permissions
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error",
            success: false
        })
    }
}

// regulation mail send function
const sendRegulationMail = async (req, res) => {
    try {
        const { clockIn, clockOut, explanation, userId, timestamp, id } = req.body;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        const userData = await user.findOne({ _id: userId })
        if (!userData) {
            return res.status(404).json({ success: false, message: 'Employee not found' })
        }
        const name = userData.first_name.concat(" ", userData.last_name);

        const Attendance_Regulation_data = await Attendance_Regulation.findOne({ attendanceId: id, deleteAt: { $exists: false } })
        if (Attendance_Regulation_data) {
            return res.status(422).json({ success: false, error: ["The request already exists."] })
        }
        // get email id for send mail
        const maillist = await getAdminEmail();

        const convertDate = moment(timestamp).format("DD MMM YYYY");

        const contentData = {
            clock_in_time : clockIn, clock_out_time : clockOut, explanation, timestamp :convertDate , name,isAdmin :true
        }

        await regulationMail(res, maillist, contentData);

        await Attendance_Regulation.create({
            userId,
            clock_in: clockIn,
            clock_out: clockOut,
            explanation,
            attendanceId: id
        })

        return res.status(200).json({ message: "Request sent successfully.", success: true })

    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// 
const getAttendanceRegulation = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Attendance_Regulation.aggregate([
            {
                $match: {
                    attendanceId: new mongoose.Types.ObjectId(id),
                    deleteAt: { $exists: false }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "attendances",
                    localField: "attendanceId",
                    foreignField: "_id",
                    as: "attendance"
                }
            },
            {
                $unwind: {
                    path: "$attendance",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    clock_in: 1,
                    attendanceId: 1,
                    clock_out: 1,
                    explanation: 1,
                    "user.first_name": 1,
                    "user.last_name": 1,
                    "attendance.timestamp": 1
                }
            }
        ]);

        // data decrypt
        const result = data.map((val) => {
            return {
                ...val,
                user: {
                    name: decryptData(val.user.first_name).concat(" ", decryptData(val.user.last_name)),
                }
            }
        })

        return res.status(200).json({ data: result, success: true, permissions: req.permissions })

    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server error.", success: false })
    }
}

// ADD COMMENT 
const addComment = async (req, res) => {
    try {
        const { comment, status, attendanceRegulationId, clock_in, clock_out } = req.body;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        // generate total hours
        req.body.totalHours = moment.utc(moment(clock_out, "HH:mm:ss A").diff(moment(clock_in, "HH:mm:ss A"))).format("HH:mm")
        
        const contentData = {
            isAdmin :false, status: status,comment, action_url : `${process.env.RESET_PASSWORD_URL}/attendance`
        }

        const response = await attendance.findByIdAndUpdate({ _id: attendanceRegulationId }, { $set: { clock_in, clock_out, totalHours: req.body.totalHours } })
        const userData = await user.findOne({_id : response.userId},{email : 1})
        await regulationMail(res,userData.email, contentData);

        await Attendance_Regulation.updateMany({ attendanceId: attendanceRegulationId }, { $set: {  comment, status, deleteAt : new Date()} })

        return res.status(200).json({ message: "Data added successfully.", success: true })
    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server error.", success: false })
    }
}

// status change
const statusChange = async(req,res)=> {
    try {
        const { id } = req.params;

        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        const response = await Attendance_Regulation.findByIdAndUpdate({ _id: id }, { $set: { status : "Read" } })

        return res.status(200).json({ message: "Status updated successfully.", success: true })
    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server error.", success: false })
    }
}

module.exports = { clockIn, clockOut, getAttendance, sendRegulationMail, getAttendanceRegulation, addComment, statusChange }