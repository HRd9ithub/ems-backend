const mongoose = require('mongoose');

// document structure define 
const emergencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    relationship : {
        type:String,
        required : true,   
    },
    email:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    }
},
{
    timestamps :true
}
)


// create collection
const emergency_contact = new mongoose.model("emergency_contact", emergencySchema)

module.exports = emergency_contact