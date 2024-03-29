const { default: mongoose } = require("mongoose");
const invoice = require("../models/invoiceSchema");
const invoice_table = require("../models/invoiceTableSchema");
const expressValidator = require("express-validator");
const decryptData = require("../helper/decryptData");
const path = require("path");
const fs = require('fs');
const ejs = require('ejs');
const { default: puppeteer } = require("puppeteer");
const moment = require("moment");
const invoice_account = require("../models/invoiceAccountSchema");

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

        let { invoiceId, issue_date, due_date, extra_field, terms, contact, clientId, userId, currencyValue, gstType, totalAmount, signImage, note, currency, status, tableData, newColumns, businessId, businessLogo, taxType, totalSubAmount } = req.body;

        await invoice_table.create({
            tableHead: JSON.parse(newColumns),
            tableBody: JSON.parse(tableData),
            invoiceId: invoiceId
        })

        let fileUrl = [];

        if (req.files?.image !== undefined) {
            fileUrl = req.files.image.map(val => val.filename);
        }

        if (req.files?.businessLogo !== undefined) {
            businessLogo = req.files.businessLogo.map(val => val.filename);
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
            contact: contact && contact,
            terms: terms ? terms : [],
            gstType,
            businessId,
            businessLogo: typeof (req.body.businessLogo) == 'string' ? businessLogo : businessLogo[0],
            taxType,
            totalSubAmount
        })

        return res.status(201).json({
            message: "Data added successfully.",
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

        let { invoiceId, issue_date, due_date, extra_field, terms, contact, clientId, userId, currencyValue, gstType, totalAmount, signImage, note, currency, status, tableData, newColumns, businessId, tableId, businessLogo, taxType, totalSubAmount } = req.body;

        // table data update
        await invoice_table.findByIdAndUpdate({ _id: tableId }, {
            $set: {
                tableHead: JSON.parse(newColumns),
                tableBody: JSON.parse(tableData),
                invoiceId: invoiceId
            }
        })

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

        if (req.files?.businessLogo !== undefined) {
            businessLogo = req.files.businessLogo.map(val => val.filename);
        }

        // invoice update
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
            currency,
            currencyValue,
            attchmentFile: fileUrl,
            status,
            contact: contact && contact,
            terms: terms ? terms : [],
            gstType,
            businessId,
            businessLogo: typeof (req.body.businessLogo) == 'string' ? businessLogo : businessLogo[0],
            taxType, totalSubAmount
        })

        return res.status(200).json({
            message: "Data updated successfully.",
            success: true,
            id: response._id,
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error.",
            success: false
        })
    }
}

// get single data common

const getSingleData = async (id, userId) => {
    if(id && id !== "undefined"){
        const result = await invoice.aggregate([
            {
                $match: { 
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "invoice_clients", localField: "clientId", foreignField: "_id", as: "invoiceClient"
                }
            },
            {
                $lookup: {
                    from: "invoice_businesses", localField: "businessId", foreignField: "_id", as: "invoiceProvider"
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
                        "business_name": decryptData(elem.business_name),
                        "client_industry": decryptData(elem.client_industry),
                        "phone": decryptData(elem.phone),
                        "email": decryptData(elem.email),
                        "country": decryptData(elem.country),
                        "state": decryptData(elem.state),
                        "city": decryptData(elem.city),
                        "postcode": decryptData(elem.postcode),
                        "address": decryptData(elem.address),
                        "GSTIN": decryptData(elem.GSTIN),
                        "pan_number": decryptData(elem.pan_number)
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
                        "business_name": decryptData(elem.business_name),
                        "phone": decryptData(elem.phone),
                        "email": decryptData(elem.email),
                        "country": decryptData(elem.country),
                        "state": decryptData(elem.state),
                        "city": decryptData(elem.city),
                        "postcode": decryptData(elem.postcode),
                        "address": decryptData(elem.address),
                        "GSTIN": decryptData(elem.GSTIN),
                        "pan_number": decryptData(elem.pan_number)
                    }
                })
            }
        })
    
        return decryptResult
    }else{
        const result = await invoice.aggregate([
            {
                $match: { 
                    userId: new mongoose.Types.ObjectId(userId),
                    deleteAt: {$exists: false}
                }
            },
            {
                $lookup: {
                    from: "invoice_clients", localField: "clientId", foreignField: "_id", as: "invoiceClient"
                }
            },
            {
                $lookup: {
                    from: "invoice_businesses", localField: "businessId", foreignField: "_id", as: "invoiceProvider"
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
                $sort: { "_id": -1 } // Sorting the matched documents based on a timestamp field
            },
            {
                $limit: 1
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
                        "business_name": decryptData(elem.business_name),
                        "client_industry": decryptData(elem.client_industry),
                        "phone": decryptData(elem.phone),
                        "email": decryptData(elem.email),
                        "country": decryptData(elem.country),
                        "state": decryptData(elem.state),
                        "city": decryptData(elem.city),
                        "postcode": decryptData(elem.postcode),
                        "address": decryptData(elem.address),
                        "GSTIN": decryptData(elem.GSTIN),
                        "pan_number": decryptData(elem.pan_number)
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
                        "business_name": decryptData(elem.business_name),
                        "phone": decryptData(elem.phone),
                        "email": decryptData(elem.email),
                        "country": decryptData(elem.country),
                        "state": decryptData(elem.state),
                        "city": decryptData(elem.city),
                        "postcode": decryptData(elem.postcode),
                        "address": decryptData(elem.address),
                        "GSTIN": decryptData(elem.GSTIN),
                        "pan_number": decryptData(elem.pan_number)
                    }
                })
            }
        })
    
        return decryptResult
    }
}

