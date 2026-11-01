// routes/collectionRoutes.js
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    womenImage: "https://your-db-url/women.jpg",
    menImage: "https://your-db-url/men.jpg",
    heroImage: "https://your-db-url/hero.jpg"
  });
});

export default router;
