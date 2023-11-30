const expressValidator = require("express-validator");
const project = require("../models/projectSchema");

// create Project function
const createProject = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // find department name in database
        const data = await project.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } });

        if (data) {
            // exists project name for send message
            return res.status(400).json({ error: "Project name already exists.", success: false })
        }

        // not exists project name for add database
        const projectData = new project(req.body);
        const response = await projectData.save();
        return res.status(201).json({ success: true, message: "Data added successfully." })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update project function
const updateProject = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // find project name in database
        const data = await project.findOne({ name: { $regex: new RegExp('^' + req.body.name, 'i') } });

        if (data && data._id != req.params.id) {
            // exists project name for send message
            return res.status(400).json({ error: "Project name already exists.", success: false })
        }

        // not exists project name for update database
        const response = await project.findByIdAndUpdate({ _id: req.params.id }, req.body)
        
        if (response) {
            return res.status(200).json({ success: true, message: "Data updated successfully." })
        } else {
            return res.status(404).json({ success: false, message: "The project name is not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update project function
const deleteProject = async (req, res) => {
    try {
        const response = await project.findByIdAndUpdate({ _id: req.params.id })
        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        } else {
            return res.status(404).json({ success: false, message: "The project name is not found." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get project function
const getProject = async (req, res) => {
    try {
        // get project data in database
        const data = await project.find()

        return res.status(200).json({ success: true, message: "Successfully fetch a project data.", data: data,permissions : req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

module.exports = {createProject,getProject,updateProject,deleteProject}