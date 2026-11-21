const bcrypt = require("bcryptjs");
const { User, vaildateUpdateUser } = require("../models/User");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

/**
 * @desc update user
 * @route /api/users/:id
 * @method put
 * @access private
 */
const updateUser = asyncHandler(async (req, res) => {
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
});

/**
 * @des get all users
 * @route /api/users
 * @method get
 * @access private (only admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { limit, after } = req.query;
  const pageLimit = Number(limit ?? 15);
  const query = {};
  if (
    limit === "" ||
    !Number.isInteger(pageLimit) ||
    pageLimit < 1 ||
    pageLimit > 15
  ) {
    return res.status(400).json({ message: "limit must be between 1 and 15" });
  }

  if (after !== undefined) {
    if (!mongoose.isValidObjectId(after)) {
      return res.status(400).json({ message: "invalid cursor" });
    }
    query._id = { $gt: new mongoose.Types.ObjectId(after) };
  }
  if (req.query.search?.trim()) {
    const search = req.query.search.trim();
    const escapedSearch = search.replace(/[.*+?^${}|()[\]\\]/g, "\\$&");
    query.username = {
      $regex: `^${escapedSearch}`,
      $options: "i",
    };
  }
  const users = await User.find(query)
    .select("username email createdAt ")
    .sort({ _id: 1 })
    .limit(pageLimit + 1)
    .lean();
  const usersList = users.slice(0, pageLimit);
  const nextPage = users.length > pageLimit;
  const nextCursor = nextPage
    ? usersList[usersList.length - 1]._id.toString()
    : null;
  res.status(200).json({ usersList, nextCursor, nextPage });
});
/**
 * @des get all users count
 * @route /api/users/count
 * @method get
 * @access private (only admin)
 */
const usersCount = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({});
  res.status(200).json({ totalUsers });
});

/**
 * @des get user by id
 * @route /api/users/:id
 * @method get
 * @access private (only admin and usr himself)
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "user is not found" });
  }
});

/**
 * @des delete user by id
 * @route /api/users/:id
 * @method delete
 * @access private (only admin and user himself)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.findByIdAndDelete(user);
    res.status(200).json({ message: "user has been deleted" });
  } else {
    res.status(404).json({ message: "user is not found" });
  }
});

/**
 * @des delete all except the admin
 * @route /api/users/
 * @method delete
 * @access private (only admin and user himself)
 */
const deleteUsers = asyncHandler(async (req, res) => {
  const deletedUsers = await User.deleteMany({ isAdmin: { $ne: true } });
  res.status(200).json({ deletedUsers });
});
module.exports = {
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  deleteUsers,
  usersCount,
};
