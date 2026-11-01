import CustomOrder from "../models/CustomOrder.js";
import { uploadImages } from "../services/imageUpload.js";
import { sendAdminNotification, sendCustomerConfirmation } from "../services/emailService.js";
import { nextOrderId } from "../services/idService.js";
import User from "../models/User.js";
import { nextCustomerId } from "../services/idService.js";
import { randomBytes } from "crypto";

export const createCustomOrder = async (req, res) => {
  try {
    const files = req.files || [];
    let imageUrls = [];

    if (files.length) {
      try {
        imageUrls = await uploadImages(files);
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return res.status(502).json({ message: "One or more reference images could not be uploaded. Please try again." });
      }
    }

    const data = {
      orderType: req.body.orderType,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      outfitType: req.body.outfitType,
      color: req.body.color,
      budget: req.body.budget,
      deliveryDate: req.body.deliveryDate,
      designImages: imageUrls,
      measurements: req.body.measurements ? JSON.parse(req.body.measurements) : undefined,
      fabricPreference: req.body.fabricPreference,
      embroideryDetails: req.body.embroideryDetails,
      specialInstructions: req.body.specialInstructions,
      weddingPieces: req.body.weddingPieces,
      weddingNotes: req.body.weddingNotes,
    };

    let user = await User.findOne({ email: String(req.body.email || "").trim().toLowerCase() });
    if (user && !user.customerId) {
      user.customerId = await nextCustomerId();
      await user.save();
    } else if (!user) {
      user = await User.create({
        username: String(req.body.fullName || "").trim(),
        email: String(req.body.email || "").trim().toLowerCase(),
        password: randomBytes(16).toString("hex"),
        phone: String(req.body.phone || "").trim(),
        postalCode: "N/A",
        country: "India",
        customerId: await nextCustomerId(),
      });
    }
    const order = await CustomOrder.create({
      ...data,
      orderId: await nextOrderId(),
      customerId: user.customerId,
      user: user._id,
    });

    // send emails (don't block response)
    sendAdminNotification(order).catch((err) => console.error("Email admin error:", err));
    sendCustomerConfirmation(order).catch((err) => console.error("Email customer error:", err));

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create custom order", error: err.message });
  }
};

export const getCustomOrders = async (req, res) => {
  try {
    const orders = await CustomOrder.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch custom orders" });
  }
};

export const getCustomOrderById = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch custom order" });
  }
};

export const updateCustomOrder = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.measurements && typeof updates.measurements === "string") {
      updates.measurements = JSON.parse(updates.measurements);
    }
    const order = await CustomOrder.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update custom order" });
  }
};

export const deleteCustomOrder = async (req, res) => {
  try {
    const order = await CustomOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete custom order" });
  }
};
