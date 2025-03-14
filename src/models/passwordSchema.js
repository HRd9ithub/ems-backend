const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    access_employee: {
        type: [
            { type: mongoose.Schema.Types.ObjectId }
        ],
        required: true
    },
    file: {
        type: {
            name: String,
            pathName: String
        }
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const PasswordSchema = mongoose.model('password', passwordSchema)

module.exports = PasswordSchema