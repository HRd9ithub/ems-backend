const moment = require('moment');
const { Router } = require('express');
const Auth = require('../middlewares/authtication');
const user = require('../models/userSchema');
const Leave = require('../models/leaveSchema');
const holiday = require('../models/holidaySchema');
const { default: mongoose } = require('mongoose');
const decryptData = require('../helper/decryptData');
const DashboardRoute = Router();

// Get all DashboardRoutes
DashboardRoute.get('/', Auth, async (req, res) => {
    try {
        let date = new Date().toISOString()
        // total employee count
        const value = await user.aggregate([
            {
                $match: {
                    // status: "Active",
                    delete_at: { $exists: false },
                    joining_date: { "$lte": new Date(moment(new Date()).format("YYYY-MM-DD")) },
                    $or: [
                        { leaveing_date: { $eq: null } },
                        { leaveing_date: { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
                    ]
                }
            },
            {
                $lookup: {
                    from: "roles", localField: "role_id", foreignField: "_id", as: "role"
                }
            },
            { $unwind: { path: "$role" } },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$role.name", "admin"] },
                            { $ne: ["$role.name", "Admin"] },
                        ],
                    },
                }
            },
            {
                $project: {
                    "_id": 1
                }
            }
        ])

        const inActiveEmployee = await user.aggregate([
            {
                $match: {
                    status: { $ne: "Active" },
                    delete_at: { $exists: false },
                    joining_date: { "$lte": new Date(moment(new Date()).format("YYYY-MM-DD")) },
                    $or: [
                        { leaveing_date: { $eq: null } },
                        { leaveing_date: { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
                    ]
                }
            },
            {
                $lookup: {
                    from: "roles", localField: "role_id", foreignField: "_id", as: "role"
                }
            },
            { $unwind: { path: "$role" } },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$role.name", "admin"] },
                            { $ne: ["$role.name", "Admin"] },
                        ],
                    },
                }
            },
            {
                $project: {
                    "_id": 1
                }
            }
        ])

        // leave request count
        const leaveRequest = await Leave.aggregate([
            { $match: { status: "Pending", deleteAt: { $exists: false } } },
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
                $unwind:
                {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "user.status": "Active",
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
        const leaveRequestData = leaveRequest.map((val) => {
            return {
                ...val,
                user: {
                    first_name: decryptData(val.user.first_name),
                    last_name: decryptData(val.user.last_name),
                    status: val.user.status,
                }
            }
        })

        // today absent full leave list
        const FullLeaveToday = await Leave.aggregate([{
            $match: {
                $expr: {
                    $and: [
                        { $eq: ["$status", "Approved"] },
                        { $lte: ["$from_date", moment(new Date()).format("YYYY-MM-DD")] },
                        { $gte: ["$to_date", moment(new Date()).format("YYYY-MM-DD")] },
                    ]
                },
                leave_for: { $nin: ["Half", "First Half", "Second Half"] },
                deleteAt: { $exists: false }
            },
        },
        {
            $lookup: {
                from: 'users',
                let: { user_id: '$user_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$user_id'] },
                            delete_at: { $exists: false },
                            status: "Active",
                            joining_date: { $lte: new Date(moment(new Date()).format('YYYY-MM-DD')) },
                            $or: [
                                { leaveing_date: { $eq: null } },
                                { leaveing_date: { $gt: new Date(moment(new Date()).format('YYYY-MM-DD')) } }
                            ]
                        }
                    },
                    { $project: { first_name: 1, last_name: 1, status: 1, employee_id: 1, profile_image: 1 } }
                ],
                as: 'user'
            }
        },
        { $unwind: { path: "$user" } },
        {
            $project: {
                user_id: 1,
                user: 1,
                from_date: 1,
                to_date: 1
            }
        },
        ])

        // today absent half leave list
        const HalfLeaveToday = await Leave.aggregate([{
            $match: {
                $expr: {
                    $and: [
                        { $eq: ["$status", "Approved"] },
                        { $lte: ["$from_date", moment(new Date()).format("YYYY-MM-DD")] },
                        { $gte: ["$to_date", moment(new Date()).format("YYYY-MM-DD")] },
                    ]
                },
                leave_for: { $nin: ["Full"] },
                deleteAt: { $exists: false }
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { user_id: '$user_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$user_id'] },
                            delete_at: { $exists: false },
                            status: "Active",
                            joining_date: { $lte: new Date(moment(new Date()).format('YYYY-MM-DD')) },
                            $or: [
                                { leaveing_date: { $eq: null } },
                                { leaveing_date: { $gt: new Date(moment(new Date()).format('YYYY-MM-DD')) } }
                            ]
                        }
                    },
                    { $project: { first_name: 1, last_name: 1, status: 1, employee_id: 1, profile_image: 1 } }
                ],
                as: 'user'
            }
        },
        { $unwind: { path: "$user" } },
        {
            $project: {
                user_id: 1,
                user: 1,
                "leave_for": 1,
                from_date: 1,
                to_date: 1
            }
        },
        ])

        const absentToday = [...HalfLeaveToday, ...FullLeaveToday];

        // holiday list get
        const holidayDay = await holiday.find();

        // birthday list 
        const birthDay = await user.find({
            status: "Active",
            delete_at: { $exists: false },
            date_of_birth: { $exists: true },
            $or: [{ leaveing_date: { $exists: false } }, { leaveing_date: { $gt: new Date() } }],
        }, { employee_id: 1, first_name: 1, last_name: 1, profile_image: 1, date_of_birth: 1 });

        res.status(200).json({
            totalEmployee: value.length,
            leaveRequest: leaveRequest.length,
            presentToday: value.length - FullLeaveToday.length - inActiveEmployee.length,
            absentTodayCount: FullLeaveToday.length,
            halfLeaveToday: HalfLeaveToday.length,
            inActiveEmployee: inActiveEmployee.length,
            absentToday: absentToday.map((val) => {
                return {
                    ...val,
                    user: {
                        first_name: decryptData(val.user.first_name),
                        last_name: decryptData(val.user.last_name),
                        status: val.user.status,
                    }
                }
            }),
            holidayDay,
            birthDay,
            leaveRequestData,
            success: true
        })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
})


module.exports = DashboardRoute