import express from "express";
import multer from "multer";
import {
  createCustomOrder,
  getCustomOrders,
  getCustomOrderById,
  updateCustomOrder,
  deleteCustomOrder,
} from "../controllers/customOrderController.js";

const router = express.Router();

// memory storage for multer (we upload to Cloudinary via buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype?.startsWith("image/")) return callback(null, true);
    callback(new Error("Only image files can be uploaded as design references."));
  },
});

router.post("/", upload.array("designImages", 8), createCustomOrder);
router.get("/", getCustomOrders);
router.get("/:id", getCustomOrderById);
router.put("/:id", upload.none(), updateCustomOrder);
router.delete("/:id", deleteCustomOrder);

export default router;
