const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ success: false, message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not have permission." });
    }
    next();
  };
};

module.exports = { auth, authorize };