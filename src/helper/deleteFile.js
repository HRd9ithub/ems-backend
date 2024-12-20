const fs = require('fs');

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(`Failed to delete file: ${filePath}. Error: ${err.message}`);
      } else {
        resolve(`File deleted successfully: ${filePath}`);
      }
    });
  });
};

module.exports = deleteFile;
