const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const joiPasswordComlexity = require("joi-password-complexity");

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
      minlength: 8,
      maxlength: 200,
      match: [
        /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/,
        "Username can contain only letters and numbers separated by single spaces",
      ],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    loginattempts: {
      type: Number,
      default: 0,
    },
    lockuntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
// generate token
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "60m" },
  );
};
// reset user loginAttempts and lockuntil
UserSchema.methods.resetLoginAttempts = function () {
  this.loginattempts = 0;
  this.lockuntil = null;
};

// vaildate register user
function vaildateRegisterUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    username: joi.string().trim().min(2).max(200).required(),
    password: joiPasswordComlexity().required(),
  });
  return schema.validate(obj);
}

//vaildate user login

function vaildateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    password: joiPasswordComlexity().required(),
  });
  return schema.validate(obj);
}

// vaildate update user

function vaildateUpdateUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).email(),
    username: joi.string().min(2).max(200),
    password: joiPasswordComlexity(),
  });
  return schema.validate(obj);
}
// vaildate passowrd
function validatePassword(obj) {
  const schema = joi.object({
    password: joiPasswordComlexity(),
  });
  return schema.validate(obj);
}
UserSchema.index({ name: 1 });
// create the model
const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
  vaildateLoginUser,
  vaildateRegisterUser,
  vaildateUpdateUser,
  validatePassword,
};
