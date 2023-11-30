const mongoose = require('mongoose');

// document structure define 
const loginInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    device_name: {
        type: String
    },
    browser_name: {
        required: true,
        type: String,
    }
},
    {
        timestamps: true,
    }
)

// create collection
const loginInfo = new mongoose.model("loginInfo", loginInfoSchema)

module.exports = loginInfo