const User = require("../models/User");
const XLSX = require("xlsx");
const Settings = require("../models/Settings");
const Synopsis = require("../models/Synopsis");


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

exports.exportStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    const studentData = [];

    for (const student of students) {
      const synopsis = await Synopsis.findOne({ studentId: student._id });
      studentData.push({
        "User ID": student.username,
        "Payment Status": synopsis ? synopsis.paymentStatus : "Not Paid",
        "UTR Number": synopsis ? (synopsis.utr || "N/A") : "N/A",
        "Joined Date": new Date(student.createdAt).toLocaleDateString()
      });
    }

    const ws = XLSX.utils.json_to_sheet(studentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students Payment Status");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=Students_Payment_Status.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (err) {
    console.error("Export Error:", err);
    res.status(500).json({ success: false, message: "Error exporting students" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "professor", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User role updated successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating role" });
  }
};


exports.updateQRCode = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Upload QR image" });
    const qrUrl = `/uploads/${req.file.filename}`;
    await Settings.findOneAndUpdate({ key: "qr_code" }, { value: qrUrl }, { upsert: true });
    res.json({ success: true, message: "QR Code updated", url: qrUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating QR" });
  }
};

exports.getQRCode = async (req, res) => {
    try {
      const qr = await Settings.findOne({ key: "qr_code" });
      res.json({ success: true, url: qr ? qr.value : null });
    } catch (err) { res.status(500).json({ success: false }); }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const synopsis = await Synopsis.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    res.json({ success: true, message: `Payment ${paymentStatus}`, data: synopsis });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};
