const mongoose = require('mongoose');
const leaveType = require('./leaveTypeSchema');
const user = require('./userSchema');

// document structure define 
const leaveSettingSchema = new mongoose.Schema({
    leaveTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: leaveType
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: user
    },
    totalLeave: {
        type: Number,
        required: true
    },
    deleteAt : {
        type : Date
    }
},
{timestamps: true}
)


// create collection
const leave_setting = new mongoose.model("leave_setting", leaveSettingSchema)

module.exports = leave_setting