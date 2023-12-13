const { model, Schema } = require("mongoose");

const invoiceSchema = new Schema({
    invoiceId : {
        type: String,
        required: true,
        unique : true
    },
    issue_date: {
        type: Date,
        required: true
    },
    due_date: {
        type: Date,
    },
    extra_field: {
        type: String,
    },
    clientId:{
        type : Schema.Types.ObjectId,
        ref : "invoice_client"
    },
    userId:{
        type : Schema.Types.ObjectId,
        ref : "user"
    },
    totalAmount : {
        type: String,
        required: true
    },
    signImage : {
        type: String,
    },
    note : {
        type: String,
    },
    attchmentFile : {
        type : Array
    },
    status: {
        type : String,
        default : "Unpaid",
        enum : ["Unpaid","Paid", "Draft"]
    },
    deleteAt :{
        type : Date
    }
},
    {
        timestamps: true
    }
);

const invoice = new model("invoice", invoiceSchema);

module.exports = invoice;