// single data get
const getSingleInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await getSingleData(id, req.user._id);

        return res.status(200).json({
            message: "success",
            success: true,
            data: result,
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
        const { startDate, endDate, id, } = req.query;

        const result = await invoice.aggregate([
            {
                $match: {
                    $and: [
                        { "issue_date": { $gte: new Date(startDate) } },
                        { "issue_date": { $lte: new Date(endDate) } },
                    ],
                    userId: new mongoose.Types.ObjectId(req.user._id)
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
                    from: "invoice_businesses", localField: "businessId", foreignField: "_id", as: "invoiceProvider"
                }
            },
            {
                $lookup: {
                    from: "invoice_tables", localField: "invoiceId", foreignField: "invoiceId", as: "productDetails"
                }
            },
            {
                $unwind: {
                    path: "$productDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    invoiceId: 1,
                    issue_date: 1,
                    due_date: 1,
                    totalAmount: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    productDetails: 1,
                    currency: 1,
                    currencyValue: 1,
                    deleteAt: 1,
                    "invoiceClient.business_name": 1
                }
            }
        ])

        const decryptResult = result.map((val) => {
            return {
                ...val,
                invoiceClient: { "name": decryptData(val.invoiceClient?.business_name) }
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

// status update invoice
const statusInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await invoice.findByIdAndUpdate({ _id: id }, {
            $set: {
                status: req.body.status,
                payment_date: req.body.date,
                payment_method: req.body.payment_method,
                payment_note: req.body.payment_note
            }
        });


        if (!result) {
            return res.status(404).json({
                message: "Record not found.",
                success: false
            })
        } else {
            return res.status(200).json({
                message: "Data updated successfully.",
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
// delete invoice
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { p } = req.query;
        let result;
        if (p === "true") {
            result = await invoice.findOneAndDelete({ _id: id });
        } else {
            result = await invoice.findByIdAndUpdate({ _id: id }, { $set: { deleteAt: new Date() } });
        }

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

// restore invoice
const restoreInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await invoice.findByIdAndUpdate({ _id: id }, { $unset: { deleteAt: "" } });

        if (!result) {
            return res.status(404).json({
                message: "Record not found.",
                success: false
            })
        } else {
            return res.status(200).json({
                message: "Invoice Restored successfully.",
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

// download invoice
const downloadInvoice = async (req, res) => {
    try {
        const { id } = req.query;

        const result = await getSingleData(id);
        const bankDetail = await invoice_account.findOne({ status: true });


        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Record not found', success: false })
        }

        const imagePath = path.resolve(__dirname, `../../public/document/${result[0].businessLogo}`);

        const ejsData = {
            result: result[0],
            provider: result[0].invoiceProvider[0],
            invoiceClient: result[0].invoiceClient[0],
            tableHead: result[0].productDetails[0].tableHead,
            tableBody: result[0].productDetails[0].tableBody,
            bankDetail,
            issue_date: moment(result[0].issue_date).format("DD MMM YYYY"),
            due_date: result[0].due_date && moment(result[0].due_date).format("DD MMM YYYY"),
            businessLogo: result[0].businessLogo ? "data:image/png;base64,"+convertImageToBase64(imagePath) : ""
        }
        // get file path
        const filepath = path.resolve(__dirname, "../../views/invoiceTemplate.ejs");

        // read file using fs module
        const htmlstring = fs.readFileSync(filepath).toString();
        // add data dynamic
        const htmlContent = ejs.render(htmlstring, ejsData);

        // Launch a headless browser using puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            timeout: 10000,
        });
        const page = await browser.newPage();

        // Set the content and styles for the PDF
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        // Generate the PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            displayHeaderFooter: false, // Set to false to remove the duplicate head
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px',
            },
            printBackground: true,
        });

        // Close the browser
        await browser.close();

        // Send the generated PDF as a downloadable file
        const pdfFileName = '../../public/invoice.pdf';
        const pdfPath = path.join(__dirname, pdfFileName);
        // Save the PDF to a file
        fs.writeFileSync(pdfPath, pdfBuffer);
        res.download(pdfPath)
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Interner server error",
            success: false,
            statusCode: 500
        })
    }
}

function convertImageToBase64(imagePath) {
    // Read the image file
    const imageData = fs.readFileSync(imagePath);

    // Convert image data to Base64
    const base64Image = Buffer.from(imageData).toString('base64');

    return base64Image;
}

module.exports = { createInvoice, updateInvoice, getSingleInvoice, getInvoice, deleteInvoice, restoreInvoice, statusInvoice, downloadInvoice }