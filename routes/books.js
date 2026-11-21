const express = require("express");
const router = express.Router();
const {
  verfiyTokenAndAdmin,
  verfiyTokenAndAuthorization,
  verifyToken,
} = require("../middleware/verifyToken");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById,
  getLatestBooks,
  deleteBooks,
  booksCount,
} = require("../controller/bookController");
const bookUploadPdf = require("../controller/bookPdfController");

const upload = require("../middleware/uploadImage");
const uploadPdf = require("../middleware/uploadPdf");

router.get("/count", verfiyTokenAndAdmin, booksCount);
router.get("/latest", verifyToken, getLatestBooks);
// /api/books
router
  .route("/")
  .get(verifyToken, getAllBooks)
  .post(verfiyTokenAndAdmin, upload.single("image"), createBook)
  .delete(verfiyTokenAndAdmin, deleteBooks);

// /api/books/:id
router
  .route("/:id")
  .get(verfiyTokenAndAuthorization, getBookById)
  .put(verfiyTokenAndAdmin, upload.single("image"), updateBookById)
  .delete(verfiyTokenAndAdmin, deleteBookById);
router.post("/:id/pdf", uploadPdf.single("pdf"), bookUploadPdf);

module.exports = router;
