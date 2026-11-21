const asynchandler = require("express-async-handler");
const {
  User,
  vaildateLoginUser,
  vaildateRegisterUser,
} = require("../models/User");
const bcrypt = require("bcryptjs");

/*
 @desc register new user
 @route /api/auth/register
 @method post
 @access public
*/
const register = asynchandler(async (req, res) => {
  const { error } = vaildateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "you All ready have an account" });
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
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
  });
  res
    .status(201)
    .json({ ...others, message: "account has been created successful" });
});

/*
  @des user login
  @route /api/auth/login
  @method post
  @access public
 */
const login = asynchandler(async (req, res) => {
  const { error } = vaildateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).json({ message: "invaild password or Email" });
  }
  if (user.lockuntil && user.lockuntil > Date.now()) {
    return res
      .status(403)
      .json({ message: "Account is temporarily locked. try again later" });
  }
  const IsPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password,
  );
  if (!IsPasswordMatch) {
    user.loginattempts += 1;
    if (user.loginattempts >= 3) {
      user.lockuntil = new Date(Date.now() + 30 * 60 * 1000);
      user.loginattempts = 0;
    }
    await user.save();
    return res.status(401).json({ message: "invaild password or Email" });
  }

  user.resetLoginAttempts();
  await user.save();
  const token = user.generateToken();
  const { password, ...other } = user._doc;
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
  });
  res.status(200).json({ ...other, message: "login successful" });
});

const logout = asynchandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "logout successful" });
});

const currentUser = asynchandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "user is not found" });
  }
  res.status(200).json({
    user: {
      id: user.id,
      name: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  currentUser,
};
