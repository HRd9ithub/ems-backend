const expressValidator = require("express-validator");
const encryptData = require("../helper/encrptData");
const invoice_client = require("../models/invoiceClientSchema");

// add data
const createInvoiceClient = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)
        
        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        for (const key in req.body) {
            if (key !== "email" && key !== "profile_image") {
                req.body[key] = encryptData(req.body[key])
            }
        }
        req.body.profile_image = req.file && "uploads/" + req.file.filename

        const response = await invoice_client.create(req.body);
        return res.status(201).json({
            message: "Data added successfully.",
            success: true,
            id : response._id
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        });
    }
}
// update data
const updateInvoiceClient = async (req, res) => {
    try {
        const {id} = req.params;
        const errors = expressValidator.validationResult(req)
        
        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        for (const key in req.body) {
            if (key !== "email" && key !== "profile_image") {
                req.body[key] = encryptData(req.body[key])
            }
        }
        req.body.profile_image = req.file &&  "uploads/" + req.file.filename

        const response = await invoice_client.findByIdAndUpdate({_id: id},req.body);
        return res.status(200).json({
            message: "Data updated successfully.",
            success: true,
            id :response._id
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        });
    }
}

// name list 
const getClientName = async(req,res) => {
    try {
        const response = await invoice_client.find({},{first_name : 1, last_name : 1});

        return res.status(200).json({
            message : "success",
            success : true,
            data : response.map((val) => ({name : val.first_name.concat(" ",val.last_name), _id : val._id}))
        })
        
    } catch (error) {
        return res.status(500).json({
            message :  error.message || "Interner server error.",
            success : false
        })
    }
}

// single client get
const getSingleClient = async(req,res) => {
    try {
        const {id} = req.params;
        const response = await invoice_client.findOne({_id : id});

        return res.status(200).json({
            message : "success",
            success : true,
            data : response
        })
        
    } catch (error) {
        return res.status(500).json({
            message : error.message || "Interner server error.",
            success : false
        })
    }
}

const checkEmail = async(req,res) => {
    try {
        const data = await invoice_client.findOne({ email: { $regex: new RegExp('^' + req.body.email, 'i') } })
        
        if (data) {
            return res.status(422).json({
                error : "Email address already exists.",
                success : false
            })
        }else{
           return res.status(200).json({
               message : "Email address not already exists.",
               success : true
           })
       }
    } catch (error) {
        return res.status(500).json({
            message : error.message || "Interner server error.",
            success : false
        })
    }
}

module.exports = { createInvoiceClient, getClientName, getSingleClient, updateInvoiceClient, checkEmail };