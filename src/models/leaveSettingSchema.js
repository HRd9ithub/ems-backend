const mongoose = require('mongoose');

// document structure define 
const leaveSettingSchema = new mongoose.Schema({
    leaveTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    totalLeave: {
        type: Number,
        required: true
    }
},
{timestamps: true}
)


// create collection
const leave_setting = new mongoose.model("leave_setting", leaveSettingSchema)

module.exports = leave_setting