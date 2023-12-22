const { model, Schema, default: mongoose } = require("mongoose");
const decryptData = require("../helper/decryptData");

function invoiceAccountDataDecrypt(data) {
    return decryptData(data);
}

mongoose.set('toJSON', { getters: true });

const invoiceAccountSchema = new Schema({
    bank: {
        type: String,
        required: true,
        get: invoiceAccountDataDecrypt
    },
    account_number: {
        type: String,
        required: true,
        get: invoiceAccountDataDecrypt
    },
    ifsc_code: {
        type: String,
        required: true,
        get: invoiceAccountDataDecrypt
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    },
    branch_name: {
        type: String,
        required: true,
        get: invoiceAccountDataDecrypt
    },
    name: {
        type: String,
        required: true,
        get: invoiceAccountDataDecrypt
    }
},
    {
        timestamps: true
    }, { toJSON: { getters: true } }
);

const invoice_account = new model("invoice_account", invoiceAccountSchema);

module.exports = invoice_account;