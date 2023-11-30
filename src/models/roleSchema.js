const mongoose = require('mongoose');

// document structure define 
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    permissions: [{
        menuId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        list: {
            type: Number,
            required: true
        },
        create: {
            type: Number,
            required: true
        },
        update: {
            type: Number,
            required: true
        },
        delete: {
            type: Number,
            required: true
        },
    }]
}, {
    timestamps: true
})



// create collection
const role = new mongoose.model("role", roleSchema);

module.exports = role