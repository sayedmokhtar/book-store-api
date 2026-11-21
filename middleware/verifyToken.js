const jwt = require("jsonwebtoken");

// verify token
function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "invalid token" });
    }
  } else {
    res.status(403).json({ message: "Access denied. Please log in" });
  }
}
// verfiy token and authorize user

function verfiyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.params.id === req.user.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "you are not allowed" });
    }
  });
}

// verify token and admin

function verfiyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "you are not allowed" });
    }
  });
}

module.exports = {
  verfiyTokenAndAuthorization,
  verfiyTokenAndAdmin,
  verifyToken,
};
