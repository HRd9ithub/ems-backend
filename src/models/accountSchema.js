const mongoose = require('mongoose');

// document structure define 
const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bank_name : {
        type:String,
        required : true,   
    },
    account_number:{
        type:String,
        required:true
    },
    ifsc_code:{
        type:String,
        required:true
    },
    branch_name:{
        type:String,
        required:true
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
},
{
    timestamps :true
}
)


// create collection
const account = new mongoose.model("account", accountSchema)

module.exports = account