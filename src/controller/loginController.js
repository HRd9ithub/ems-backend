const expressValidator = require("express-validator");
const bcrypt = require("bcryptjs")
const user = require("../models/userSchema");
var jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const loginInfo = require("../models/loginInfoSchema");
const timeSheet = require("../models/timeSheetSchema");
const forgetEmail = require("../handler/forgetEmail");
const tokenSchema = require("../models/tokenSchema");
const role = require("../models/roleSchema");
const moment = require("moment");
const sendOtpMail = require("../handler/otpEmail");
const createActivity = require("../helper/addActivity");
const account = require("../models/accountSchema");
const emergencyRoute = require("../routes/emergencyRoute");
const emergency_contact = require("../models/emergencySchema");
const decryptData = require("../helper/decryptData");
const encryptData = require("../helper/encrptData");

const addTime = async (res, id, login) => {
    try {
        let data_detail = await timeSheet.findOne({ user_id: id, date: moment(new Date()).format("YYYY-MM-DD") });

        if (!data_detail) {
            let Hours = new Date().getHours();
            let Minutes = new Date().getMinutes();
            let second = new Date().getSeconds();
            let date = moment(new Date()).format("YYYY-MM-DD")
            let login_time = Hours + ":" + Minutes + ":" + second;

            // add data database
            const timeData = new timeSheet({
                user_id: id,
                date,
                login_time: login_time,
                login_id: login
            });

            await timeData.save();
        }
        return true
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
        return
    }
}

