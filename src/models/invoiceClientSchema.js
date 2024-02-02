const { model, Schema, default: mongoose } = require("mongoose");
const encryptData = require("../helper/encrptData");
const decryptData = require("../helper/decryptData");
const user = require("./userSchema");

function invoiceDataDecrypt(data) {
    return decryptData(data);
}

mongoose.set('toJSON', { getters: true });


const invoiceClientSchema = new Schema({
    business_name: {
        type: String,
        required: true,
        get: invoiceDataDecrypt
    },
    client_industry: {
        type: String,
        get: invoiceDataDecrypt
    },
    profile_image: {
        type: String,
        default: "uploads/default.jpg"
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        get: invoiceDataDecrypt
    },
    country: {
        type: String,
        default: encryptData("India"),
        get: invoiceDataDecrypt
    },
    state: {
        type: String,
        get: invoiceDataDecrypt
    },
    city: {
        type: String,
        get: invoiceDataDecrypt
    },
    postcode: {
        type: String,
        get: invoiceDataDecrypt
    },
    address: {
        type: String,
        get: invoiceDataDecrypt
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : user
    },
    GSTIN: {
        type: String,
        get: invoiceDataDecrypt
    },
    pan_number: {
        type: String,
        get: invoiceDataDecrypt
    },
    deleteAt: {
        type: Date,
    },
},
    {
        timestamps: true
    }, { toJSON: { getters: true }}
);

const invoice_client = new model("invoice_client", invoiceClientSchema);

module.exports = invoice_client;