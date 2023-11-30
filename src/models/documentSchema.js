const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    }
},{
    timestamps: true
})

const document = new mongoose.model("document",documentSchema)

module.exports = document;