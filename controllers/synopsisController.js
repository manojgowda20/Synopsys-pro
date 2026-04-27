const Synopsis = require("../models/Synopsis");
const User = require("../models/User");

exports.getAll = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'professor') {
      query = { assignedTo: req.user.id };
    } else if (req.user.role === 'student') {
      query = { studentId: req.user.id };
    }

    const data = await Synopsis.find(query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching submissions", error: err.message });
  }
};

exports.getProfessors = async (req, res) => {
  try {
    const profs = await User.find({ role: 'professor' }, 'username _id');
    res.json({ success: true, data: profs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching professors" });
  }
};

exports.assign = async (req, res) => {
  try {
    const { profId, profName } = req.body;
    const synopsis = await Synopsis.findByIdAndUpdate(req.params.id, { 
      assignedTo: profId, 
      assignedProfessorName: profName 
    }, { new: true });
    
    if (!synopsis) return res.status(404).json({ success: false, message: "Synopsis not found" });

    // Notify Professor via Socket.IO
    req.io.to('professor').emit('notification', {
      message: `A new synopsis "${synopsis.title}" has been assigned to you.`,
      type: 'assignment'
    });

    res.json({ success: true, message: "Assigned successfully", data: synopsis });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error during assignment" });
  }
};

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload a PDF file" });

    const s = new Synopsis({
      title: req.body.title,
      description: req.body.description,
      fileUrl: `${process.env.BASE_URL}/uploads/${req.file.filename}`,
      studentId: req.user.id
    });
    
    await s.save();

    // Notify Admin
    req.io.to('admin').emit('notification', {
      message: `New synopsis submission: "${s.title}"`,
      type: 'upload'
    });

    res.status(201).json({ success: true, message: "Synopsis uploaded successfully", data: s });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error during upload", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const synopsis = await Synopsis.findByIdAndUpdate(req.params.id, { status, feedback }, { new: true });
    
    if (!synopsis) return res.status(404).json({ success: false, message: "Synopsis not found" });

    // Notify Student
    req.io.to('student').emit('notification', {
      message: `Your synopsis "${synopsis.title}" has been ${status.toLowerCase()}.`,
      type: 'feedback'
    });

    res.json({ success: true, message: "Status updated successfully", data: synopsis });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

exports.deleteSynopsis = async (req, res) => {
  try {
    const synopsis = await Synopsis.findByIdAndDelete(req.params.id);
    if (!synopsis) return res.status(404).json({ success: false, message: "Synopsis not found" });
    res.json({ success: true, message: "Synopsis deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting synopsis" });
  }
};

exports.submitUTR = async (req, res) => {
  try {
    const { utr } = req.body;
    const synopsis = await Synopsis.findByIdAndUpdate(req.params.id, { 
      utr, 
      paymentStatus: "Pending" 
    }, { new: true });
    res.json({ success: true, message: "UTR submitted for verification", data: synopsis });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error submitting UTR" });
  }
};
