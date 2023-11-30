const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    email: {
        type: String,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    expireIn: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "30m",
    },
});

module.exports = mongoose.model("token", tokenSchema);