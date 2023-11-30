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
    }
}, {
    timestamps: true,
});

const ReportRequestSchema = mongoose.model('report_request', reportRequestSchema)

module.exports = ReportRequestSchema