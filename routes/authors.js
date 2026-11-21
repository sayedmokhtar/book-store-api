const express = require("express");
const router = express.Router();
const {
  verfiyTokenAndAdmin,
  verfiyTokenAndAuthorization,
  verifyToken,
} = require("../middleware/verifyToken");
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  deleteAuthors,
  authorsCount,
  getLatestAuthors,
} = require("../controller/authorController");

// count total authors
router.get("/count", verfiyTokenAndAdmin, authorsCount);
router.get("/latest", verfiyTokenAndAdmin, getLatestAuthors);
// /api/author
router
  .route("/")
  .get(verifyToken, getAllAuthors)
  .post(verfiyTokenAndAdmin, createAuthor)
  .delete(verfiyTokenAndAdmin, deleteAuthors);

// /api/author/:id
router
  .route("/:id")
  .get(verfiyTokenAndAuthorization, getAuthorById)
  .put(verfiyTokenAndAdmin, updateAuthor)
  .delete(verfiyTokenAndAdmin, deleteAuthor);

module.exports = router;
