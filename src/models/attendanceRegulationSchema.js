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
    isDelete: {
        type: Boolean
    },
    attendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Attendance'
    }
},
    {
        timestamps: true
    }
);

const Attendance_Regulation = new mongoose.model("Attendance_Regulation", attendanceRegulationSchema);

module.exports = Attendance_Regulation;