const multer = require("multer");
const path = require("path");

const imgConfig = multer.diskStorage({
    destination: './public/images',
    filename: (req, file, callback) => {
        return callback(null, `image_${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({
    storage: imgConfig,
    fileFilter: (req, file, cb) => {
        var ext = path.extname(file.originalname)
        if (ext === '.png' || ext === '.jpg' || ext === '.svg' || ext === '.jpeg' ) {
            cb(null, true);
        } else {
            return cb(new Error('The image type is not allowed. Allowed types: SVG, jpeg, jpg, png'))
        }
    }
});

const profile_image = upload.single("profile_image")

module.exports = profile_image