import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  cancelOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", auth, getAllOrders);
router.get("/my-orders", auth, getMyOrders);
router.post("/", auth, createOrder);
router.put("/cancel/:id", auth, cancelOrder);
router.get("/:id", auth, getOrder);
router.delete("/:id", auth, deleteOrder);

export default router;
