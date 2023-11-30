const express = require("express")
const expressValidator = require("express-validator");
const Auth = require("../middlewares/authtication");
const { addEditEduction, deleteEducation } = require("../controller/educationController");
const educationRoute = express.Router();

// eduction detail add and edit api
educationRoute.post('/', Auth, [
    expressValidator.body('user_id', "User id is Required.").isMongoId(),
    expressValidator.body('info', "Insert values ​​into the array.").isArray(),
    expressValidator.body('info.*.year', "Year Field is Required.").notEmpty().custom(async (year, { req }) => {
        if (year && (year.length < 4 || year > new Date().getFullYear())) {
            throw new Error('Please enter a valid year.')
        }
    }),
    expressValidator.body('info.*.percentage', "Percentage Field is Required.").notEmpty().custom(async (percentage, { req }) => {
        if (percentage && !percentage.toString().match(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/)) {
            throw new Error('Please enter a valid percentage.')
        }
    }),
    expressValidator.body('info.*.university_name', "University Name Field is Required.").notEmpty(),
    expressValidator.body('info.*.degree', "Degree Field is Required.").notEmpty(),
], addEditEduction)

// eduction detail delete api
educationRoute.delete('/:id', Auth, deleteEducation)


module.exports = educationRoute