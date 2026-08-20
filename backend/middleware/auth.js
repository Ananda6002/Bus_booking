const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies JWT and attaches the authenticated user to req.user
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    if (user.isBlocked) return res.status(403).json({ message: "This account has been blocked" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

// Restricts a route to specific roles, e.g. authorize("admin", "operator")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};

// Like protect, but does not fail if there's no token - just leaves req.user unset.
// Used on public endpoints (e.g. viewing seats) that behave slightly differently for logged-in users.
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user && !user.isBlocked) req.user = user;
    next();
  } catch (err) {
    next(); // invalid/expired token on a public route - just proceed as anonymous
  }
};

module.exports = { protect, authorize, optionalAuth };
