const { model, Schema } = require("mongoose");

const invoiceAccountSchema = new Schema({
    bank: {
        type :String,
        required : true
    },
    account_number :{ 
        type :String,
        required : true
    },
    ifsc_code:{
        type : String,
        required : true
    },
    branch_name : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    invoice_id : {
        type : Schema.Types.ObjectId,
        ref: "invoice",
        required : true
    },
},
    {
        timestamps: true
    }
);

`id`, `bank`, `country`, `accountnumber`, `IBAN`, `SWIFT`, `HName`, `phone`, `invoiceId`, `loginId`, `Deleted_account`

const invoice_account = new model("invoice_account", invoiceAccountSchema);

module.exports = invoice_account;