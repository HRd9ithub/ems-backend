const {Router} = require("express");
const { check } = require("express-validator");
const invoice_client = require("../models/invoiceClientSchema");
const Auth = require("../middlewares/authtication");
const { createInvoiceClient, getClientName, getSingleClient, updateInvoiceClient } = require("../controller/invoiceClientController");
const profile_image = require("../middlewares/ImageProfile");

const router = Router();

const formValidation = [
    check('client_id', "Client id field is required.").notEmpty().custom(async (client_id, { req }) => {
        const data = await invoice_client.findOne({ client_id: { $regex: new RegExp('^' + req.body.client_id, 'i') } })
        console.log('req.params :>> ', req.params,data._id);
        if (client_id && data && data._id != req.params.id) {
            throw new Error("Client Id already exists.")
        }
    }),
    check('first_name', "First name field is required.").notEmpty(),
    check('last_name', "Last name field is required.").notEmpty(),
    check("email", "Email must be a valid email.").isEmail().custom(async (email, { req }) => {
        const data = await invoice_client.findOne({ email: { $regex: new RegExp('^' + req.body.email, 'i') } })
        
        if (email && data && data._id != req.params.id) {
            throw new Error("Email address already exists.")
        }
    }),
    check("phone", "phone number must be at least 10 character.").isLength({ min: 10, max: 10 }),
    check('state', "State field is required.").notEmpty(),
    check('city', "City field is required.").notEmpty(),
    check('postcode', "Postcode field is required.").notEmpty(),
    check('address', "Address field is required.").notEmpty()
]

// add route
router.post('/',Auth,profile_image,formValidation,createInvoiceClient);

// get name route
router.get('/',Auth,getClientName);

// single data
router.get('/:id',Auth,getSingleClient);

// update data
router.put('/:id',Auth,profile_image,formValidation,updateInvoiceClient);

module.exports = router;