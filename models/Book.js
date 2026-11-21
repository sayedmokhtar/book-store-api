const joi = require("joi");
const mongosee = require("mongoose");
// book schema
const bookSchema = new mongosee.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    author: {
      type: mongosee.Schema.Types.ObjectId,
      required: true,
      ref: "Author",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    bookPdf: {
      type: String,
    },
  },
  { timestamps: true },
);
bookSchema.index({ title: 1, _id: 1 });
const Book = mongosee.model("Book", bookSchema);

// validate update book

function validateUpdateBook(obj) {
  const schema = joi.object({
    title: joi.string().trim().min(3).max(200),
    author: joi.string(),
    description: joi.string().trim().min(5),
    price: joi.number().min(0),
    image: joi.string(),
    bookPdf: joi.string(),
  });
  return schema.validate(obj);
}

// validate create book

function validateCreateBook(obj) {
  const schema = joi.object({
    title: joi.string().trim().min(3).max(200).required(),
    author: joi.string().required(),
    description: joi.string().trim().min(5).required(),
    price: joi.number().min(0).required(),
  });
  return schema.validate(obj);
}

module.exports = {
  Book,
  validateUpdateBook,
  validateCreateBook,
};
