const router = require("express").Router();
const synopsisController = require("../controllers/synopsisController");
const { auth, authorize } = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.get("/", auth, synopsisController.getAll);
router.get("/professors", auth, authorize('admin'), synopsisController.getProfessors);
router.put("/assign/:id", auth, authorize('admin'), synopsisController.assign);
router.post("/", auth, authorize('student'), upload.single("file"), synopsisController.upload);
router.put("/:id", auth, authorize('professor'), synopsisController.updateStatus);
router.delete("/:id", auth, authorize('admin'), synopsisController.deleteSynopsis);
router.put("/payment/:id", auth, authorize('student'), synopsisController.submitUTR);

module.exports = router;