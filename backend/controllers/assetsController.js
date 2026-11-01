import Asset from "../models/Assets.js";

const DEFAULT_ASSET_DATA = {
  name: "default",
  heroImages: [
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
  ],
  behindTheScenes: [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  ],
  collectionImages: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  ],
  trendingImages: [
    "https://images.unsplash.com/photo-1495385794356-15371f348c31",
  ],
  posterImages: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  ],
};

const sanitizeImageArray = (value, fallback) => {
  if (Array.isArray(value)) {
    const cleaned = value
      .filter((item) => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());

    return cleaned.length > 0 ? cleaned : fallback;
  }

  return fallback;
};

const normalizeAsset = (asset) => ({
  _id: asset._id,
  name: asset.name,
  heroImages: sanitizeImageArray(asset.heroImages, DEFAULT_ASSET_DATA.heroImages),
  behindTheScenes: sanitizeImageArray(asset.behindTheScenes, DEFAULT_ASSET_DATA.behindTheScenes),
  collectionImages: sanitizeImageArray(asset.collectionImages, DEFAULT_ASSET_DATA.collectionImages),
  trendingImages: sanitizeImageArray(asset.trendingImages, DEFAULT_ASSET_DATA.trendingImages),
  posterImages: sanitizeImageArray(asset.posterImages, DEFAULT_ASSET_DATA.posterImages),
  createdAt: asset.createdAt,
  updatedAt: asset.updatedAt,
});

export const getAssets = async (req, res) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { name: "default" },
      { $setOnInsert: DEFAULT_ASSET_DATA },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json(normalizeAsset(asset));
  } catch (err) {
    console.error("❌ Error fetching assets:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const upsertAssets = async (req, res) => {
  try {
    const incoming = req.body || {};

    const assetData = {
      heroImages: sanitizeImageArray(incoming.heroImages, DEFAULT_ASSET_DATA.heroImages),
      behindTheScenes: sanitizeImageArray(incoming.behindTheScenes, DEFAULT_ASSET_DATA.behindTheScenes),
      collectionImages: sanitizeImageArray(incoming.collectionImages, DEFAULT_ASSET_DATA.collectionImages),
      trendingImages: sanitizeImageArray(incoming.trendingImages, DEFAULT_ASSET_DATA.trendingImages),
      posterImages: sanitizeImageArray(incoming.posterImages, DEFAULT_ASSET_DATA.posterImages),
    };

    const asset = await Asset.findOneAndUpdate(
      { name: "default" },
      { $set: assetData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return res.json(normalizeAsset(asset));
  } catch (err) {
    console.error("❌ Error upserting assets:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
