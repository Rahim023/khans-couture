import Order from "../models/orders.js";
import User from "../models/User.js";
import { nextOrderId } from "../services/idService.js";
import {
  sendOrderConfirmationCustomerEmail,
  sendOrderConfirmationAdminEmail,
} from "../services/emailService.js";

const normaliseText = (value) => String(value ?? "").trim();

const buildCustomer = (user, supplied = {}) => ({
  userId: String(user?._id || supplied.userId || ""),
  customerId: String(user?.customerId || supplied.customerId || ""),
  name: normaliseText(supplied.name || supplied.fullName || user?.username || "Customer"),
  email: normaliseText(supplied.email || user?.email || "").toLowerCase(),
  phone: normaliseText(supplied.phone || user?.phone || ""),
  username: normaliseText(supplied.username || user?.username || ""),
});

const buildShippingAddress = (supplied = {}) => ({
  firstName: normaliseText(supplied.firstName || supplied.first_name || ""),
  lastName: normaliseText(supplied.lastName || supplied.last_name || ""),
  addressLine1: normaliseText(supplied.addressLine1 || supplied.address || supplied.address1 || ""),
  addressLine2: normaliseText(supplied.addressLine2 || supplied.address2 || ""),
  city: normaliseText(supplied.city || ""),
  state: normaliseText(supplied.state || ""),
  postalCode: normaliseText(supplied.postalCode || supplied.postal_code || ""),
  country: normaliseText(supplied.country || "India"),
});

const sendOrderEmails = async (order, customer) => {
  try {
    await sendOrderConfirmationCustomerEmail(order, customer);
  } catch (error) {
    console.error("❌ Error sending customer email:", error.message);
  }

  try {
    await sendOrderConfirmationAdminEmail(order, customer);
  } catch (error) {
    console.error("❌ Error sending admin email:", error.message);
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { items, totalINR, customer, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }

    const orderCustomer = buildCustomer(user, customer || {});
    const orderShippingAddress = buildShippingAddress(shippingAddress || {});

    if (!orderCustomer.name || !orderCustomer.email || !orderCustomer.phone) {
      return res.status(400).json({ message: "Customer name, email, and phone are required." });
    }

    if (!orderShippingAddress.firstName || !orderShippingAddress.lastName || !orderShippingAddress.addressLine1 || !orderShippingAddress.city || !orderShippingAddress.postalCode || !orderShippingAddress.country) {
      return res.status(400).json({ message: "Complete shipping address is required." });
    }

    const order = await Order.create({
      orderId: await nextOrderId(),
      user: userId,
      customer: orderCustomer,
      shippingAddress: orderShippingAddress,
      items,
      totalINR: Number(totalINR || 0),
      status: "Ordered"
    });

    if (user && user.email) {
      sendOrderEmails(order, user).catch((err) =>
        console.error("Order email error:", err)
      );
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "username email phone").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const reason = req.body.reason || "No reason provided";

    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        status: "Cancelled",
        cancelledReason: reason,
        cancelledAt: new Date()
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    await Order.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
