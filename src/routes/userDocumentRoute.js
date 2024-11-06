const express = require("express")
const Auth = require("../middlewares/authtication");
const { uploadSingleImage } = require("../middlewares/documentUpload");
const user_document = require("../models/userDocumentSchema");
const createActivity = require("../helper/addActivity");
const role = require("../models/roleSchema");
const userDocumentRoute = express.Router();

userDocumentRoute.post('/', Auth, function (req, res) {
    uploadSingleImage(req, res, async function (err) {
        if (err) {
            return res.status(400).send({ message: err.message })
        }

        // Everything went fine.
        const file = req.files;

        let resume = file && file.resume && file.resume[0].filename
        let offer_letter = file && file.offer_letter && file.offer_letter[0].filename
        let pan_card = file && file.pan_card && file.pan_card[0].filename
        let other = file && file.other && file.other[0].filename
        let photo = file && file.photo && file.photo[0].filename
        let aadhar_card = file && file.aadhar_card && file.aadhar_card[0].filename

        try {
            // check data exist or not
            const data = await user_document.findOne({ user_id: req.body.user_id })
            // role name get 
            let roleData = await role.findOne({ _id: req.user.role_id });

            if (data) {
                let response = await user_document.findByIdAndUpdate({ _id: data._id }, { photo, aadhar_card, resume, pan_card, offer_letter, other });
                if (response) {
                    if (roleData.name.toLowerCase() !== "admin") {
                        createActivity(req.user._id, "User document detail updated by");
                    }
                    return res.status(200).json({ success: true, message: "Data updated successfully." })
                } else {
                    return res.status(404).json({ success: false, message: "Record Not found." })
                }
            } else {
                const documentData = new user_document({ photo, pan_card, resume, aadhar_card, offer_letter, other, user_id: req.body.user_id });
                const response = await documentData.save();
                if (roleData.name.toLowerCase() !== "admin") {
                    createActivity(req.user._id, "User document detail added by");
                }
                return res.status(201).json({ success: true, message: "Data added Successfully." })
            }
        } catch (error) {
            res.status(500).json({ message: error.message || "Internal server error", success: false })
        }
    })
})


module.exports = userDocumentRoute