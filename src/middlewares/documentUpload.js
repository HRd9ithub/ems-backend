const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../public/document"),
    filename: function (req, file, cb) {
        return cb(null, `file_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const documentUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        var ext = path.extname(file.originalname)
        if (ext === '.png' || ext === '.jpg' || ext === '.svg' || ext === '.jpeg' || ext === '.pdf' || ext === '.doc') {
            cb(null, true);
        } else {
            return cb(new Error('The file is invalid or the image type is not allowed. Allowed types: SVG, jpeg, jpg, png, pdf, doc'))
        }
    }
});

const uploadSingleImage = documentUpload.fields([
    { name: 'resume' },
    { name: 'offer_letter' },
    { name: 'joining_letter' },
    { name: 'other' },
    { name: 'photo' },
    { name: 'id_proof' },
]);
const importDocument = documentUpload.single("image");

module.exports = { uploadSingleImage, importDocument }