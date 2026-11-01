// ⭐⭐⭐ FINAL CART MODEL (paste into models/cart.js)
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: String,
    price: Number,
    img: String,
    quantity: { type: Number, default: 1 },
    size: String
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
