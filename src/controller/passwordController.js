const expressValidator = require("express-validator");
const PasswordSchema = require("../models/passwordSchema");
const { default: mongoose } = require("mongoose");
const encryptData = require("../helper/encrptData");
const decryptData = require("../helper/decryptData");
const moment = require("moment");
const fs = require("fs");
const deleteFile = require("../helper/deleteFile");
const path = require("path");

// create password function
const createPassword = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        // encrypt data 
        let user_name = encryptData(req.body.user_name)
        let password = encryptData(req.body.password)
        let title = encryptData(req.body.title)
        let url = encryptData(req.body.url)
        let note = req.body.note ? encryptData(req.body.note) : null;
        let file = {};

        if (req.file) {
            file.name = req.file.originalname;
            file.pathName = req.file.filename;
        }

        let passwordData = new PasswordSchema({
            title: title,
            url: url,
            note: note,
            user_name: user_name,
            password: password,
            access_employee: req.body.access_employee !== "undefined" ? req.body.access_employee : [],
            createdBy: req.user._id,
            file
        });
        let response = await passwordData.save();

        return res.status(201).json({ success: true, message: "Data added successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update password function
const updatePassword = async (req, res) => {
    try {
        const { id } = req.params; // Extract the record ID from request parameters
        const errors = expressValidator.validationResult(req);

        // Validate request data
        if (!errors.isEmpty()) {
            const validationErrors = errors.array().map(err => err.msg);
            return res.status(400).json({ error: validationErrors, success: false });
        }

        let file = {};
        if (req.file) {
            file = {
                name: req.file.originalname,
                pathName: req.file.filename
            };
        }

        // Handle existing file deletion if a new file is uploaded
        if (req.file) {
            const existingData = await PasswordSchema.findOne(
                { _id: id, "file.pathName": { $exists: true } },
                { file: 1 }
            );

            if (existingData?.file?.pathName) {
                const filePath = path.join(__dirname, '../../public/password', existingData.file.pathName);
                if (fs.existsSync(filePath)) {
                    await deleteFile(filePath);
                }
            }
        }

        // Encrypt sensitive data fields
        const encryptedData = {
            user_name: encryptData(req.body.user_name),
            password: encryptData(req.body.password),
            title: encryptData(req.body.title),
            url: encryptData(req.body.url),
            note: req.body.note ? encryptData(req.body.note) : null
        };

        // Update the record in the database
        const updatedRecord = await PasswordSchema.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    ...encryptedData,
                    access_employee: req.body.access_employee,
                    file: req.file ? file : undefined
                }
            },
            { new: true }
        );

        // Send appropriate response
        if (updatedRecord) {
            return res.status(200).json({ success: true, message: "Data updated successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Record Not Found." });
        }
    } catch (error) {
        // Handle unexpected server errors
        return res.status(500).json({ message: error.message || 'Internal server error', success: false });
    }
};


// delete password function
const deletePassword = async (req, res) => {
    try {
        let { id } = req.params;

        let response = await PasswordSchema.findByIdAndUpdate({ _id: id }, { $set: { isDelete: true } });
        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Record Not Found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get password function
const getPassword = async (req, res) => {
    try {
        let permission = req.permissions;

        let { _id } = req.user;

        let passwords = await PasswordSchema.aggregate([
            {
                $match: {
                    isDelete: false,
                    $or: [
                        { access_employee: permission.name.toLowerCase() === "admin" ? { $nin: [] } : { $eq: new mongoose.Types.ObjectId(_id) } },
                        { createdBy: permission.name.toLowerCase() === "admin" ? { $ne: "" } : { $eq: new mongoose.Types.ObjectId(_id) } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                first_name: 1,
                                last_name: 1
                            }
                        }
                    ],
                    as: 'created'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'access_employee',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                first_name: 1,
                                last_name: 1
                            }
                        }
                    ],
                    as: 'access'
                }
            },
            {
                $project: {
                    title: 1,
                    url: 1,
                    user_name: 1,
                    password: 1,
                    note: 1,
                    access_employee: 1,
                    access: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    createdBy: 1,
                    created: { $arrayElemAt: ['$created', 0] },
                    file: 1
                }
            }
        ])

        let decryptPassword = passwords.map((item) => {
            return {
                _id: item._id,
                title: decryptData(item.title),
                url: decryptData(item.url),
                user_name: decryptData(item.user_name),
                password: decryptData(item.password),
                note: item.note ? decryptData(item.note) : null,
                access_employee: item.access_employee,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                access: item.access.map((val) => {
                    return { ...val, first_name: decryptData(val.first_name), last_name: decryptData(val.last_name) }
                }),
                createdBy: item.createdBy,
                created: {
                    ...item.created,
                    first_name: decryptData(item.created?.first_name || ""),
                    last_name: decryptData(item.created?.last_name || ""),
                },
                file: item.file
            }
        })

        return res.status(200).json({ success: true, data: decryptPassword, permissions: permission })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Internal Server Error', success: false })
    }
}

module.exports = { createPassword, getPassword, updatePassword, deletePassword }