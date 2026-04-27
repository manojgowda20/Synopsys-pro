const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { auth, authorize } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, "qr-" + Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.get("/users", auth, authorize("admin"), adminController.getUsers);
router.get("/export-students", auth, authorize("admin"), adminController.exportStudents);
router.delete("/users/:id", auth, authorize("admin"), adminController.deleteUser);
router.put("/users/:id/role", auth, authorize("admin"), adminController.updateRole);

router.post("/qr-code", auth, authorize("admin"), upload.single("qr"), adminController.updateQRCode);
router.get("/qr-code", auth, adminController.getQRCode);
router.put("/payment-verify/:id", auth, authorize("admin"), adminController.verifyPayment);

module.exports = router;
