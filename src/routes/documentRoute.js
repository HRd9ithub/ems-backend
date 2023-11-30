const express = require("express");
const Auth = require("../middlewares/authtication");
const { addDocument, getDocument, updateDocument, deleteDocument, downloadFile } = require("../controller/documentController");
const { documentPermission } = require("../middlewares/permission");
const documentRoute = express.Router();


// add document api
documentRoute.post('/',Auth,documentPermission, addDocument)

// Download api
documentRoute.get('/download',downloadFile)

// update document api
documentRoute.put('/:id', Auth,documentPermission,updateDocument)

// get api
documentRoute.get('/',Auth,documentPermission,getDocument)

// delete api
documentRoute.delete('/:id',Auth,documentPermission,deleteDocument);



module.exports = documentRoute