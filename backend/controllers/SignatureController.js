// controllers/signature.controller.js
import Signature from "../models/Signature.js";

const normalizeSignature = (item) => {
  if (!item) return item;

  const sections = Array.isArray(item.sections) && item.sections.length
    ? item.sections
    : [item.section || "signature"];

  const section = ((item.section || sections[0] || "signature")).toString().trim().toLowerCase();

  return {
    ...item,
    section,
    sections: Array.from(new Set(sections.map((entry) => String(entry).trim().toLowerCase()))),
  };
};

export const getAllSignatures = async (req, res) => {
  try {
    const items = await Signature.find().sort({ createdAt: -1 }).lean();
    res.json(items.map(normalizeSignature));
  } catch (err) {
    console.error("getAllSignatures error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSignatureById = async (req, res) => {
  const { id } = req.params;
  try {
    let item = null;
    if (id && id.match && id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Signature.findById(id).lean();
    }

    if (!item) {
      const numeric = Number(id);
      if (!Number.isNaN(numeric)) {
        item = await Signature.findOne({ id: numeric }).lean();
      }
    }

    if (!item) return res.status(404).json({ message: "Signature not found" });
    res.json(normalizeSignature(item));
  } catch (err) {
    console.error("getSignatureById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSignatureBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const item = await Signature.findOne({ slug }).lean();
    if (!item) return res.status(404).json({ message: "Signature not found" });

    res.json(normalizeSignature(item));
  } catch (err) {
    console.error("getSignatureBySlug error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
