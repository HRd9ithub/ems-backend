const expressValidator = require("express-validator");
const invoice_business = require("../models/invoiceBusinessSchema");
const encryptData = require("../helper/encrptData");

function removeNull(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != ""));
}

function getNullValue(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value == ""));
}

exports.createBunsiness = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        const result = removeNull(req.body);

        for (const key in result) {
            if (key !== "profile_image") {
                result[key] = encryptData(result[key])
            }
        }

        // image add for variable
        result.profile_image = req.file ? "uploads/" + req.file.filename : "uploads/default.jpg";

        const response = await invoice_business.create(result);

        return res.status(201).json({
            message: "Data added successfully.",
            success: true,
            id: response._id
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server errror", success: false });
    }
}

exports.updateBunsiness = async (req, res) => {
    try {
        const { id } = req.params;
        const errors = expressValidator.validationResult(req)

        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        const result = removeNull(req.body);
        const nullValue = getNullValue(req.body);

        for (const key in result) {
            if (key !== "profile_image") {
                result[key] = encryptData(result[key])
            }
        }

        // image add for variable
        result.profile_image = req.file && "uploads/" + req.file.filename;

        const response = await invoice_business.findByIdAndUpdate({ _id: id }, {$set: result, $unset: nullValue});
        return res.status(200).json({
            message: "Data updated successfully.",
            success: true,
            id: response._id
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server errror", success: false });
    }
}

exports.getSingleBunsiness = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await invoice_business.findById({ _id: id });

        return res.status(200).json({
            message: "Data fetched successfully.",
            success: true,
            data: response
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server errror", success: false });
    }
}

exports.getBunsinessName = async (req, res) => {
    try {
        const response = await invoice_business.find({}, { business_name: 1 });

        return res.status(200).json({
            message: "Data fetch successfully.",
            success: true,
            data: response
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || "Interner server errror", success: false });
    }
}