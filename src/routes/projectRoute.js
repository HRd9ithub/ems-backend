const express = require("express")
const Auth = require("../middlewares/authtication");
const {projectPermission } = require("../middlewares/permission");
const { createProject, getProject, updateProject, deleteProject } = require("../controller/projectController");
const { check } = require("express-validator");

const projectRoute = express.Router();

let projectNameValidation = [
    check("name","Project name is a Required field.").notEmpty(),
]

// create Project api
projectRoute.post('/',Auth,projectPermission,projectNameValidation,createProject);

// update Project api
projectRoute.patch('/:id',Auth,projectPermission,projectNameValidation,updateProject);

// delete Project api
projectRoute.delete('/:id',Auth,projectPermission,deleteProject);

// get Project api
projectRoute.get('/',Auth,projectPermission,getProject);


module.exports = projectRoute