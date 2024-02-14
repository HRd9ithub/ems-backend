const expressValidator = require("express-validator")
const leave_setting = require("../models/leaveSettingSchema")
const { default: mongoose } = require("mongoose")

// add
const createLeaveSetting = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        // object destructuring 
        const { leaveTypeId, totalLeave, userId } = req.body;

        // find leavetype setting exists or not
        const isExists = await leave_setting.findOne({ leaveTypeId, userId, deleteAt: {$exists: false} });

        if (isExists) {
            return res.status(400).json({ error: ["Leave type data already exists."], success: false })
        }

        await leave_setting.create({ leaveTypeId, totalLeave, userId })

        return res.status(200).json({ message: "Data added successfully.", success: true })

    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update
const updateLeaveSetting = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        // object destructuring 
        const { leaveTypeId, totalLeave, userId } = req.body;
        const { id } = req.params;

        // find leavetype setting exists or not
        const isExists = await leave_setting.findOne({ leaveTypeId, userId, deleteAt: {$exists: false}, _id: {$ne: id} });

        if (isExists) {
            return res.status(400).json({ error: ["Leave type data already exists."], success: false })
        }

        const response = await leave_setting.findByIdAndUpdate({ _id: id }, {
            $set: {
                leaveTypeId, totalLeave, userId
            }
        })

        if (response) {
            return res.status(200).json({ message: "Data updated successfully.", success: true })
        } else {
            return res.status(404).json({ message: "Record not found", success: false })
        }

    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get
const getLeaveSetting = async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await leave_setting.aggregate([
            {
                $match: {
                    deleteAt: { $exists: false },
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "leavetypes", localField: "leaveTypeId", foreignField: "_id", as: "leaveType"
                }
            },
            { $unwind: { path: "$leavetype", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "leaveTypeId": 1,
                    "userId": 1,
                    "totalLeave": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "leavetype": { $first: "$leaveType.name" }
                }
            }
        ])

        return res.status(200).json({ message: "Data fetch successfully.", success: true, data: response })

    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// delete
const deleteLeaveSetting = async (req, res) => {
    try {
        const response = await leave_setting.findByIdAndUpdate({ _id: req.params.id }, { $set: { deleteAt: new Date() } })
        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Record is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

module.exports = {
    createLeaveSetting,
    getLeaveSetting,
    updateLeaveSetting,
    deleteLeaveSetting
}