const mongoose = require('mongoose');

// document structure define 
const user_documentSchema = new mongoose.Schema({
    photo :{ 
        type: String,
        required : true
    },
    id_proof :{ 
        type: String,
        required : true
    },
    resume :{ 
        type: String
    },
    offer_letter :{ 
        type: String
    },
    joining_letter :{ 
        type: String
    },
    other :{ 
        type: String
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
const user_document = new mongoose.model("user_document", user_documentSchema)

module.exports = user_document