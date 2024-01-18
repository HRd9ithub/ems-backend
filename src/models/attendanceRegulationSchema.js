const mongoose = require("mongoose");



const attendanceRegulationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clock_in: {
        type: String,
        required: true
    },
    clock_out: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    deleteAt: {
        type: Date,
        required : false
    },
    status: {
        type: String,
        require: true,
        enum: ['Pending', "Read","Approved","Declined"],
        default: "Pending"
    },
    attendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Attendance'
    },
    comment : {
        type : String,
        required : false,
        default : null
    }
},
    {
        timestamps: true
    }
);

const Attendance_Regulation = new mongoose.model("Attendance_Regulation", attendanceRegulationSchema);

module.exports = Attendance_Regulation;