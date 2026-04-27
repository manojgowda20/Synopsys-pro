const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: String
});

module.exports = mongoose.model("Settings", schema);
