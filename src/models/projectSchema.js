const mongoose = require('mongoose');

// document structure define 
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    deleteAt : {
        type : Date
    }
},
{timestamps : true}
)


// create collection
const project = new mongoose.model("project", projectSchema)

module.exports = project