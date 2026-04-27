const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

exports.signup = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Please provide username and password" });
    }

    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ success: false, message: "User ID already exists" });

    const hash = await bcrypt.hash(password, 10);

    user = new User({
      username,
      password: hash,
      role: role || "student",
      isVerified: true
    });

    console.log("Signup Request Body:", req.body);
    await user.save();

    res.status(201).json({ 
      success: true, 
      message: "User created successfully! You can now log in." 
    });
  } catch (err) {
    console.error("Signup Error Object:", JSON.stringify(err, null, 2));
    res.status(500).json({ success: false, message: "Error during signup", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Please provide user id and password" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.username }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    res.json({ 
      success: true, 
      message: "Login successful",
      data: { token, role: user.role, name: user.username } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
    res.status(400).json({ success: false, message: "Forgot password is disabled in User ID mode. Please contact admin." });
};

exports.resetPassword = async (req, res) => {
    res.status(400).json({ success: false, message: "Reset password is disabled in User ID mode." });
};
