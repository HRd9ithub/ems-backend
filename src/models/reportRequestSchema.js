const mongoose = require('mongoose');

const reportRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true,
        enum: ['Pending', "Read"],
        default: "Pending"
    }
}, {
    timestamps: true,
});

const ReportRequestSchema = mongoose.model('report_request', reportRequestSchema)

module.exports = ReportRequestSchema