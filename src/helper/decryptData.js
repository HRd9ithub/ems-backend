const CryptoJS = require("crypto-js");

const decryptData = (data) => {
    if (data) {
        const decrypted = CryptoJS.AES.decrypt(data, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted;
    } else {
        return ""
    }
}

module.exports = decryptData;