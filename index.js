require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const passport = require("passport");

// Passport Config
require("./config/passport");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "client")));

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("join", (role) => {
    socket.join(role);
    console.log(`User joined room: ${role}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Middleware to inject io into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/synopsis", require("./routes/synopsis"));
app.use("/api/admin", require("./routes/admin"));

// 404 Handler
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong on the server!", 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// Serve Frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/synopsisDB";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("DB Connected");
    server.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("DB Connection Error:", err));