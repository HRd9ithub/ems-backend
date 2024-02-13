const { model, Schema } = require("mongoose");
const invoice_business = require("./invoiceBusinessSchema");
const invoice_client = require("./invoiceClientSchema");
const user = require("./userSchema");

const invoiceSchema = new Schema({
    invoiceId: {
        type: String,
        required: true,
        unique: true
    },
    businessLogo: {
        type: String
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
    businessId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: invoice_business
    },
    clientId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: invoice_client
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: user
    },
    totalAmount: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    currencyValue: {
        type: String,
        required: true
    },
    terms: {
        type: Array,
    },
    contact: {
        type: String,
    },
    signImage: {
        type: String,
    },
    note: {
        type: String,
    },
    payment_date: {
        type: Date,
    },
    payment_method: {
        type: String,
    },
    payment_note: {
        type: String,
    },
    attchmentFile: {
        type: Array
    },
    gstType: {
        type: String
    },
    status: {
        type: String,
        default: "Unpaid",
        enum: ["Unpaid", "Paid", "Draft"]
    },
    deleteAt: {
        type: Date
    }
},
    {
        timestamps: true
    }
);

const invoice = new model("invoice", invoiceSchema);

module.exports = invoice;