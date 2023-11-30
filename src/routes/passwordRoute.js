let express = require("express");
const Auth = require("../middlewares/authtication");
const { createPassword, getPassword, updatePassword, deletePassword } = require("../controller/passwordController");
const { check } = require("express-validator");
const { passwordPermission } = require("../middlewares/permission");
let passwordRoute = express.Router();

let passwordValidation = [
    check("title", "Title is a required field.").notEmpty(),
    check("url", "Url is a required field.").notEmpty(),
    check("user_name", "User Name is a required field.").notEmpty(),
    check("password", "Password is a required field.").notEmpty(),
    check("note", "Note is a required field.").notEmpty(),
    // check('access_employee', "Access employee Insert values ​​into the array.").isArray(),
]


// add password
passwordRoute.post("/",Auth,passwordPermission,passwordValidation,createPassword);

// update password
passwordRoute.put("/:id",Auth,passwordPermission,passwordValidation,updatePassword);

// delete password
passwordRoute.delete("/:id",Auth,passwordPermission,deletePassword);

// get password
passwordRoute.get("/",Auth,passwordPermission,getPassword);



module.exports = passwordRoute;
