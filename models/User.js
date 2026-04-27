const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth users
  role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
  googleId: { type: String },
  isVerified: { type: Boolean, default: true },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true, collection: 'users_new', autoIndex: false });

module.exports = mongoose.model("User", schema);