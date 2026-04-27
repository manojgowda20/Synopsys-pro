const router = require("express").Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user._id, role: req.user.role, name: req.user.name }, JWT_SECRET, { expiresIn: "1d" });
  res.redirect(`${process.env.FRONTEND_URL}/#auth?token=${token}&role=${req.user.role}&name=${req.user.name}`);
});

module.exports = router;