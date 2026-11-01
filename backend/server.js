// ⚠️ CRITICAL: Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Product from "./models/Products.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import SignatureRoutes from "./routes/SignatureRoutes.js";
import discoverRoutes from "./routes/discoverRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import shopRoutes from "./routes/shopRoutes.js";
import assetsRoutes from "./routes/assetsRoutes.js";
import customOrderRoutes from "./routes/customOrderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { getEmailTransporter, verifyEmailTransporter } from "./config/emailConfig.js";
import { backfillVisibleIds } from "./services/idService.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
// Backward-compatible auth paths for older frontend deployments.
app.use("/auth", authRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes); 
app.use("/api/collections", collectionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/signatures", SignatureRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/newsletter", newsletterRoutes);

const seedProductsIfEmpty = async () => {
  try {
    const totalProducts = await Product.countDocuments();
    if (totalProducts > 0) {
      console.log(`✅ Product collection already contains ${totalProducts} records.`);
      return;
    }

    const seedPath = path.join(__dirname, "khans_couture_products.json");
    const payload = await fs.readFile(seedPath, "utf8");
    const products = JSON.parse(payload);

    if (!Array.isArray(products) || products.length === 0) {
      console.warn("⚠️ No products found in the local seed file.");
      return;
    }

    await Product.insertMany(products, { ordered: false });
    console.log(`✅ Seeded ${products.length} products into the Products collection.`);
  } catch (error) {
    console.error("❌ Product seeding failed:", error.message);
  }
};

const PORT = Number(process.env.PORT || 5000);
const MAX_RETRIES = 5;
let retryCount = 0;

const startServer = async () => {
  // Verify email configuration on startup
  try {
    const emailTransporter = getEmailTransporter();
    const emailVerified = await verifyEmailTransporter(emailTransporter);
    if (!emailVerified) {
      console.warn("⚠️  WARNING: Email service is not available. Order emails will not be sent.");
    }
  } catch (error) {
    console.error("❌ Email configuration error:", error.message);
    console.warn("⚠️  WARNING: Email service initialization failed. Server will continue, but emails will not work.");
  }

  const server = app.listen(PORT, () => {
    retryCount = 0;
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      retryCount += 1;

      if (retryCount > MAX_RETRIES) {
        console.error(`❌ Port ${PORT} is still in use after ${MAX_RETRIES} retries. Exiting.`);
        process.exit(1);
      }

      console.log(`Port ${PORT} is in use, retry ${retryCount}/${MAX_RETRIES} in 5 seconds...`);
      server.close(() => {
        setTimeout(() => {
          startServer();
        }, 5000);
      });
      return;
    }

    console.error("❌ Server error:", err);
    process.exit(1);
  });
};

const connectAndStart = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected");
    await backfillVisibleIds();
    await seedProductsIfEmpty();
    await startServer();
  } catch (err) {
    console.error("❌ DB Error:", err);
    process.exit(1);
  }
};

connectAndStart();
