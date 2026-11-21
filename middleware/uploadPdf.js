const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../pdfs"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = function (req, file, cb) {
  if (file.mimetype === "application/pdf") {
    return cb(null, true);
  }
  cb(new Error("only pdf file is allowed"), false);
};

const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
module.exports = uploadPdf;
