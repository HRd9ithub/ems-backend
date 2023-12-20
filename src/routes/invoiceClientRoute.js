const {Router} = require("express");
const { check } = require("express-validator");
const invoice_client = require("../models/invoiceClientSchema");
const Auth = require("../middlewares/authtication");
const { createInvoiceClient, getClientName, getSingleClient, updateInvoiceClient, checkEmail, getClient, DeleteClient, restoreClient } = require("../controller/invoiceClientController");
const profile_image = require("../middlewares/ImageProfile");
const { clientPermission } = require("../middlewares/permission");

const router = Router();

const formValidation = [
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
    check('address', "Address field is required.").notEmpty(),
]

// add route
router.post('/',Auth,clientPermission,profile_image,formValidation,createInvoiceClient);

// email check route
router.post('/email',Auth,checkEmail);

// get name route
router.get('/name',Auth,clientPermission,getClientName);

// get data route
router.get('/',Auth,clientPermission,getClient);

// single data
router.get('/:id',Auth,getSingleClient);

// update data
router.put('/:id',Auth,clientPermission,profile_image,formValidation,updateInvoiceClient);

// restore route
router.patch("/:id",Auth,clientPermission,restoreClient);

// delete data
router.delete('/:id',Auth,clientPermission, DeleteClient);


module.exports = router;