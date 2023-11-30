const mongoose = require("mongoose");

const attendanceCommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    attendanceRegulationId: {
        type: mongoose.Types.ObjectId,
        ref: "attendanceRegulation",
        required: true
    },
    status: {
        type: String,
        enum: ["Reject", "Approved"],
    },
},
{
    timestamps : true
}
);


const Attendance_Comment = new mongoose.model("Attendance_Comment",attendanceCommentSchema);

module.exports = Attendance_Comment;