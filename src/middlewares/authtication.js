const jwt = require('jsonwebtoken');
const user = require('../models/userSchema');
const SECRET_KEY = process.env.SECRET_KEY;
const moment = require("moment");
const { RemoveToken } = require('../helper/removeToken');

async function Auth(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send("Authorization failed. No access token.");
    }
    try {
        const token = authorization.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Invalid Token Format'
            })
        }
        const decode = jwt.verify(token, SECRET_KEY);
        if (decode.date === new Date().toLocaleDateString()) {
            const data = await user.findOne({ _id: decode._id }).select("-password")
            if (data) {
                if (data.token == token && data.status === "Active" && !data.delete_at && (!data.leaveing_date || moment(data.leaveing_date).format("YYYY-MM-DD") > moment(new Date()).format("YYYY-MM-DD")) && moment(data.joining_date).format("YYYY-MM-DD") <= moment(new Date()).format("YYYY-MM-DD")) {
                    req.user = data
                    next()
                } else {
                    RemoveToken(decode._id)
                    return res.status(401).json({ message: "Unauthenticated.", success: false })
                }
            } else {
                RemoveToken(decode._id )
                return res.status(401).json({ message: "Unauthenticated.", success: false })
            }
        }
        else {
            RemoveToken(decode._id )
            return res.status(401).json({ message: "Unauthenticated.", success: false })
        }
    } catch (error) {
        res.status(500).json({
            message:  error.message || 'Internal server Error',
            stack: error.stack
        });
    }
}

module.exports = Auth