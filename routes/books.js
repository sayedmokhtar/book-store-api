const express = require("express");
const router = express.Router();
const {
  Book,
  validateCreateBook,
  validateUpdateBook,
} = require("../models/Book");
const { verfiyTokenAndAdmin } = require("../middleware/verifyToken");
const asyncHandler = require("express-async-handler");

/*
  @des ...... create new book
  @route...... /api/books
  @method......post
  @access .... private (only admin)
*/
router.post(
  "/",
  verfiyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const { error } = validateCreateBook(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      price: req.body.price,
      cover: req.body.cover,
    });
    const result = await book.save();
    res.status(201).json(result);
  }),
);

/*
  @des ...... get all books
  @route...... /api/books
  @method......get
  @acces ...... public
*/

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.find().populate("author");
    res.status(200).json(books);
  }),
);

/*
  @des ...... get book by id
  @route...... /api/books
  @method......get
  @access ........ public
*/
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id).populate("author");
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "book is not found" });
    }
  }),
);

/*
 @des ...... update book by id
 @route .... /api/books/:id
 @method ..... put
 @access ...... private(only admin)
*/

router.put(
  "/:id",
  verfiyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const { error } = validateUpdateBook(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          author: req.body.author,
          description: req.body.description,
          price: req.body.price,
          cover: req.body.cover,
        },
      },
      { new: true },
    );

    res.status(200).json(book);
  }),
);

/*
 @des ...... delete book by id
 @route .... /api/books/:id
 @method ..... delete
 @access ...... private (only admin)
*/

router.delete(
  "/:id",
  verfiyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (book) {
      res.status(200).json({ message: "book has been deleted" });
    } else {
      res.status(404).json({ message: "book is not found" });
    }
  }),
);

module.exports = router;
