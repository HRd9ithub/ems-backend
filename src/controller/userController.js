const { default: mongoose } = require("mongoose");
const user = require("../models/userSchema")
const expressValidator = require("express-validator");
const bcrypt = require("bcryptjs");
const profile_image = require("../middlewares/ImageProfile");
const loginInfo = require("../models/loginInfoSchema");
const path = require("path");
const role = require("../models/roleSchema");
const designation = require("../models/designationSchema");
const moment = require("moment");
const createActivity = require("../helper/addActivity");
const encryptData = require("../helper/encrptData");
const decryptData = require("../helper/decryptData");

// create user function
const createUser = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        let error = []
        // role id check 
        let roles = await role.findOne({ _id: req.body.role_id })
        if (!roles) { error.push("Role id is not exists.") }

        // designation id check
        let designations = await designation.findOne({ _id: req.body.designation_id })
        if (!designations) { error.push("Designation id is not exists.") }

        // report by id check
        let report = await user.findOne({ _id: req.body.report_by })
        if (!report) { error.push("report by id is not exists.") }

        if (error.length !== 0) return res.status(422).json({ error: error, success: false })

        let first_name = encryptData(req.body.first_name)
        let last_name = encryptData(req.body.last_name)
        let phone = encryptData(req.body.phone.toString())
        let gender = encryptData(req.body.gender)

        const response = await user.create({
            employee_id: req.body.employee_id,
            first_name,
            last_name,
            email: req.body.email,
            phone,
            gender,
            status: req.body.status,
            password: req.body.password,
            joining_date: req.body.joining_date,
            role_id: req.body.role_id,
            designation_id: req.body.designation_id,
            report_by: req.body.report_by,
        })
        return res.status(201).json({ success: true, message: "Data added successfully." });

    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// single user data fetch function
