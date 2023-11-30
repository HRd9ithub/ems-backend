const mongoose = require('mongoose');

// document structure define 
const designationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
},
    { timestamps: true }
)


// create collection
const designation = new mongoose.model("designation", designationSchema)

module.exports = designation