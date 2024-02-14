const { model, Schema } = require("mongoose");

const invoiceTableSchema = new Schema({
    invoiceId: {
        type: String,
        required: true,
    },
    tableHead: {
        type: [{}],
        required: true
    },
    tableBody: {
        type: [{}],
        required: true
    }
},
    {
        timestamps: true
    }
);

const invoice_table = new model("invoice_table", invoiceTableSchema);

module.exports = invoice_table;