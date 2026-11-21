const express = require("express");
const router = express.Router();
const {
  verfiyTokenAndAuthorization,
  verfiyTokenAndAdmin,
} = require("../middleware/verifyToken");
const {
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  deleteUsers,
  usersCount,
} = require("../controller/userController");

// count total users
router.get("/count", verfiyTokenAndAdmin, usersCount);
// /api/users
router
  .route("/")
  .get(verfiyTokenAndAdmin, getAllUsers)
  .delete(verfiyTokenAndAdmin, deleteUsers);

// /api/user/:id
router
  .route("/:id")
  .put(verfiyTokenAndAuthorization, updateUser)
  .get(verfiyTokenAndAuthorization, getUserById)
  .delete(verfiyTokenAndAuthorization, deleteUser);

module.exports = router;
