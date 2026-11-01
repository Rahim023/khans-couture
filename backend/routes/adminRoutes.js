import express from "express";
import multer from "multer";
import protect, { requireAdmin } from "../middleware/authMiddleware.js";
import {
  getAdminOverview,
  getAdminOrders,
  getAdminProducts,
  getAdminCustomOrders,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  updateAdminOrder,
  updateAdminCustomOrder,
  createAdminOrder,
  exportNewOrdersToWorkbook,
} from "../controllers/adminController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const productUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype?.startsWith("image/")) return callback(new Error("Only image files are allowed"));
    callback(null, true);
  },
});

router.use(protect, requireAdmin);
router.get("/overview", getAdminOverview);
router.get("/orders", getAdminOrders);
router.get("/products", getAdminProducts);
router.get("/custom-orders", getAdminCustomOrders);
router.get("/users", getAdminUsers);
router.put("/users/:id/role", updateAdminUserRole);
router.delete("/users/:id", deleteAdminUser);
router.post("/products", productUpload.single("image"), createAdminProduct);
router.put("/products/:id", productUpload.single("image"), updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);
router.post("/orders", createAdminOrder);
router.put("/orders/:id", updateAdminOrder);
router.put("/custom-orders/:id", updateAdminCustomOrder);
router.post("/orders/export-excel", upload.single("workbook"), exportNewOrdersToWorkbook);

export default router;
