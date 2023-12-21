const mongoose = require("mongoose");
const user = require("./userSchema");
const Schema = mongoose.Schema;

const reportDownloadSchema = new Schema({
    name: {
        type: String,
        ref: user
    },
    summary: {
        type: Object
    },
    reports: {
        type: Array
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("report_download", reportDownloadSchema);