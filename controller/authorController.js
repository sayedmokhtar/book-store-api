const asyncHandler = require("express-async-handler");

const {
  Author,
  validateCreateData,
  validateUpdateData,
} = require("../models/Author");
const { default: mongoose } = require("mongoose");

/*
@des ......... get latest 50 authors
@method ........ get
@route ......... /api/authors/latest
@access ........ public
 */
const getLatestAuthors = asyncHandler(async (req, res) => {
  const authors = await Author.find()
    .sort({ createdAt: -1, _id: -1 })
    .select("_id name")
    .limit(50)
    .lean();
  if (authors.length === 0) {
    return res.status(404).json({ message: "No authors found" });
  }
  res.status(200).json({ authors });
});
/*
@des ......... get all authors
@method ........ get
@route ......... /api/authors
@access ........ public
 */
const getAllAuthors = asyncHandler(async (req, res) => {
  const { after } = req.query;
  const pageLimit = Number(req.query.limit ?? 15);
  if (
    req.query.limit === "" ||
    !Number.isInteger(pageLimit) ||
    pageLimit < 1 ||
    pageLimit > 15
  ) {
    return res.status(400).json({ message: "Limit must be between 1 and 15" });
  }
  const query = {};
  if (after !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(after)) {
      return res.status(400).json({ message: "Invalid cursor" });
    }
    query._id = { $gt: new mongoose.Types.ObjectId(after) };
  }
  if (req.query.search?.trim()) {
    const search = req.query.search.trim();
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.name = {
      $regex: `^${escapedSearch}`,
      $options: "i",
    };
  }
  const authors = await Author.find(query)
    .select("name country age")
    .sort({ _id: 1 })
    .limit(pageLimit + 1)
    .lean();
  const nextPage = authors.length > pageLimit;
  const authorsList = authors.slice(0, pageLimit);
  const nextCursor = nextPage
    ? authorsList[authorsList.length - 1]._id.toString()
    : null;
  res.status(200).json({ authorsList, nextCursor, nextPage });
});

/*
@des ......... get all authors
@method ........ get
@route ......... /api/authors
@access ........ private
 */
const authorsCount = asyncHandler(async (req, res) => {
  const totalAuthors = await Author.countDocuments();
  res.status(200).json({ totalAuthors });
});

/*
@des ......... get author by id
@method ........ get
@route ......... /api/authors/:id
@access ........ public
 */
const getAuthorById = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    res.status(200).json(author);
  } else {
    res.status(404).json({ message: "author is not found" });
  }
});

/*
  @des ......... create new author
  @method ........ post
  @route ......... /api/authors
  @access ........ private (only admin)
   */
const createAuthor = asyncHandler(async (req, res) => {
  const { error } = validateCreateData(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const author = new Author({
    name: req.body.name,
    country: req.body.country,
    age: req.body.age,
  });
  const result = await author.save();
  res.status(201).json(result);
});

/*
@des ......... update author
@method ........ get
@route ......... /api/authors/:id
@access ........ private(only admin)
 */
const updateAuthor = asyncHandler(async (req, res) => {
  const { error } = validateUpdateData(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const author = await Author.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        country: req.body.country,
        age: req.body.age,
      },
    },
    { new: true },
  );

  res.status(200).json(author);
});

/*
   @des ......... delete author
   @method ........ delete
   @route ......... /api/authors/:id
   @access ........ private (only admin)
 */
const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findByIdAndDelete(req.params.id);
  if (author) {
    res.status(200).json({ message: "author has been deleted" });
  } else {
    res.status(404).json({ message: "the author is not found" });
  }
});
const deleteAuthors = asyncHandler(async (req, res) => {
  const deletedAuhtors = await Author.deleteMany({});
  res.status(200).json({ deletedAuhtors });
});

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  deleteAuthors,
  authorsCount,
  getLatestAuthors,
};
