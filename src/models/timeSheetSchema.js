const mongoose = require("mongoose");


const timeSheetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: String
    },
    login_time: {
        type: String,
        required: true
    },
    login_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    logout_time: {
        type: String
    },
    total: {
        type: String
    }
},
    {
        timestamps: true,
    }
)


const timeSheet = new mongoose.model("timeSheet", timeSheetSchema)

module.exports = timeSheet