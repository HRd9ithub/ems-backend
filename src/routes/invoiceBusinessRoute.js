const express = require("express");
const Auth = require("../middlewares/authtication");
const { createBunsiness, updateBunsiness, getSingleBunsiness, getBunsinessName } = require("../controller/invoiceBusinessController");
const { check } = require("express-validator");
const profile_image = require("../middlewares/ImageProfile");

const route = express.Router();

route.use(Auth);

const businessFieldValidation = [
    check("business_name", "Business name is a required field.").notEmpty(),
    check("address", "Address is a required field.").notEmpty()
]

// create route
route.post('/', profile_image, businessFieldValidation, createBunsiness);

// update route
route.put('/:id', profile_image, businessFieldValidation, updateBunsiness);

// get name list route
route.get('/name', getBunsinessName);

// single get route
route.get('/:id', getSingleBunsiness);


module.exports = route;