// user login function
const userLogin = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req);

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }
        // email check exist or not
        const userData = await user.findOne({ email: req.body.email, joining_date: { $lte: moment(new Date()).format("YYYY-MM-DD") } })
        if (userData) {
            // password compare
            let isMatch = await userData.comparePassword(req.body.password);

            if (isMatch) {

                if (decryptData(userData.status) !== 'Inactive' && !userData.delete_at && (!userData.leaveing_date || moment(userData.leaveing_date).format("YYYY-MM-DD") > moment(new Date()).format("YYYY-MM-DD"))) {

                    let mailsubject = 'Verification Code';

                    let otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

                    // mail send function
                    let result = await sendOtpMail(res, req.body.email, mailsubject, otp);
                    if (result === "send") {
                        // update data for otp
                        const response = await user.findByIdAndUpdate({ _id: userData._id }, { otp, expireIn: new Date().getTime() + 5 * 60000, $unset: { token: 1 } }, { new: true })
                        return res.status(200).json({ success: true, message: "OTP sent successfully.",data: response.email })
                    }

                } else {
                    if (userData && decryptData(userData.status) === 'Inactive' && !userData.delete_at) {
                        return res.status(400).json({ message: "Your account is inactive; please contact your administrator.", success: false })
                    } else {
                        // email not match send message
                        return res.status(404).json({ message: "Invalid email or password.", success: false })
                    }
                }
            } else {
                // password not match send message
                return res.status(404).json({ message: "Invalid email or password.", success: false })
            }
        } else {
            // email not match send message
            return res.status(404).json({ message: "Invalid email or password.", success: false })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// login otp verify
const verifyOtp = async (req, res) => {
    try {
        let login = "";
        let time = "";

        const errors = expressValidator.validationResult(req);

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        // get data for email
        const data = await user.findOne({ email: req.body.email, otp: req.body.otp });

        if (data) {
            const role_detail = await role.findOne({ _id: data.role_id });
            let currTime = new Date().getTime()
            let diff = data.expireIn - currTime

            if (diff < 0) {
                // await user.findByIdAndUpdate({ _id: data._id }, { $unset: { otp: 1, expireIn: 1 } }, { new: true })
                return res.status(400).json({ message: "OTP has expired.", success: false })
            }

            // generate token
            const token = await data.generateToken();
            if ((role_detail.name).toLowerCase() !== "admin") {
                const loginData = new loginInfo({
                    userId: data._id,
                    city: req.body.city,
                    device: req.body.device,
                    device_name: req.body.device_name,
                    ip: req.body.ip,
                    browser_name: req.body.browser_name
                });
                login = await loginData.save();
                if (req.body.isDesktop) {
                    time = await addTime(res, data._id, login._id)
                }
                createActivity(data._id, 'Login by')
            }

            let accountCount = await account.find({user_id : data._id}).count();
            let emergency_contactcount = await emergency_contact.find({user_id : data._id}).count();

            if (role_detail.name.toLowerCase() === "admin" || (login && time) || !req.body.isDesktop) {
                // otp match for update otp value null
                const response = await user.findByIdAndUpdate({ _id: data._id }, { $unset: { otp: 1, expireIn: 1 } }, { new: true })
                return res.status(200).json({ success: true, message: "Logged in successfully.", token: token, id: response._id , userVerify : (accountCount=== 0 || emergency_contactcount === 0) && role_detail.name.toLowerCase() !== "admin"  })
            }
        } else {
            // not match send message
            return res.status(400).json({ message: "OTP is invalid.", success: false })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// resend otp function
const ResendOtp = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req);

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }

        // email check exist or not
        const userData = await user.findOne({ email: req.body.email, joining_date: { $lte: moment(new Date()).format("YYYY-MM-DD") } })
        if (userData && userData.status !== 'Inactive' && !userData.delete_at) {
            let mailsubject = 'Verification Code';

            let otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

            // mail send function
            let result = await sendOtpMail(res, req.body.email, mailsubject, otp);
            if (result === "send") {
                // update data for otp
                const response = await user.findByIdAndUpdate({ _id: userData._id }, { otp, expireIn: new Date().getTime() + 5 * 60000 }, { new: true })
                return res.status(200).json({ success: true, message: "OTP sent successfully." })
            }
        } else {
            // email not match send message
            if (userData && userData.status === 'Inactive' && !userData.delete_at) {
                return res.status(400).json({ message: "Your account is inactive; please contact your administrator.", success: false })
            } else {
                // email not match send message
                return res.status(404).json({ message: "Account not found with the provided email.", success: false })
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// forget password send mail
const mailSend = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req);

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err[0], success: false })
        }

        // email check exist or not
        const userData = await user.findOne({ email: req.body.email })

        if (userData && userData.status === "Active" && (!userData.leaveing_date || moment(userData.leaveing_date).format("YYYY-MM-DD") > moment(new Date()).format("YYYY-MM-DD"))) {
            // generate token
            var token = jwt.sign({ _id: userData._id }, process.env.SECRET_KEY, { expiresIn: "30m" });
            let mailsubject = 'Reset Password';
            // mail content
            let url = `${process.env.RESET_PASSWORD_URL}/reset-password?email=${req.body.email}&token=${token}`

            // mail send function
            let result = await forgetEmail(res,req.body.email, mailsubject, url);
            if (result === "send") {

                await tokenSchema.deleteMany({ email: req.body.email })

                let tokenData = new tokenSchema({
                    email: req.body.email,
                    token,
                    expireIn: new Date().getTime() + 30 * 60000
                })
                await tokenData.save();
                return res.status(200).json({ success: true, message: "A password reset link has been emailed to you." })
            }
        } else {
            if (!userData) {
                // email not match send message
                return res.status(404).json({ message: "Account not found with the provided email.", success: false })
            } else {
                if ((moment(userData.leaveing_date).format("YYYY-MM-DD") <= moment(new Date()).format("YYYY-MM-DD"))) {
                    return res.status(400).json({ message: "You are no longer an employee. I'm sorry.", success: false })
                } else {
                    return res.status(400).json({ message: "Your account is inactive; please contact your administrator.", success: false })
                }
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// reset password function
const resetPassword = async (req, res) => {
    let verifyUser = ""
    try {
        const errors = expressValidator.validationResult(req);

        let err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: err, success: false })
        }
        let TokenArray = req.headers['authorization'];
        if (!TokenArray) return res.status(400).json({ success: false, message: "Token is a required field." })
        let token = TokenArray.split(" ")[1];

        const data = await tokenSchema.findOne({
            email: req.body.email,
            token: token,
        });


        if (!data) return res.status(400).json({ success: false, message: "The reset password link has expired. To reset your password, return to the login page and select 'Forgot Password' to have a new email sent." })

        let currTime = new Date().getTime()
        let diff = data.expireIn - currTime

        if (diff > 0) {

            if (!token) return res.status(400).json({ success: false, message: "The reset password link has expired. To reset your password, return to the login page and select 'Forgot Password' to have a new email sent." })

            verifyUser = jwt.verify(token, process.env.SECRET_KEY);

            // email check exist or not
            const userData = await user.findOne({ email: req.body.email })

            if (userData) {
                // password convert hash
                let passwordHash = await bcrypt.hash(req.body.password, 10)
                const response = await user.findByIdAndUpdate({ _id: userData._id }, { password: passwordHash }, { new: true })
                await tokenSchema.deleteOne({ _id: data._id })
                return res.status(200).json({ success: true, message: "Password reset successfully." })
            } else {
                return res.status(404).json({ success: false, message: "Your password reset has failed." })
            }
        } else {
            return res.status(400).json({ success: false, message: "The reset password link has expired. To reset your password, return to the login page and select 'Forgot Password' to have a new email sent." })
        }
    } catch (error) {
        if (!verifyUser) return res.status(400).json({ success: false, message: "The reset password link has expired. To reset your password, return to the login page and select 'Forgot Password' to have a new email sent." })
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// check link reset password link
const checkLink = async (req, res) => {
    try {
        let TokenArray = req.headers['authorization'];
        if (!TokenArray) return res.status(400).json({ success: false, message: "Token is Required." })
        let token = TokenArray.split(" ")[1];

        if (!token) return res.status(400).json({ success: false, error: "The reset password link has expired. To reset your password, return to the login page and select 'Forgot Password' to have a new email sent." })

        const data = await tokenSchema.findOne({
            token: token,
        });

        if (!data) return res.status(400).json({ success: false, error: "The reset password link has expired. To reset your password, return to the login page and select 'Forgot Password' to have a new email sent." })

        let currTime = new Date().getTime()
        let diff = data.expireIn - currTime

        if (diff < 0) {
            return res.status(400).json({ success: false, error: "The reset password link has expired. To reset your password, return to the login page and select 'Forgot Password' to have a new email sent." })
        } else {
            return res.status(200).json({ success: true, message: "The password reset link has not expired." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// logout  function
const userLogout = async (req, res) => {
    try {
        if (req.user) {
            let data = await timeSheet.findOne({ user_id: req.user._id, date: moment(new Date()).format("YYYY-MM-DD") });
            let roleData = await role.findOne({_id: req.user.role_id});
            // get menu data in database
            if (data && roleData?.name.toLowerCase() !== "admin") {
                let Hours = new Date().getHours();
                let Minutes = new Date().getMinutes();
                let second = new Date().getSeconds();
                let logout_time = Hours + ":" + Minutes + ":" + second;
                var total = moment.utc(moment(logout_time, "HH:mm:ss").diff(moment(data.login_time, "HH:mm:ss"))).format("HH:mm")

                const response = await timeSheet.findByIdAndUpdate({ _id: data._id }, { logout_time, total }, { new: true })
                createActivity(req.user._id,"Log out by");
            }
            await user.findByIdAndUpdate({ _id: req.user._id }, { $unset: { token: 1 } }, { new: true })
            return res.status(200).json({ success: true, message: "You have successfully logged out." })
        } else {
            return res.status(404).json({ success: false, message: "The logout has failed." })
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

module.exports = { userLogin, verifyOtp, mailSend, resetPassword, userLogout, ResendOtp, checkLink }