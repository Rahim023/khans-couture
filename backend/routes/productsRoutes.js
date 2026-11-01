import express from "express";
import { 
  getAllProducts, 
  getTrendingProducts,
  getProductById
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/trending", getTrendingProducts);

// 🔥 ADD THIS
router.get("/:id", getProductById);

export default router;
