const expressValidator = require("express-validator")
const leave_setting = require("../models/leaveSettingSchema")

// add
const createLeaveSetting = async(req,res) => {
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
        const { leaveTypeId, totalLeave } = req.body;

        // find leavetype setting exists or not
        const isExists = await leave_setting.findOne({leaveTypeId});

        if(isExists){
            return res.status(400).json({ error: ["Leave type data already exists."], success: false })
        }

        await leave_setting.create({ leaveTypeId, totalLeave })

        return res.status(200).json({ message: "Data added successfully.", success: true })

    } catch (error) {
       return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update
const updateLeaveSetting = async(req,res) => {
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
        const { leaveTypeId, totalLeave } = req.body;
        const { id } = req.params;

        const response = await leave_setting.findByIdAndUpdate({_id: id},{$set : {
            leaveTypeId, totalLeave 
        }})

        if(response){
            return res.status(200).json({ message: "Data updated successfully.", success: true })
        }else{
            return res.status(404).json({ message: "Record not found", success: false })
        }

    } catch (error) {
       return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get
const getLeaveSetting = async(req,res) => {
    try {
        const response = await leave_setting.aggregate([
            {
                $lookup: {
                    from: "leavetypes", localField: "leaveTypeId", foreignField: "_id", as: "leaveType"
                }
            },
            { $unwind: { path: "$leavetype", preserveNullAndEmptyArrays: true } },
            {
                $project : {
                    "leaveTypeId": 1,
                    "totalLeave": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "leavetype":  { $first: "$leaveType.name" }
                }
            }
        ])

        return res.status(200).json({ message: "Data fetch successfully.", success: true, data :response, permissions: req.permissions })

    } catch (error) {
       return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

module.exports = {
    createLeaveSetting,
    getLeaveSetting,
    updateLeaveSetting
}