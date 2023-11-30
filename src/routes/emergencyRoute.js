const express = require("express")
const expressValidator = require("express-validator");
const Auth = require("../middlewares/authtication");
const { addEmergency } = require("../controller/emergencyController");
const emergencyRoute = express.Router();

// account detail add api
emergencyRoute.post('/', Auth, [
    expressValidator.body('name', "Name field is required.").notEmpty(),
    expressValidator.body('user_id', "User id is Required.").isMongoId(),
    expressValidator.body('relationship', "Relationship field is required.").notEmpty(),
    expressValidator.body('address', "Address field is required.").notEmpty(),
    expressValidator.body('email').notEmpty().withMessage("Email is Required.").custom(async (email, { req }) => {
        if (email && !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            throw new Error("Please Email must be a valid email.")
        }
    }),
    expressValidator.body("phone", "Phone number must be at least 10 character").isLength({ min: 10, max: 10 }),
   ], addEmergency)


module.exports = emergencyRoute