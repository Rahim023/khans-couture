// src/pages/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const resolveProductId = (product) => {
  if (!product) return "";
  return String(product.productId || product.id || product._id || "").trim();
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const BASE_URL = "https://khans-couture.onrender.com/api";

  // 🔥 Axios instance that ALWAYS fetches latest token
  const axiosInstance = axios.create({ baseURL: BASE_URL });

  const isValidToken = (token) => !!token && token.split(".").length === 3;

  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (isValidToken(token)) config.headers.Authorization = `Bearer ${token}`;
    else {
      delete config.headers.Authorization;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLoginModal(true);
      }
      return Promise.reject(error);
    }
  );

  const normalizeItem = (item) => ({
    ...item,
    id: String(item.productId || item.id || item._id || ""),
    quantity: Number(item.quantity || 1),
  });
  // Guest storage helpers (local, private to this browser)
  const GUEST_KEY = "rt_guest_cart";
  const getGuestCart = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };
  const saveGuestCart = (items) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items || []));
  };
  const clearGuestCart = () => localStorage.removeItem(GUEST_KEY);

  // Fetch server cart if token present, otherwise load guest cart
  useEffect(() => {
    let mounted = true;

    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!isValidToken(token)) {
        // Load guest cart into UI
        const guest = getGuestCart();
        if (mounted) setCart((guest || []).map(normalizeItem));
        return;
      }

      try {
        // If logged in, first merge guest cart then fetch server cart
        await mergeGuestCart();
        const res = await axiosInstance.get("/cart");
        if (mounted) setCart((res.data.items || []).map(normalizeItem));
      } catch (err) {
        console.error("Cart fetch error:", err.response?.data || err);
      }
    };

    // Watch for token changes across the app (simple poll). This ensures
    // if the user logs in without reloading, we detect the token and merge.
    let lastToken = localStorage.getItem("token");
    fetchCart();
    const poll = setInterval(() => {
      const t = localStorage.getItem("token");
      if (t !== lastToken) {
        lastToken = t;
        fetchCart();
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, []);

  // Merge guest cart into server when user logs in
  const mergeGuestCart = async () => {
    const guest = getGuestCart();
    if (!guest || guest.length === 0) return;

    try {
      for (const it of guest) {
        const payload = {
          productId: String(it.productId || it.id || it._id),
          title: it.title,
          price: Number(it.price || it.amount || 0),
          img: it.img,
          quantity: Number(it.quantity || 1),
          size: it.size,
        };
        await axiosInstance.post("/cart/add", payload);
      }
      clearGuestCart();
    } catch (err) {
      console.warn("Failed merging guest cart:", err.response?.data || err);
    }
  };

  // ADD TO CART
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    const productId = resolveProductId(product);

    if (!productId) {
      console.error("Add to cart failed: product ID missing", product);
      return false;
    }

    if (!isValidToken(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // If not authenticated, save to guest cart and show login modal
      try {
        const guest = getGuestCart();
        guest.push({
          productId: String(productId),
          title: product.title,
          price: Number(product.price) || 0,
          img: product.img,
          quantity: Number(product.quantity) || 1,
          size: product.size,
        });
        saveGuestCart(guest);
        setCart(guest.map(normalizeItem));
        setShowLoginModal(true);
        return false; // return false so UI can also prompt login if needed
      } catch (e) {
        console.error("Guest cart save failed:", e);
        return false;
      }
    }

    try {
      const payload = {
        productId: String(productId),
        title: product.title,
        price: Number(product.price),
        img: product.img,
        quantity: Number(product.quantity) || 1,
        size: product.size,
      };

      const res = await axiosInstance.post("/cart/add", payload);
      const items = res.data.items || [];
      setCart(items.map(normalizeItem));
      return true;
    } catch (err) {
      console.error("❌ Add to cart failed:", err.response?.data || err.message);
      return false;
    }
  };

  // REMOVE
  const removeFromCart = async (id, size) => {
    const token = localStorage.getItem("token");
    if (!isValidToken(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setShowLoginModal(true);
      return false;
    }

    try {
      const targetId = String(id || "").trim();
      if (!targetId) {
        return false;
      }

      const res = await axiosInstance.delete(`/cart/${targetId}`, {
        params: { size: size || "" },
      });

      const nextItems = (res.data?.items || []).map(normalizeItem);
      setCart(nextItems);
      return true;
    } catch (err) {
      console.error("Remove error:", err.response?.data || err);
      return false;
    }
  };

  // CLEAR
  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (!isValidToken(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setShowLoginModal(true);
      return false;
    }

    try {
      await axiosInstance.delete("/cart/clear");
      setCart([]);
      return true;
    } catch (err) {
      console.error("Clear error:", err.response?.data || err);
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, showLoginModal, setShowLoginModal }}
    >
      {children}
    </CartContext.Provider>
  );
};
