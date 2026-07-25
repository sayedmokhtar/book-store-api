const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { verfiyTokenAndAdmin } = require("../middleware/verifyToken");
const {
  Author,
  validateCreateData,
  validateUpdateData,
} = require("../models/Author");

/*
@des ......... get all authors
@method ........ get
@route ......... /api/authors
@access ........ public
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const authorList = await Author.find();
    res.status(200).json(authorList);
  }),
);

/*
@des ......... get author by id
@method ........ get
@route ......... /api/authors/:id
@access ........ public
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const author = await Author.findById(req.params.id);
    if (author) {
      res.status(200).json(author);
    } else {
      res.status(404).json({ message: "author is not found" });
    }
  }),
);
/*
@des ......... create new author
@method ........ post
@route ......... /api/authors
@access ........ private (only admin)
 */

router.post(
  "/",
  verfiyTokenAndAdmin,
  asyncHandler(async (req, res) => {
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
  }),
);

/*
@des ......... update author
@method ........ get
@route ......... /api/authors/:id
@access ........ private(only admin)
 */
router.put(
  "/:id",
  verfiyTokenAndAdmin,
  asyncHandler(async (req, res) => {
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
  }),
);

/*
@des ......... delete author
@method ........ delete
@route ......... /api/authors/:id
@access ........ private (only admin)
 */

router.delete(
  "/:id",
  verfiyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (author) {
      res.status(200).json({ message: "author has been deleted" });
    } else {
      res.status(404).json({ message: "the author is not found" });
    }
  }),
);

module.exports = router;
