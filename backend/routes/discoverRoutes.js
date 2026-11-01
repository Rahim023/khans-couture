import express from "express";
import Product from "../models/Products.js";
import Signature from "../models/Signature.js";

const router = express.Router();

// GET /api/discover
router.get("/", async (req, res) => {
  try {
    // Fetch 2 signature and 2 normal products for spotlight
    const signatureItems = await Signature.find().limit(2);
    const productItems = await Product.find().limit(2);

    const spotlight = [...signatureItems, ...productItems].map(p => ({
      id: p._id,
      title: p.title,
      img: p.img || p.images?.[0] || "",
      isSignature: p instanceof Signature
    }));

    // Fetch 3 products for curated tiles
    const curatedTiles = await Product.find().limit(3);
    const tiles = curatedTiles.map(p => ({
      id: p._id,
      title: p.title,
      img: p.img || p.images?.[0] || ""
    }));

    res.status(200).json({ spotlight, tiles });
  } catch (err) {
    console.error("❌ Discover fetch error:", err);
    res.status(500).json({ success: false, message: "Server error fetching discover data" });
  }
});

export default router;
