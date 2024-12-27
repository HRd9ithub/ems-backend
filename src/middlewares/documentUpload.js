const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../public/document"),
    filename: function (req, file, cb) {
        return cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
    }
})

const documentUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        var ext = path.extname(file.originalname).toLowerCase()
        if (ext === '.png' || ext === '.jpg' || ext === '.svg' || ext === '.jpeg' || ext === '.pdf' || ext === '.doc' || ext === '.csv') {
            cb(null, true);
        } else {
            return cb(new Error('The file is invalid or the image type is not allowed. Allowed types: SVG, jpeg, jpg, png, pdf, doc, csv'))
        }
    }
});

const uploadSingleImage = documentUpload.fields([
    { name: 'resume' },
    { name: 'offer_letter' },
    { name: 'pan_card' },
    { name: 'other' },
    { name: 'photo' },
    { name: 'aadhar_card' },
]);
const importDocument = documentUpload.single("image");

const attchmentFile = documentUpload.fields([
    { name: 'image' },
    { name: 'businessLogo', maxCount: 1 }
])

module.exports = { uploadSingleImage, importDocument, attchmentFile }