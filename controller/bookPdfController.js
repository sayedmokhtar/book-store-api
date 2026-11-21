const { Book } = require("../models/Book");
const asyncHndler = require("express-async-handler");
const path = require("path");
const fs = require("fs").promises;

const bookUploadPdf = asyncHndler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "book pdf is required" });
  }
  const book = await Book.findById(req.params.id);

  if (!book) {
    const pdfPathName = path.join(__dirname, "../pdfs", req.file.filename);
    await fs.unlink(pdfPathName).catch(() => {});
    return res.status(404).json({ message: "book is not found" });
  }
  const oldPdf = book.bookPdf;
  book.bookPdf = `/pdfs/${req.file.filename}`;
  try {
    await book.save();
    if (oldPdf) {
      const oldPdfName = path.basename(oldPdf);
      const oldPdfPath = path.join(__dirname, "../pdfs", oldPdfName);
      await fs.unlink(oldPdfPath).catch(() => {});
    }
    res.status(200).json(book);
  } catch (error) {
    const newPdfPath = path.join(__dirname, "../pdfs", req.file.filename);
    await fs.unlink(newPdfPath).catch(() => {});
    book.bookPdf = oldPdf;
    throw error;
  }
});
module.exports = bookUploadPdf;
