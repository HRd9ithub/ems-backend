const { default: mongoose } = require("mongoose");
const invoice = require("../models/invoiceSchema");
const invoice_table = require("../models/invoiceTableSchema");
const expressValidator = require("express-validator");
const decryptData = require("../helper/decryptData");


// create invoice
const createInvoice = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        let { invoiceId, issue_date, due_date, extra_field,terms,contact, clientId, userId,currencyValue, totalAmount, signImage, note, currency, attchmentFile, status, tableData } = req.body;

        await invoice_table.deleteMany({ invoiceId });

        // table create
        JSON.parse(tableData).forEach(async (element) => {
            await invoice_table.create({
                itemName: element.itemName,
                rate: element.rate,
                quantity: element.quantity,
                amount: element.amount,
                invoiceId: invoiceId
            });
        });

        let fileUrl = [];

        if (req.files?.image !== undefined) {
            fileUrl = req.files.image.map(val => val.filename);
        }

        if (note == '<p><br></p>' || note === 'null') {
            note = "";
        }

        // invoice create
        const response = await invoice.create({
            invoiceId,
            issue_date,
            due_date,
            extra_field,
            clientId,
            userId,
            totalAmount,
            signImage,
            note,
            currency,
            currencyValue,
            attchmentFile: fileUrl,
            status,
            terms,
            contact
        })

        return res.status(201).json({
            message: "Data added successfully.",
            success: true,
            id: response._id
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        })
    }
}

// update invoice
const updateInvoice = async (req, res) => {
    try {
        const errors = expressValidator.validationResult(req)

        const err = errors.array().map((val) => {
            return val.msg
        })
        // check data validation error
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: err, success: false });
        }

        let { invoiceId, issue_date, due_date, extra_field,terms,contact, clientId, userId,currencyValue, totalAmount, signImage, note, currency, attchmentFile, status, tableData } = req.body;

        await invoice_table.deleteMany({ invoiceId });

        // table create
        JSON.parse(tableData).forEach(async (element) => {
            await invoice_table.create({
                itemName: element.itemName,
                rate: element.rate,
                quantity: element.quantity,
                amount: element.amount,
                invoiceId: invoiceId
            });
        });

        let fileUrl = [];

        if (typeof (req.body.image) == 'string' && req.body.image !== undefined) {
            fileUrl.push(req.body.image)
        } else if (typeof (req.body.image) == 'object') {
            fileUrl.push(...req.body.image)
        }

        if (req.files.image !== undefined) {
            req.files.image.map(val => fileUrl.push(val.filename));
        }

        if (note == '<p><br></p>' || note === 'null') {
            note = "";
        }
        // invoice create
        const response = await invoice.findByIdAndUpdate({ _id: req.params.id }, {
            invoiceId,
            issue_date,
            due_date,
            extra_field,
            clientId,
            userId,
            totalAmount,
            signImage,
            note,
            attchmentFile: fileUrl,
            status,
            currency,
            currencyValue,
            terms,
            contact
        })

        return res.status(200).json({
            message: "Data updated successfully.",
            success: true,
            id: response._id
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        })
    }
}

// single data get
const getSingleInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await invoice.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "invoice_clients", localField: "clientId", foreignField: "_id", as: "invoiceClient"
                }
            },
            {
                $lookup: {
                    from: "users", localField: "userId", foreignField: "_id", as: "invoiceProvider"
                }
            },
            {
                $lookup: {
                    from: "invoice_accounts", localField: "_id", foreignField: "invoice_id", as: "bankDetails"
                }
            },
            {
                $lookup: {
                    from: "invoice_tables", localField: "invoiceId", foreignField: "invoiceId", as: "productDetails"
                }
            },
            {
                $project: {
                    "invoiceProvider.password": 0,
                    "invoiceProvider.token": 0,
                }
            }
        ])

        const decryptResult = result.map((val) => {
            return {
                ...val,
                invoiceClient: val.invoiceClient.map((elem) => {
                    return {
                        ...elem,
                        "first_name": decryptData(elem.first_name),
                        "last_name": decryptData(elem.last_name),
                        "phone": decryptData(elem.phone),
                        "country": decryptData(elem.country),
                        "state": decryptData(elem.state),
                        "city": decryptData(elem.city),
                        "postcode": decryptData(elem.postcode),
                        "address": decryptData(elem.address),
                    }
                }),
                bankDetails: val.bankDetails.map((elem) => {
                    return {
                        ...elem,
                        "bank": decryptData(elem.bank),
                        "account_number": decryptData(elem.account_number),
                        "ifsc_code": decryptData(elem.ifsc_code),
                        "branch_name": decryptData(elem.branch_name),
                        "name": decryptData(elem.name),
                    }
                }),
                invoiceProvider: val.invoiceProvider.map((elem) => {
                    return {
                        ...elem,
                        "first_name": decryptData(elem.first_name),
                        "last_name": decryptData(elem.last_name),
                        "phone": decryptData(elem.phone),
                        "gender": decryptData(elem.gender),
                        "country": decryptData(elem.country),
                    }
                })
            }
        })
        return res.status(200).json({
            message: "success",
            success: true,
            data: decryptResult,
            permissions: req.permissions
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error",
            success: false,
            statusCode: 500
        })
    }
}

//  data get
const getInvoice = async (req, res) => {
    try {
        const { startDate, endDate, id } = req.query;

        const result = await invoice.aggregate([
            {
                $match: {
                    deleteAt: { $exists: false },
                    $and: [
                        { "issue_date": { $gte: new Date(startDate) } },
                        { "issue_date": { $lte: new Date(endDate) } },
                    ]
                }
            },
            {
                $lookup: {
                    from: "invoice_clients", localField: "clientId", foreignField: "_id", as: "invoiceClient"
                }
            },
            {
                $unwind: {
                    path: "$invoiceClient",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "invoiceClient._id": !id ? { $nin: [] } : { $eq: new mongoose.Types.ObjectId(id) }
                }
            },
            {
                $lookup: {
                    from: "invoice_tables", localField: "invoiceId", foreignField: "invoiceId", as: "productDetails"
                }
            },
            {
                $project: {
                    invoiceId: 1,
                    issue_date: 1,
                    totalAmount: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    productDetails: 1,
                    currency : 1,
                    currencyValue : 1,
                    "invoiceClient.first_name": 1,
                    "invoiceClient.last_name": 1
                }
            }
        ])

        const decryptResult = result.map((val) => {
            return {
                ...val,
                invoiceClient: { "name": decryptData(val.invoiceClient.first_name).concat(" ", decryptData(val.invoiceClient.last_name)) }
            }
        })
        return res.status(200).json({
            message: "success",
            success: true,
            data: decryptResult,
            permissions: req.permissions
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error",
            success: false,
            statusCode: 500
        })
    }
}

// delete invoice
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await invoice.findByIdAndUpdate({ _id: id }, { $set: { deleteAt: new Date() } });

        if (!result) {
            return res.status(404).json({
                message: "Record not found.",
                success: false
            })
        } else {
            return res.status(200).json({
                message: "Data Deleted successfully.",
                success: true
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error",
            success: false,
            statusCode: 500
        })
    }
}

module.exports = { createInvoice, updateInvoice, getSingleInvoice, getInvoice, deleteInvoice }