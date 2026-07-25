const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const asynchandler = require("express-async-handler");
const {
  User,
  vaildateLoginUser,
  vaildateRegisterUser,
} = require("../models/User");

/*
 @desc register new user
 @route /api/auth/register
 @method post
 @access public
*/
router.post(
  "/register",
  asynchandler(async (req, res) => {
    const { error } = vaildateRegisterUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "you already have an account" });
    }
    req.body.password = await bcrypt.hash(req.body.password, 10);

    user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });
    const result = await user.save();
    const token = user.generateToken();
    const { password, ...others } = result._doc;
    res.status(201).json({ ...others, token });
  }),
);

/*
  @des user login
  @route /api/auth/login
  @method post
  @access public
 */
router.post(
  "/login",
  asynchandler(async (req, res) => {
    const { error } = vaildateLoginUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "invaild password or Email" });
    }
    const IsPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!IsPasswordMatch) {
      return res.status(400).json({ message: "invaild password or Email" });
    }
    const token = user.generateToken();
    const { password, ...other } = user._doc;
    res.status(200).json({ ...other, token });
  }),
);

module.exports = router;
