let express = require("express");
let activityRoute = express.Router();
const getActivity = require("../controller/activityController");
const Auth = require("../middlewares/authtication");
const { activityPermission } = require("../middlewares/permission");


// get data for route
activityRoute.get("/",Auth, activityPermission, getActivity);


module.exports = activityRoute;