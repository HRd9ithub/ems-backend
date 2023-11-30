const mongoose = require('mongoose');

// document structure define 
const leaveTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
},
{timestamps: true}
)


// create collection
const leaveType = new mongoose.model("leaveType", leaveTypeSchema)

module.exports = leaveType