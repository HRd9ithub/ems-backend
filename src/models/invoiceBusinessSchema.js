const { model, Schema, default: mongoose } = require("mongoose");
const encryptData = require("../helper/encrptData");
const decryptData = require("../helper/decryptData");

function invoiceBusinessDataDecrypt(data) {
    return data && decryptData(data);
}

mongoose.set('toJSON', { getters: true });


const invoiceBusinessSchema = new Schema({
    profile_image: {
        type: String,
        default: "uploads/default.jpg"
    },
    business_name: {
        type: String,
        required: true,
        get: invoiceBusinessDataDecrypt
    },
    address: {
        type: String,
        required: true,
        get: invoiceBusinessDataDecrypt
    },
    GSTIN: {
        type: String,
        get: invoiceBusinessDataDecrypt
    },
    pan_number: {
        type: String,
        get: invoiceBusinessDataDecrypt
    },
    country: {
        type: String,
        default: encryptData("India"),
        get: invoiceBusinessDataDecrypt
    },
    state: {
        type: String,
        get: invoiceBusinessDataDecrypt
    },
    city: {
        type: String,
        get: invoiceBusinessDataDecrypt
    },
    postcode: {
        type: String,
        get: invoiceBusinessDataDecrypt
    },
    email: {
        type: String,
        get: invoiceBusinessDataDecrypt
    },
    phone: {
        type: String,
        get: invoiceBusinessDataDecrypt
    },
    deleteAt: {
        type: Date,
    },
},
    {
        timestamps: true
    }, { toJSON: { getters: true }}
);

const invoice_business = new model("invoice_business", invoiceBusinessSchema);

module.exports = invoice_business;