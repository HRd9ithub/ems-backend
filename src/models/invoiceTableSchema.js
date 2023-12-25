const { model, Schema } = require("mongoose");

const invoiceTableSchema = new Schema({
    itemName: {
        type: String,
        required: true,
    },
    rate: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    GST: {
        type: Number,
    },
    IGST: {
        type: Number,
    },
    CGST: {
        type: Number,
    },
    SGST: {
        type: Number,
    },
    invoiceId : {
        type : String,
        required: true,
    }
},
    {
        timestamps: true
    }
);

const invoice_table = new model("invoice_table", invoiceTableSchema);

module.exports = invoice_table;