// ⭐⭐⭐ FINAL CART ROUTES (paste into routes/cartRoutes.js)
import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/clear", protect, clearCart);
router.delete("/:id", protect, removeFromCart);

export default router;
