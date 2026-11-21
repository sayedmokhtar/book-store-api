const fs = require("fs").promises;
const path = require("path");
const {
  Book,
  validateCreateBook,
  validateUpdateBook,
} = require("../models/Book");
const asyncHandler = require("express-async-handler");
const { Promise, default: mongoose } = require("mongoose");

/*
  @des ...... get latest books
  @route...... /api/books/latest
  @method......get
  @access ........ public
*/
const getLatestBooks = asyncHandler(async (req, res) => {
  const books = await Book.find()
    .sort({ createdAt: -1 })
    .populate("author", "name")
    .limit(4);
  res.status(200).json(books);
});

/*
  @des ...... get all books
  @route...... /api/books
  @method......get
  @access ........ public
*/
const getAllBooks = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice, after, limit } = req.query;
  const pageLimit = Number(limit ?? 15);
  if (
    limit === "" ||
    !Number.isInteger(pageLimit) ||
    pageLimit < 1 ||
    pageLimit > 15
  ) {
    return res.status(400).json({ message: "limit must be between 1 and 15" });
  }
  const query = {};
  if (minPrice !== undefined || maxPrice !== undefined) {
    const min = minPrice === undefined ? 0 : Number(minPrice);
    const max = maxPrice === undefined ? Infinity : Number(maxPrice);
    if (
      (maxPrice !== undefined &&
        (maxPrice === "" || !Number.isFinite(max) || max < 0)) ||
      (minPrice !== undefined &&
        (minPrice === "" || !Number.isFinite(min) || min < 0))
    ) {
      return res
        .status(400)
        .json({ message: "price must be a non negative number" });
    }
    if (min > max) {
      return res.status(400).json({
        message: "minimum price can not be greater than maximum price",
      });
    }
    query.price = {};
    if (minPrice !== undefined) {
      query.price.$gte = min;
    }
    if (maxPrice !== undefined) {
      query.price.$lte = max;
    }
  }
  if (after !== undefined) {
    if (!mongoose.isValidObjectId(after)) {
      return res.status(400).json({ message: "invaild cursor" });
    }
    query._id = { $gt: new mongoose.Types.ObjectId(after) };
  }
  if (req.query.search?.trim()) {
    const search = req.query.search.trim();
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.title = {
      $regex: `^${escapedSearch}`,
      $options: "i",
    };
  }
  const books = await Book.find(query)
    .populate("author", "name")
    .sort({ _id: 1 })
    .limit(pageLimit + 1)
    .lean();
  const hasNextPage = books.length > pageLimit;
  const booksList = books.slice(0, pageLimit);
  const nextCursor = hasNextPage
    ? booksList[booksList.length - 1]._id.toString()
    : null;
  res.status(200).json({ booksList, nextCursor, hasNextPage });
});

/*
  @des ...... get all books count
  @route...... /api/books/count
  @method......get
  @access ........ private
*/
const booksCount = asyncHandler(async (req, res) => {
  const totalBooks = await Book.countDocuments();
  res.status(200).json({ totalBooks });
});

/*
  @des ...... get book by id
  @route...... /api/books
  @method......get
  @access ........ public
*/
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate("author", [
    "id",
    "name",
  ]);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "book is not found" });
  }
});
/*
  @des ...... create new book
  @route...... /api/books
  @method......post
  @access .... private (only admin)
*/
const createBook = asyncHandler(async (req, res) => {
  const { error } = validateCreateBook(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  if (!req.file) {
    return res.status(400).json({ message: "image is required" });
  }
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    price: req.body.price,
    image: `/images/${req.file.filename}`,
  });
  const result = await book.save();
  res.status(201).json(result);
});

/*
 @des ...... update book by id
 @route .... /api/books/:id
 @method ..... put
 @access ...... private(only admin)
*/
const updateBookById = asyncHandler(async (req, res) => {
  const { error } = validateUpdateBook(req.body);
  if (error) {
    if (req.file) {
      const newImagePath = path.join(__dirname, "../images", req.file.filename);
      await fs.unlink(newImagePath).catch(() => {});
    }
    return res.status(400).json({ message: error.details[0].message });
  }

  const book = await Book.findById(req.params.id);
  if (!book) {
    if (req.file) {
      const newImagePath = path.join(__dirname, "../images", req.file.filename);
      await fs.unlink(newImagePath).catch((error) => {});
    }
    return res.status(404).json({ message: "book is not found" });
  }
  const oldImage = book.image;

  const updateData = {
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    price: req.body.price,
  };
  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      },
      { new: true },
    );
    if (req.file && oldImage) {
      const oldImageName = path.basename(oldImage);
      const oldImagePath = path.join(__dirname, "../images", oldImageName);
      await fs.unlink(oldImagePath).catch(() => {});
    }
    res.status(200).json(updatedBook);
  } catch (error) {
    if (req.file) {
      const oldImagePath = path.join(__dirname, "../images", req.file.filename);
      await fs.unlink(oldImagePath).catch(() => {});
    }
    throw error;
  }
});

/*
   @des ...... delete book by id
   @route .... /api/books/:id
   @method ..... delete
   @access ...... private (only admin)
*/
const deleteBookById = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (book) {
    res.status(200).json({ message: "book has been deleted" });
  } else {
    res.status(404).json({ message: "book is not found" });
  }
});
const deleteBooks = asyncHandler(async (req, res) => {
  const deletedCount = await Book.deleteMany({});
  res.status(200).json({ deletedCount });
});

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById,
  getLatestBooks,
  deleteBooks,
  booksCount,
};
