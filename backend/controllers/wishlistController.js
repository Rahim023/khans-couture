import Wishlist from "../models/Wishlist.js";
import Product from "../models/Products.js";
import Signature from "../models/Signature.js";
import mongoose from "mongoose";

/**
 * Helper: Format wishlist items for frontend
 */
const formatWishlistItems = (items) => {
  return items.map(item => {
    const id = item.id ? (typeof item.id === 'string' ? item.id : item.id.toString()) : String(item._id || '');
    return {
      id: id,
      title: item.title,
      price: item.price,
      img: item.img,
    };
  });
};

/**
 * GET /wishlist
 * Returns user's wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(200).json({ 
        success: true, 
        items: [] 
      });
    }

    const formattedItems = formatWishlistItems(wishlist.items);
    res.status(200).json({ 
      success: true, 
      items: formattedItems 
    });
  } catch (err) {
    console.error("❌ getWishlist error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching wishlist",
      error: err.message 
    });
  }
};

/**
 * POST /wishlist/add
 * Body: { productId }
 * Fetches product from DB, adds to wishlist if not exists
 */
export const addToWishlist = async (req, res) => {
  try {
    console.log("❤️ [addToWishlist] Called");
    console.log("   req.body:", JSON.stringify(req.body));
    console.log("   req.body.productId:", req.body.productId);
    console.log("   req.user._id:", req.user._id);

    const { productId } = req.body;
    const userId = req.user._id;

    console.log("❤️ Extracted productId:", productId, "Type:", typeof productId);

    if (!productId) {
      console.error("❌ [addToWishlist] No productId in request body. Body was:", req.body);
      return res.status(400).json({ 
        success: false,
        message: "❌ productId is required in request body" 
      });
    }

    // Find product by string _id using native query - check BOTH Product and Signature collections
    // Try to convert to ObjectId if valid MongoDB ID
    let searchId = productId;
    try {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        searchId = new mongoose.Types.ObjectId(productId);
      }
    } catch (e) {
      console.log("⚠️ Could not convert to ObjectId, using string:", productId);
    }

    console.log("🔍 Searching for product with ID:", searchId);

    let product = await Product.findOne({ _id: searchId });
    
    if (!product) {
      // Try Signature collection if not found in Product
      product = await Signature.findOne({ _id: searchId });
    }

    // If still not found, try searching by numeric 'id' field (for Signature documents)
    if (!product) {
      const numericId = Number(productId);
      if (!Number.isNaN(numericId)) {
        console.log("🔍 Trying numeric id search:", numericId);
        product = await Signature.findOne({ id: numericId });
      }
    }
    
    if (!product) {
      console.error("❌ [addToWishlist] Product not found in Product or Signature collection for ID:", productId);
      console.log("📊 Signature collection sample:", await Signature.findOne({}).select('_id id slug title').lean());
      return res.status(404).json({ 
        success: false,
        message: "❌ Product not found in database" 
      });
    }

    console.log("✅ [addToWishlist] Product found:", product.title);

    // Get or create user's wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
      console.log("💔 [addToWishlist] Created new wishlist for user");
    }

    // Check if product already in wishlist (compare as strings)
    const exists = wishlist.items.some(
      item => String(item.id) === String(productId)
    );

    if (exists) {
      console.warn("⚠️ [addToWishlist] Product already in wishlist");
      const formattedItems = formatWishlistItems(wishlist.items);
      return res.status(200).json({ 
        success: true, 
        message: "⚠️ Product already in wishlist",
        items: formattedItems 
      });
    }

    // Add new product to wishlist with string _id
    const wishlistItemId = String(product._id);
    wishlist.items.push({
      id: wishlistItemId,
      title: product.title,
      price: product.price,
      img: product.img,
    });

    await wishlist.save();
    console.log("✅ [addToWishlist] Added to wishlist:", product.title);

    // Return formatted wishlist items
    const formattedItems = formatWishlistItems(wishlist.items);
    res.status(200).json({ 
      success: true, 
      message: "✅ Added to wishlist",
      items: formattedItems 
    });
  } catch (err) {
    console.error("❌ [addToWishlist] Error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error adding to wishlist",
      error: err.message 
    });
  }
};

/**
 * DELETE /wishlist/:id
 * Removes a product from wishlist
 */
export const removeWishlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    console.log("🗑️ removeWishlistItem called for:", productId);

    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: "❌ Product ID is required in URL" 
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(200).json({ 
        success: true, 
        items: [] 
      });
    }

    // Filter out the item to remove
    const beforeCount = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      item => String(item.id) !== productId
    );
    const afterCount = wishlist.items.length;

    if (beforeCount === afterCount) {
      console.log("⚠️ Product not found in wishlist");
    } else {
      console.log("✅ Product removed from wishlist");
    }

    await wishlist.save();

    // Return formatted items
    const formattedItems = formatWishlistItems(wishlist.items);
    res.status(200).json({ 
      success: true, 
      items: formattedItems 
    });
  } catch (err) {
    console.error("❌ removeWishlistItem error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error removing from wishlist",
      error: err.message 
    });
  }
};
