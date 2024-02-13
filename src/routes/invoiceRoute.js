const {Router} = require("express");
const { check } = require("express-validator");
const Auth = require("../middlewares/authtication");
const { createInvoice, updateInvoice, getSingleInvoice, getInvoice, deleteInvoice, restoreInvoice, statusInvoice, downloadInvoice } = require("../controller/invoiceController");
const invoice = require("../models/invoiceSchema");
const { invoicePermission } = require("../middlewares/permission");
const { attchmentFile } = require("../middlewares/documentUpload");

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
    check('businessId', "Business id is a required field.").isMongoId(),
    check('userId', "User id is a required field.").isMongoId(),
    check('totalSubAmount', "Total sub amount is a required field.").notEmpty(),
    check('totalAmount', "Total amount is a required field.").notEmpty(),
    check('tableData', "Item Name is a required field.").notEmpty(),
    check('newColumns', "Columns is a required field.").notEmpty(),
    check('currency', "Currency is a required field.").notEmpty(),
    check('currencyValue', "Currency Value is a required field.").notEmpty(),
    check('taxType', "Tax type is a required field.").notEmpty(),
]

// add route
route.post("/",Auth,invoicePermission,attchmentFile,formValidation,createInvoice);

// update route
route.put("/:id",Auth,invoicePermission,attchmentFile,formValidation,updateInvoice);

// status update route
route.patch("/status/:id",Auth,invoicePermission,[
    check("status","Status is required").notEmpty(),
    check("payment_method","Payment method is required").notEmpty(),
    check("payment_date","Date is required").notEmpty(),
],statusInvoice);

// download invoice route
route.get("/invoice-download",downloadInvoice);

// restore route
route.patch("/:id",Auth,invoicePermission,restoreInvoice);

// single data route
route.get("/:id",Auth,invoicePermission,getSingleInvoice);

//  data route
route.get("/",Auth,invoicePermission, getInvoice);

//  delete route
route.delete("/:id",Auth,invoicePermission, deleteInvoice);


module.exports = route;
