const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Ensure this path points to your User model

// Change this to your actual MongoDB URI if different
const MONGO_URI = "mongodb://127.0.0.1:27017/synopsisDB";

async function createInitialUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB for setup...");

    // Clear existing users to avoid duplicates (Optional - remove if you want to keep old users)
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash("1234", 10);

    const users = [
      {
        username: "admin",
        password: hashedPassword,
        role: "admin"
      },
      {
        username: "smith",
        password: hashedPassword,
        role: "professor"
      },
      {
        username: "watson",
        password: hashedPassword,
        role: "professor"
      },
      {
        username: "student",
        password: hashedPassword,
        role: "student"
      }
    ];

    await User.insertMany(users);
    console.log("✅ Successfully created Admin, 2 Professors, and 1 Student!");
    process.exit();
  } catch (err) {
    console.error("❌ Error during setup:", err);
    process.exit(1);
  }
}

createInitialUsers();