const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User, vaildateUpdateUser } = require("../models/User");
const asyncHandler = require("express-async-handler");
const {
  verfiyTokenAndAuthorization,
  verfiyTokenAndAdmin,
} = require("../middleware/verifyToken");

/**
 * @desc update user
 * @route /api/users/:id
 * @method put
 * @access private
 */

router.put(
  "/:id",
  verfiyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    const { error } = vaildateUpdateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const userupdated = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          email: req.body.email,
          password: req.body.password,
          username: req.body.username,
        },
      },
      { new: true },
    ).select("-password");
    res.status(200).json(userupdated);
  }),
);

/**
 * @des get all users
 * @route /api/users
 * @method get
 * @access private (only admin)
 */

router.get(
  "/",
  verfiyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  }),
);

/**
 * @des get user by id
 * @route /api/users/:id
 * @method get
 * @access private (only admin and usr himself)
 */

router.get(
  "/:id",
  verfiyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "user is not found" });
    }
  }),
);
/**
 * @des delete user by id
 * @route /api/users/:id
 * @method delete
 * @access private (only admin and user himself)
 */
router.delete(
  "/:id",
  verfiyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      await User.findByIdAndDelete(user);
      res.status(200).json({ message: "user has been deleted" });
    } else {
      res.status(404).json({ message: "user is not found" });
    }
  }),
);

module.exports = router;
