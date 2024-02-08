const {Router} = require("express");
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { createInvoiceClient, getClientName, getSingleClient, updateInvoiceClient, getClient, DeleteClient, restoreClient } = require("../controller/invoiceClientController");
const profile_image = require("../middlewares/ImageProfile");
const { clientPermission } = require("../middlewares/permission");

const router = Router();

// Regular expression for GSTIN validation
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

const formValidation = [
    check('business_name', "Business Name is a required field.").notEmpty(),
    check('address', "Address field is required.").notEmpty()
]

// add route
router.post('/',Auth,clientPermission,profile_image,formValidation,createInvoiceClient);

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