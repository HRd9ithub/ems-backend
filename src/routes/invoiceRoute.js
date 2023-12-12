const {Router} = require("express");
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { createInvoice, updateInvoice, getSingleInvoice, getInvoice } = require("../controller/invoiceController");
const invoice = require("../models/invoiceSchema");
const { invoicePermission } = require("../middlewares/permission");
const { importDocument, attchmentFile } = require("../middlewares/documentUpload");

const route = Router();

const formValidation = [
    check("invoiceId","Invoice Id is field required").notEmpty().custom(async (invoiceId, { req }) => {
        const data = await invoice.findOne({ invoiceId: { $regex: new RegExp('^' + req.body.invoiceId, 'i') } })

        if (invoiceId && data && data._id != req.params.id) {
            throw new Error("Invoice Id already exists.")
        }
    }),
    check("issue_date", "Invalid issue Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: "YYYY-MM-DD" }),
    check('clientId', "Client id is a required field.").isMongoId(),
    check('userId', "User id is a required field.").isMongoId(),
    check('totalAmount', "total amount is a required field.").notEmpty(),
    check('tableData', "table data is a required field.").notEmpty(),
]

// add route
route.post("/",Auth,attchmentFile,formValidation,createInvoice);

// update route
route.put("/:id",Auth,attchmentFile,formValidation,updateInvoice);

// single data route
route.get("/:id",Auth,getSingleInvoice);

//  data route
route.get("/",Auth,invoicePermission, getInvoice);


module.exports = route;