const activeUser = async (req, res) => {
    try {
        const value = await user.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: "designations", localField: "designation_id", foreignField: "_id", as: "designation"
                }
            },
            { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "roles", localField: "role_id", foreignField: "_id", as: "role"
                }
            },
            { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "accounts", localField: "_id", foreignField: "user_id", as: "account_detail"
                }
            },
            { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "emergency_contacts", localField: "_id", foreignField: "user_id", as: "emergency_contact"
                }
            },
            {
                $lookup: {
                    from: "user_documents", localField: "_id", foreignField: "user_id", as: "user_document"
                }
            }, {
                $lookup: {
                    from: "educations", localField: "_id", foreignField: "user_id", as: "education"
                }
            },
            {
                $project: {
                    "password": 0,
                    "token": 0,
                    "expireIn": 0,
                    "otp": 0,
                    "role.permissions": 0,
                }
            }
        ])

        const result = value.map((item) => {
            return {
                ...item,
                employee_id: item.employee_id,
                first_name: decryptData(item.first_name),
                last_name: decryptData(item.last_name),
                email: item.email,
                phone: decryptData(item.phone),
                address: decryptData(item.address),
                country: decryptData(item.country),
                state: decryptData(item.state),
                city: decryptData(item.city),
                postcode: decryptData(item.postcode),
                date_of_birth: item.date_of_birth,
                joining_date: item.joining_date,
                gender: decryptData(item.gender),
                age: decryptData(item.age),
                blood_group: decryptData(item.blood_group),
                maried_status: decryptData(item.maried_status),
                designation_id: item.designation_id,
                role_id: item.role_id,
                status: item.status,
                leaveing_date: item.leaveing_date,
                profile_image: item.profile_image,
                account_detail: item.account_detail.map((val) => {
                    return {
                        _id : val._id,
                        name : decryptData(val.name),
                        bank_name : decryptData(val.bank_name),
                        account_number : decryptData(val.account_number),
                        ifsc_code : decryptData(val.ifsc_code),
                        branch_name : decryptData(val.branch_name),
                    }
                }),
                emergency_contact: item.emergency_contact.map((val) => {
                    return {
                        _id : val._id,
                        name : decryptData(val.name),
                        email : decryptData(val.email),
                        phone : decryptData(val.phone),
                        address : decryptData(val.address),
                        relationship : decryptData(val.relationship),
                    }
                }),
                education: item.education.map((val) => {
                    return {
                        _id : val._id,
                        user_id : val.user_id,
                        year : decryptData(val.year),
                        percentage : decryptData(val.percentage),
                        university_name : decryptData(val.university_name),
                        degree : decryptData(val.degree),
                    }
                })
            }
        })
        
        let userVerify = value.length !== 0 ? (value[0].account_detail.length === 0 || value[0].emergency_contact.length === 0) && req.permissions.name.toLowerCase() !== "admin" : false

        return res.status(200).json({ success: true, message: "User data fetch successfully.", data: result[0], userVerify: userVerify, permissions: req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// all user data fetch function
const getUser = async (req, res) => {
    try {
        const value = await user.aggregate([
            {
                $match: {
                    "delete_at": { $exists: false },
                    $or: [
                        { "leaveing_date": { $eq: null } },
                        { "leaveing_date": { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
                    ]
                }
            },
            {
                $lookup: {
                    from: "roles", localField: "role_id", foreignField: "_id", as: "role"
                }
            },
            { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$role.name", "admin"] },
                            { $ne: ["$role.name", "Admin"] },
                        ],
                    },
                }
            },
            {
                $lookup: {
                    from: "designations", localField: "designation_id", foreignField: "_id", as: "designation"
                }
            },
            { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users", localField: "report_by", foreignField: "_id", as: "report"
                }
            },
            { $unwind: { path: "$report", preserveNullAndEmptyArrays: true } },
            // {
            //     $match: {
            //         "report.delete_at": { $exists: false },
            //         $or: [
            //             { "report.leaveing_date": { $eq: null } },
            //             { "report.leaveing_date": { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
            //         ]
            //     }
            // },
            {
                $project: {
                    "employee_id": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "email": 1,
                    "phone": 1,
                    "status": 1,
                    "role.name": 1,
                    "designation.name": 1,
                    "report.first_name": 1,
                    "report.last_name": 1,
                    "report.status": 1,
                    "report._id": 1,
                }
            }
        ]);

        const result = value.map((item) => {
            return {
                _id : item._id,
                name : decryptData(item.first_name).concat(" ", decryptData(item.last_name)),
                employee_id: item.employee_id,
                email: item.email,
                phone: decryptData(item.phone),
                status: item.status,
                report: {
                    _id: item.report._id,
                    name :decryptData(item.report.first_name).concat(" ", decryptData(item.report.last_name)),
                    last_name: decryptData(item.report.last_name),
                    status: item.report.status,
                },
                role:{
                    name: item.role.name
                }
            }
        })
        return res.status(200).json({ success: true, message: "User data fetch successfully.", data: result, permissions: req.permissions })
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update user data function
const updateUser = async (req, res) => {
    try {
        // check email exist or not
        const data = await user.findOne({ email: req.body.email })

        if (data && data._id != req.params.id) {
            return res.status(422).json({ message: "email address already exists.", success: false })
        } else {

            let first_name = encryptData(req.body.first_name)
            let last_name = encryptData(req.body.last_name)
            let phone = encryptData(req.body.phone.toString())
            let gender = encryptData(req.body.gender)
            let country = encryptData(req.body.country || "India")
            let age = req.body.age && encryptData(req.body.age.toString())
            let blood_group = req.body.blood_group && encryptData(req.body.blood_group)
            let maried_status = req.body.maried_status && encryptData(req.body.maried_status)
            let state = req.body.state && encryptData(req.body.state)
            let address = req.body.address && encryptData(req.body.address)
            let city = req.body.city && encryptData(req.body.city)
            let postcode = req.body.postcode && encryptData(req.body.postcode);

            // data update method
            const response = await user.findByIdAndUpdate({ _id: req.params.id }, {
                first_name,
                last_name,
                email: req.body.email,
                phone,
                address,
                country,
                state,
                city,
                postcode,
                joining_date: req.body.joining_date,
                date_of_birth: req.body.date_of_birth,
                gender,
                age,
                blood_group,
                maried_status,
                designation_id: req.body.designation_id,
                role_id: req.body.role_id,
                status: req.body.status,
                report_by: req.body.report_by,
                leaveing_date: req.body.leaveing_date,
            });

            if (response) {
                const roleData = await role.findOne({ _id: req.user.role_id });
                if (roleData.name.toLowerCase() !== "admin") {
                    createActivity(req.user._id, "Profile Details updated by");
                }
                return res.status(200).json({ success: true, message: "Data updated successfully." })
            } else {
                return res.status(404).json({ success: false, message: "User not found." })
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// delete user data function
const deleteUser = async (req, res) => {
    try {
        // check user exist or not
        const data = await user.findOne({ _id: req.params.id })

        if (!data) {
            return res.status(404).json({ message: "User are not found.", success: false })
        } else {
            const response = await user.findByIdAndUpdate({ _id: req.params.id }, { delete_at: Date.now() });
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update user status function
const updateStatusUser = async (req, res) => {
    try {
        // check user exist or not
        const data = await user.findOne({ _id: req.params.id })

        if (!data) {
            return res.status(404).json({ message: "User are not found.", success: false })
        } else {
            // data update method
            const response = await user.findByIdAndUpdate({ _id: req.params.id }, { status: data.status === 'Active' ? 'Inactive' : "Active" });
            return res.status(200).json({ success: true, message: "Status updated successfully." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// check Email function
const checkEmail = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)
        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // check email exist or not
        const data = await user.findOne({ email: req.body.email })
        if (data) {
            return res.status(400).json({ error: "Email address already exists.", success: false })
        } else {
            return res.status(200).json({ success: true, message: "Email address not exists." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// check Email function
const checkEmployeeId = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)
        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // check email exist or not
        const data = await user.findOne({ employee_id: { $regex: new RegExp('^' + req.body.employee_id, 'i') } })

        if (data) {
            return res.status(400).json({ error: "Employee id already exists.", success: false })
        } else {
            return res.status(200).json({ success: true, message: "Employee id not exists." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// change profile image
const changeImage = async (req, res) => {
    profile_image(req, res, async function (err) {
        if (err) {
            return res.status(400).send({ message: err.message })
        }

        // Everything went fine.
        const file = req.file;

        try {
            if (file) {
                const roleData = await role.findOne({ _id: req.user.role_id });
                if (roleData.name.toLowerCase() !== "admin") {
                    createActivity(req.user._id, "Profile image updated by");
                }
                const data = await user.findByIdAndUpdate({ _id: req.user._id }, { profile_image: `uploads/${file.filename}` });
                return res.status(200).json({ message: "Profile image updated successfully.", success: true })
            } else {
                return res.status(400).json({ message: "Profile Image is Required.", success: false })
            }
        } catch (error) {
            res.status(500).json({ message: error.message || 'Internal server Error', success: false })
        }
    })
}

// change password
const changePassword = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)
        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false })
        }

        const userData = await user.findOne({ _id: req.user._id }).select("-token")

        // password compare
        const isMatch = await bcrypt.compare(req.body.current_password, userData.password);

        if (!isMatch) {
            return res.status(400).json({ error: ["Incorrect current password."], success: false })
        }
        const roleData = await role.findOne({ _id: userData.role_id });
        if (roleData.name.toLowerCase() !== "admin") {
            createActivity(userData._id, "Password Change by");
        }
        // password convert hash
        const passwordHash = await bcrypt.hash(req.body.new_password, 10);


        const updateData = await user.findByIdAndUpdate({ _id: userData._id }, { password: passwordHash, $unset: { token: "" } })

        res.status(200).json({ message: "Password updated successfully.", success: true })
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}
// get login information
const getLoginInfo = async (req, res) => {
    try {
        let { id, startDate, endDate } = req.body

        const errors = expressValidator.validationResult(req)
        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        let value = await loginInfo.find({
            $and: [
                { userId: { $eq: id } },
                { $and: [{ createdAt: { $gte: startDate } }, { createdAt: { $lte: endDate } }] },
            ]
        }).sort({ createdAt: -1 })


        return res.status(200).json({ success: true, message: "User login info data fetch successfully.", data: value })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get user name information
const getUserName = async (req, res) => {
    try {
        const value = await user.aggregate([
            {
                $match: {
                    // status: "Active",
                    delete_at: { $exists: false },
                    joining_date: { "$lte": new Date(moment(new Date()).format("YYYY-MM-DD")) },
                    $or: [
                        { leaveing_date: { $eq: null } },
                        { leaveing_date: { $gt: new Date(moment(new Date()).format("YYYY-MM-DD")) } },
                    ]
                }
            },
            {
                $lookup: {
                    from: "roles", localField: "role_id", foreignField: "_id", as: "role"
                }
            },
            {
                $project: {
                    "first_name": 1,
                    "last_name": 1,
                    role: { $first: "$role.name" },
                    leaveing_date: 1
                }
            }
        ]);

        const result = value.map((val) => {
            return {
                first_name: decryptData(val.first_name),
                last_name: decryptData(val.last_name),
                role: val.role,
                _id: val._id
            }
        })


        return res.status(200).json({ success: true, message: "User data fetch successfully.", data: result })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}


module.exports = { createUser, activeUser, getUser, getUserName, updateUser, deleteUser, updateStatusUser, checkEmail, getLoginInfo, checkEmployeeId, changeImage, changePassword }