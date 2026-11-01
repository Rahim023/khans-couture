import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: "default",
  },
  heroImages: [{ type: String, trim: true }],
  behindTheScenes: [{ type: String, trim: true }],
  collectionImages: [{ type: String, trim: true }],
  trendingImages: [{ type: String, trim: true }],
  posterImages: [{ type: String, trim: true }],
}, {
  timestamps: true,
});

export default mongoose.model("Asset", assetSchema);
