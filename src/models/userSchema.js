const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")
var jwt = require('jsonwebtoken');
const decryptData = require('../helper/decryptData');
const encryptData = require('../helper/encrptData');

function firstNameGet(first_name) {
    return decryptData(first_name);
}
function lastNameGet(last_name) {
    return decryptData(last_name);
}
mongoose.set('toJSON', { getters: true });

// document structure define 
const userSchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true,
        get: firstNameGet
    },
    last_name: {
        type: String,
        required: true,
        get: lastNameGet
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    report_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    age: {
        type: String,
    },
    address: {
        type: String,
    },
    gender: {
        type: String,
        // enum: ['Male', 'Female']
    },
    date_of_birth: {
        type: Date,
    },
    joining_date: {
        type: Date,
        required: true
    },
    leaveing_date: {
        type: Date
    },
    blood_group: {
        type: String,
    },
    status: {
        type: String,
        // enum: ['Active', 'Inactive'],
        default: "Active"
    },
    profile_image: {
        type: String,
        default: "uploads/default.jpg"
    },
    country: {
        type: String,
        default: encryptData("India")
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    maried_status: {
        type: String,
        // enum: ['Married', 'Unmarried']
    },
    postcode: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "role"
    },
    designation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "designation"
    },
    otp: {
        type: String
    },
    delete_at: {
        type: Date
    },
    expireIn: {
        type: Number
    },
    token: {
        type: String
    }
},
    {
        timestamps: true,
    }, { toJSON: { getters: true } }
)

// generate token
userSchema.methods.generateToken = async function () {
    try {
        var token = jwt.sign({ _id: this._id, date: new Date().toLocaleDateString() }, process.env.SECRET_KEY);
        this.token = token
        await this.save();
        return token
    } catch (error) {
        console.log('error :>>>> ', error);
    }
}

userSchema.methods.comparePassword = async function (password) {
    const isMatched = await bcrypt.compare(password, this.password);
    return isMatched;
}

// password convert for hash
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

// create collection
const user = new mongoose.model("user", userSchema)

module.exports = user