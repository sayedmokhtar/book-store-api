const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
//const sendEmail = require("../utils/sendEmail");
const nodeMailer = require("nodemailer");
const { validatePassword } = require("../models/User");
/* @des get forgot password view  @method ........ get @route ......... /password/forgot-password @access ........ public*/
module.exports.getForgotPasswordView = asyncHandler((req, res) => {
  res.render("forgot-password");
});

/*
   @des send forgot password link
   @method post
   @route /password/forgot-password
   @access public
 */
module.exports.sendForgotPasswordLink = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: "invaild Email" });
  }
  const secret = process.env.JWT_SECRET_KEY + user.password;
  const token = jwt.sign({ email: user.email, id: user.id }, secret, {
    expiresIn: "10m",
  });
  const link = `https://book-store-api-1t03.onrender.com/api/password/reset-password/${user._id}/${token}`;
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });
  const mailOption = {
    from: process.env.USER_EMAIL,
    to: user.email,
    subject: "reset password",
    html: `<div>
          <h1>reset password</h1>
          <p>this link will expires within 10 minutes</p>
          <p>click the link to reset the password</p>
          <a href=${link} style="text-decoration:none;border-radius:5px;">Reset password</a>
         </div>`,
  };
  await transporter.sendMail(mailOption);
  /* await sendEmail({
    to: user.email,
    subject: "Reset password",
    html: `<h1>Resset password</h1>
           <p>click the link to reset the password</p>
           <a href=${link} style="text-decoration:none;border-radius:5px;">Reset password</a>
           <p>this link will expire in 10 minutes</p>`,
  });*/
  res.render("link-send");
});

/*
   @des  get reset password link
   @method  get
   @route /password/reset-password/:Id/:token
   @access public
 */
module.exports.getResetPasswordView = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "not found" });
  }
  const secret = process.env.JWT_SECRET_KEY + user.password;
  try {
    jwt.verify(req.params.token, secret);
    res.render("reset-password", { email: user.email });
  } catch (error) {
    console.log(error);
    res.json({ meesage: "error" });
  }
});

/* @des  reset password  @method ........ post @route ......... /password/reset-password/:Id/:token @access ........ public*/
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { error } = validatePassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "not found" });
  }

  const secret = process.env.JWT_SECRET_KEY + user.password;
  try {
    jwt.verify(req.params.token, secret);
    req.body.password = await bcrypt.hash(req.body.password, 10);
    user.password = req.body.password;
    await user.save();
    res.render("successPassword");
  } catch (error) {
    console.log(error);
    res.json({ meesage: "error" });
  }
});
