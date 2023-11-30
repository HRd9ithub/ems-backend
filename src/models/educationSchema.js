const mongoose = require('mongoose');

// education structure define 
const educationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    year: {
        type: String
    },
    percentage: {
        type: String
    },
    university_name: {
        type: String
    },
    degree: {
        type: String
    }
},
    {
        timestamps: true
    }
)


// create collection
const education = new mongoose.model("education", educationSchema)

module.exports = education