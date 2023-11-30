const { default: mongoose } = require("mongoose");

const workReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: String,
        required : [true , "Work date is a required field."]
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
    }
}, {
    timestamps: true,
})


// create collection
const report = new mongoose.model("report", workReportSchema)

module.exports = report