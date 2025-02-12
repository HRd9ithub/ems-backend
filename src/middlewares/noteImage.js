const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const imgConfig = multer.diskStorage({
  destination: './public/images',
  filename: (req, file, callback) => {
    return callback(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
})

const upload = multer({
  storage: imgConfig,
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname)
    if (ext.toLowerCase() === '.png' || ext.toLowerCase() === '.jpg' || ext.toLowerCase() === '.svg' || ext.toLowerCase() === '.jpeg') {
      cb(null, true);
    } else {
      return cb(new Error('The image type is not allowed. Allowed types: SVG, jpeg, jpg, png'))
    }
  }
});

const noteImage = upload.single("files[0]");

module.exports = noteImage