const express = require("express")
const expressValidator = require("express-validator");
const { userLogin, verifyOtp, mailSend, resetPassword, userLogout, ResendOtp, checkLink } = require("../controller/loginController");
const Auth = require("../middlewares/authtication");
const AuthRoute = express.Router();

// login api 
AuthRoute.post('/login', [
    expressValidator.body('email', "Email must be a valid email.").isEmail(),
    expressValidator.body("password", "Password is a required field. ").notEmpty()
],userLogin)

// otp verification api
AuthRoute.patch('/otp', [expressValidator.body('email', "Email must be a valid email.").isEmail(),
expressValidator.body("city", "city is required. ").notEmpty(),
expressValidator.body("device", "device is required.").notEmpty(),
expressValidator.body("browser_name", "browser name is required.").notEmpty(),
expressValidator.body("ip", "ip is required.").notEmpty(),
expressValidator.body("otp", "otp is required.").notEmpty().custom(async (otp, { req }) => {
    if (otp && otp.length != 4) {
        throw new Error('OTP must bet 4 characters.')
    }
}),
],verifyOtp )


// resend otp api 
AuthRoute.patch('/resendOtp', [
    expressValidator.body('email', "Email must be a valid email.").isEmail(),
],ResendOtp)

// forget password for email verification and send reset link for email api
AuthRoute.post('/forgotPassword', [
    expressValidator.body('email', "Email must be a valid email.").isEmail()
],mailSend)

// reset password api
AuthRoute.post('/resetpassword', [
    expressValidator.body('email', "Email must be a valid email.").isEmail(),
    expressValidator.body("password", "Password is Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
],resetPassword)

// reset password api
AuthRoute.get('/checklink',checkLink)

// logout  api
AuthRoute.post('/logout',Auth,userLogout)



module.exports = AuthRoute