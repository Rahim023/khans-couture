// src/pages/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // 🔹 Resolve ID from ANY shape
  const resolveId = (item) => {
    if (!item) return null;

    if (item.productId) return String(item.productId);
    if (item._id) return String(item._id);
    if (item.id) return String(item.id);
    if (item.product && (item.product._id || item.product.id)) {
      return String(item.product._id || item.product.id);
    }
    return null;
  };

  // 🔹 Normalize wishlist item
  const normalize = (item) => {
    const prod = item.product || item;
    const id = resolveId(item) || resolveId(prod) || "unknown";

    return {
      id,
      title: prod.title || item.title || "Untitled Product",
      img: prod.img || item.img || prod.images?.[0] || "",
      price: prod.price || item.price || 0,
      size: item.size,
      ...item,
    };
  };

  // 🔹 Load wishlist on mount
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Load guest wishlist from localStorage
        try {
          const guest = JSON.parse(localStorage.getItem("rt_guest_wishlist") || "[]");
          setWishlist((guest || []).map(normalize));
        } catch (e) {
          setWishlist([]);
        }
        setLoading(false);
        return;
      }

      try {
        // If logged in, merge guest wishlist then fetch server wishlist
        await mergeGuestWishlist();
        const res = await axiosInstance.get("/wishlist");
        setWishlist((res.data.items || []).map(normalize));
      } catch (err) {
        console.error("Wishlist fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    // Poll for token changes (detect login in same tab)
    let lastToken = localStorage.getItem("token");
    load();
    const poll = setInterval(() => {
      const t = localStorage.getItem("token");
      if (t !== lastToken) {
        lastToken = t;
        load();
      }
    }, 1000);

    return () => clearInterval(poll);
  }, []);

  // Guest wishlist helpers
  const GUEST_KEY = "rt_guest_wishlist";
  const getGuestWishlist = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };
  const saveGuestWishlist = (items) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items || []));
  };
  const clearGuestWishlist = () => localStorage.removeItem(GUEST_KEY);

  // Merge guest wishlist into server on login
  const mergeGuestWishlist = async () => {
    const guest = getGuestWishlist();
    if (!guest || guest.length === 0) return;

    try {
      for (const it of guest) {
        const productId = resolveId(it) || it.productId || it.id || it._id;
        if (!productId) continue;
        await axiosInstance.post("/wishlist/add", { productId: String(productId) });
      }
      clearGuestWishlist();
    } catch (err) {
      console.warn("Failed merging guest wishlist:", err.response?.data || err);
    }
  };

  // 🔹 Add product
  const addToWishlist = async (product) => {
    const token = localStorage.getItem("token");

    const productId = resolveId(product);

    if (!productId) {
      console.error("❌ Product ID missing in addToWishlist:", product);
      return false;
    }

    // If not authenticated, save to guest wishlist
    if (!token) {
      try {
        const guest = getGuestWishlist();
        guest.push({ productId: String(productId), title: product.title, img: product.img, price: product.price });
        saveGuestWishlist(guest);
        setWishlist((guest || []).map(normalize));
        setShowLoginModal(true);
        return false;
      } catch (e) {
        console.error("Guest wishlist save failed:", e);
        return false;
      }
    }

    try {
      const res = await axiosInstance.post("/wishlist/add", {
        productId: String(productId),
      });

      setWishlist((res.data.items || []).map(normalize));
      return true;
    } catch (err) {
      console.error("Wishlist add error:", err.response?.data || err);
      return false;
    }
  };

  // 🔹 Remove product
  const removeFromWishlist = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Remove from guest wishlist
      try {
        const guest = getGuestWishlist().filter((g) => (g.productId || g.id || g._id) !== String(id));
        saveGuestWishlist(guest);
        setWishlist((guest || []).map(normalize));
        setShowLoginModal(true);
        return false;
      } catch (e) {
        console.error("Guest wishlist remove failed:", e);
        return false;
      }
    }

    try {
      const res = await axiosInstance.delete(`/wishlist/${String(id)}`);
      setWishlist((res.data.items || []).map(normalize));
      return true;
    } catch (err) {
      console.error("Wishlist remove error:", err.response?.data || err);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, addToWishlist, removeFromWishlist, showLoginModal, setShowLoginModal }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
