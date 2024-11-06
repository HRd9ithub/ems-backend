const mongoose = require('mongoose');

// document structure define 
const user_documentSchema = new mongoose.Schema({
    photo: {
        type: String
    },
    aadhar_card: {
        type: String
    },
    resume: {
        type: String
    },
    offer_letter: {
        type: String
    },
    pan_card: {
        type: String
    },
    other: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
},
    {
        timestamps: true
    }
)


// create collection
const user_document = new mongoose.model("user_document", user_documentSchema)

module.exports = user_document