const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  utr: { type: String },
  paymentStatus: { type: String, enum: ['Not Paid', 'Pending', 'Verified', 'Rejected'], default: 'Not Paid' },
  feedback: { type: String, default: "" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedProfessorName: { type: String, default: "Unassigned" }
}, { timestamps: true });

module.exports = mongoose.model("Synopsis", schema);