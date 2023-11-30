const document = require('../models/documentSchema');
const { importDocument } = require('../middlewares/documentUpload');
const path = require("path");

// add document function
const addDocument = async (req, res) => {
    try {
        importDocument(req, res, async function (err) {
            if (err) {
                return res.status(422).send({ message: err.message })
            }
            let { name, description } = req.body;

            let error = [];

            if (!name) {
                error.push("File Name is required field.");
            }
            if (!description) {
                error.push("Description is required field.");
            }
            if (!req.file) {
                error.push("File is required field.");
            }


            if (error.length === 0) {
                let { filename } = req.file;
                const documentData = new document({
                    name,
                    description,
                    image: filename
                });

                const response = await documentData.save();

                return res.status(201).json({ success: true, message: "Data added successfully." })

            } else {
                return res.status(400).send({ error: error, success: false })
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// update document
const updateDocument = async (req, res) => {
    try {
        const response = await document.findOne({ _id: req.params.id })

        if (response) {
            importDocument(req, res, async function (err) {
                if (err) {
                    return res.status(422).send({ message: err.message })
                }

                let { name, description } = req.body;

                let error = [];

                if (!name) {
                    error.push("File Name is required field.");
                }
                if (!description) {
                    error.push("Description is required field.");
                }
                if (!req.file && !req.body.image) {
                    error.push("File is required field.");
                }

                if (error.length === 0) {
                    let { name, description } = req.body;
                    const documentData = {
                        name,
                        description,
                        image: req.file && req.file.filename
                    };

                    const response = await document.findByIdAndUpdate({ _id: req.params.id }, documentData)

                    return res.status(200).json({ success: true, message: "Data updated successfully." })

                } else {
                    return res.status(400).send({ error: error, success: false })
                }
            })
        } else {
            return res.status(404).json({ success: false, message: "Document not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// delete document
const deleteDocument = async (req, res) => {
    try {
        const response = await document.findByIdAndDelete({ _id: req.params.id }, req.body)

        if (response) {
            return res.status(200).json({ success: true, message: "Data deleted successfully." })
        } else {
            return res.status(404).json({ success: false, message: "Document not found." })
        }

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// get function
const getDocument = async (req, res) => {
    try {
        const response = await document.find();

        return res.status(200).json({ success: true, message: "successfully fetch for document.", data: response, permissions: req.permissions })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

// downloadFile
const downloadFile = async (req, res) => {
    let filePath = path.join(__dirname, "../../public/document");
    try {
        let { file } = req.query;
        if (!file) {
            return res.status(400).json({ message: "File name is required.", success: false })
        }
        let route = path.join(filePath, file);
        res.download(route)
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server Error', success: false })
    }
}

module.exports = { addDocument, getDocument, updateDocument, deleteDocument, downloadFile }