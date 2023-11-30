const expressValidator = require("express-validator");
const education = require("../models/educationSchema");
const role = require("../models/roleSchema");
const createActivity = require("../helper/addActivity");
const encryptData = require("../helper/encrptData");

// create and edit education detail function
const addEditEduction = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req);

        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: [...new Set(err)], success: false })
        }

        // check data exist or not
        const data = await education.findOne({ user_id: req.body.user_id })

        if (data) {
            let response = await education.deleteMany({ user_id: req.body.user_id });
        }
        for (const key in req.body.info) {
            const educationData = new education({
                user_id: req.body.user_id,
                year: encryptData(req.body.info[key].year),
                percentage: encryptData(req.body.info[key].percentage),
                university_name: encryptData(req.body.info[key].university_name),
                degree: encryptData(req.body.info[key].degree)
            });
            const response = await educationData.save();
        }
        // role name get 
        let roleData = await role.findOne({ _id: req.user.role_id });

        if (roleData.name.toLowerCase() !== "admin") {
            if(!data){
                createActivity(req.user._id, "Education detail added by");
            }else{
                createActivity(req.user._id, "Education detail updated by");
            }
        }
        return res.status(200).json({ success: true, message: !data ? "Data added successfully." : "Data updated successfully."})
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}

// delete education detail function
const deleteEducation = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })

        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: [...new Set(err)], success: false })
        }

        let response = await education.findByIdAndDelete(
            { '_id': req.params.id });

        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted Successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Record Not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error", success: false })
    }
}



module.exports = { addEditEduction, deleteEducation }