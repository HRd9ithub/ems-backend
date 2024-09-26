const mongoose = require('mongoose');

const reportRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    wortReportId: {
        type: String
    },
    date: {
        type: String,
        require: true
    },
    totalHours: {
        type: String,
        required: [true, "Totak hours is a required field."]
    },
    title: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true,
        enum: ['Pending', "Read", "Approved", "Declined"],
        default: "Pending"
    },
    extraTotalHours: {
        type: Number,
        required: [true, "Extra total hours is a required field."]
    },
    work: {
        type: [{
            projectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "project",
            },
            description: {
                type: String,
            },
            hours: {
                type: String,
            },
        }],
        required: true
    },
    extraWork: {
        type: [{
            projectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "project",
            },
            description: {
                type: String,
            },
            hours: {
                type: String,
            },
        }],
        required: true
    },
    deleteAt: {
        type: Date
    }
}, {
    timestamps: true,
});

const ReportRequestSchema = mongoose.model('report_request', reportRequestSchema)

module.exports = ReportRequestSchema