const mongoose = require('mongoose');

const activitySchema= new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : "Employee is required."
    },
    title: {
        type: String,
        required : "Title is required."
    },
    date: {
        type: String,
        required : "Date is required."
    },
},{
    timestamps: true,
});

const activity_log = mongoose.model('activity_log', activitySchema)

module.exports = activity_log