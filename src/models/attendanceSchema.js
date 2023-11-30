const { Schema, model } = require("mongoose");


const attendanceSchema = new Schema({
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        timestamp: {
            type: Date,
            required: true
        },
        clock_in: {
            type: String,
            required: true
        },
        clock_out: {
            type: String,
            required: false
        },
        totalHours: {
            type: String,
            required: false
        },
    },
    { timestamps: true }
);

const attendance = model("Attendance", attendanceSchema);

module.exports = attendance;
