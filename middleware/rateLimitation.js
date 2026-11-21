const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 3,
  skipSuccessfulRequests: true,
  message: {
    message: "Too many failed login attempts try again later",
  },
});
module.exports = loginLimiter;
