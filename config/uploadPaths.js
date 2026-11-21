const path = require("path");
const fs = require("fs");
const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, "..");
const imagesDir = path.join(uploadDir, "images");
const pdfDir = path.join(uploadDir, "pdfs");
fs.mkdirSync(imagesDir, { recursive: true });
fs.mkdirSync(pdfDir, { recursive: true });
module.exports = {
  imagesDir,
  pdfDir,
};
