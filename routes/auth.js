const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controller/authController");
const loginLimiter = require("../middleware/rateLimitation");
const { verifyToken } = require("../middleware/verifyToken");
const { currentUser } = require("../controller/authController");
const { preventAuthCaching } = require("../middleware/authCaching");
// /api/auth/register
router.post("/register", register);
// /api/auth/login
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", preventAuthCaching, verifyToken, currentUser);

module.exports = router;
