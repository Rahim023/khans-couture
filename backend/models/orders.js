import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, sparse: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },

  customer: {
    userId: String,
    customerId: String,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    username: String,
  },

  shippingAddress: { type: shippingAddressSchema, required: true },

  items: [
    {
      productId: { type: String, required: true },
      title: String,
      price: Number,
      quantity: Number,
      size: String,
      img: String
    }
  ],

  totalINR: { type: Number, required: true },
  status: { type: String, default: "Ordered" },

  cancelledReason: String,
  cancelledAt: Date,
  exportedAt: Date,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
