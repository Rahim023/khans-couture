// ⭐⭐⭐ FINAL CART CONTROLLER (paste into controllers/cartController.js)
import Cart from "../models/Cart.js";

const normalizeProductId = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.json({ items: [] });

    // Return a consistent shape: { items: [...] }
    return res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, title, price, img, quantity, size } = req.body;
    const normalizedProductId = normalizeProductId(productId);

    if (!normalizedProductId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: []
      });
    }

    const existing = cart.items.find(
      (item) => String(item.productId) === normalizedProductId && String(item.size || "") === String(size || "")
    );

    if (existing) {
      existing.quantity += Number(quantity || 1);
    } else {
      cart.items.push({
        productId: normalizedProductId,
        title,
        price,
        img,
        quantity: Number(quantity || 1),
        size
      });
    }

    await cart.save();
    res.json({ success: true, items: cart.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const { size } = req.query; // optional size to remove specific item

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.json({ items: [] });

    // If size provided, remove only the matching productId+size
    if (size) {
      cart.items = cart.items.filter(
        (i) => !(i.productId === productId && String(i.size) === String(size))
      );
    } else {
      // Fallback: remove items matching productId
      cart.items = cart.items.filter((i) => i.productId !== productId);
    }

    await cart.save();
    return res.json({ success: true, items: cart.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
