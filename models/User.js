const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");

// create schema
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
// generate token
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, isadmin: this.isadmin },
    process.env.JWT_SECRET_KEY,
  );
};
// vaildate register user

function vaildateRegisterUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    username: joi.string().trim().min(2).max(200).required(),
    password: joi.string().trim().min(6),
  });
  return schema.validate(obj);
}
//vaildate user login

function vaildateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    password: joi.string().trim().min(6),
  });
  return schema.validate(obj);
}

// vaildate update user

function vaildateUpdateUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).email(),
    username: joi.string().min(2).max(200),
    password: joi.string().trim().min(6),
  });
  return schema.validate(obj);
}

// create the model
const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
  vaildateLoginUser,
  vaildateRegisterUser,
  vaildateUpdateUser,
};
