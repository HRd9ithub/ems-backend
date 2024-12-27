const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../public/password"),
  filename: function (req, file, cb) {
    return cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
  }
})

const passwordFileUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname).toLowerCase()
    if (ext === '.png' || ext === '.jpg' || ext === '.svg' || ext === '.jpeg' || ext === '.pdf' || ext === '.doc' || ext === '.csv' || ext === '.ppk' || ext === '.pem') {
      cb(null, true);
    } else {
      return cb(new Error('The file is invalid or the image type is not allowed. Allowed types: SVG, jpeg, jpg, png, pdf, doc, csv, ppk, pem'))
    }
  }
});

module.exports = passwordFileUpload.single("file")