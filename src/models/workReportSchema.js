const { default: mongoose } = require("mongoose");

const workReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: String,
        required: [true, "Work date is a required field."]
    },
    totalHours: {
        type: String,
        required: [true, "Total hours is a required field."]
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
    }
}, {
    timestamps: true,
})


// create collection
const report = new mongoose.model("report", workReportSchema)

module.exports = report