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
    totalHours : {
        type: String,
        required : [true , "Totak hours is a required field."]
    },
    work : {
        type:[{
            projectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "project",
                required: "Project is a required field."
            },
            description: {
                type: String,
                required: "Description is a required field."
            },
            hours: {
                type: String,
                required: "Working hours is a required field."
            },
        }],
        required: true
    },
    title: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true,
        enum: ['Pending', "Read","Approved","Declined"],
        default: "Pending"
    },
    extraWork: {
        type: {
            projectId: {
                type: mongoose.Schema.Types.ObjectId,
            },
            description: {
                type: String,
            },
            hours: {
                type: String,
            }
        }
    },
    deleteAt: {
        type: Date
    }
}, {
    timestamps: true,
});

const ReportRequestSchema = mongoose.model('report_request', reportRequestSchema)

module.exports = ReportRequestSchema