const CryptoJS = require("crypto-js");

const encryptData = (data) => {
    var ciphertext = CryptoJS.AES.encrypt(data, process.env.SECRET_KEY).toString()
    return ciphertext
}

module.exports = encryptData;