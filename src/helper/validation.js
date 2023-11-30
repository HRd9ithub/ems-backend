const { check } = require("express-validator");
const user = require("../models/userSchema");

exports.userValidation = [
    check("first_name", "First name is required.").isAlpha(),
    check("last_name", "Last name is required.").isAlpha(),
    check("email", "Email must be a valid email.").isEmail().custom(async (email, { req }) => {
        const data = await user.findOne({ email: { $regex: new RegExp('^' + req.body.email, 'i') } })

        if (email && data) {
            throw new Error("Email address already exists.")
        }
    }),
    check("phone", "phone number must be at least 10 character.").isLength({ min: 10, max: 10 }),
    check("password", "Password is Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
    check("employee_id", "Employee id is Required.").notEmpty().custom(async (id, { req }) => {
        const employee_id = await user.findOne({ employee_id: { $regex: new RegExp('^' + req.body.employee_id, 'i') } })

        if (id && employee_id) {
            throw new Error('Employee id already exists.')
        }
    }),
    check("joining_date", "Invalid Joining Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: "YYYY-MM-DD" }),
    check('gender', "Invalid gender.Please enter the gender value for Male or Female.").isIn(["Male", "Female"]),
    check('role_id', "Role id is Required.").isMongoId(),
    check('designation_id', "Designation id is Required.").isMongoId(),
    check('report_by', "Report by id is Required.").isMongoId(),
] 

exports.passwordValidation = [
    check("current_password", "Current Password is Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
    check("new_password", "New Password is Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
    check("confirm_password","Confirm password is required").notEmpty().custom(async (confirmPassword, { req }) => {
        const password = req.body.new_password
        // If password and confirm password not same
        // don't allow to sign up and throw error
        if (password !== confirmPassword) {
            throw new Error('New Password and Confirm Password does not match.')
        }
    })
]