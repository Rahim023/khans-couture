import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../pages/WishlistContext";
import PopupModal from "./Popupmodal";
import { useCurrency } from "../context/CurrencyContext";
import { Heart, ShoppingBag, Eye } from "lucide-react";


export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { wishlist, addToWishlist } = useWishlist();

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [redirectTo, setRedirectTo] = useState("/");

  const productId = product?._id;
  const isInWishlist = wishlist?.some((item) =>
    item.id === productId || item._id === productId || item.productId === productId
  );
  const { currency, convertPrice } = useCurrency();


  const openPopup = (msg, redirect) => {
    setPopupMessage(msg);
    setRedirectTo(redirect);
    setShowPopup(true);
  };

  const handleNavigation = () => {
    if (!productId) return console.warn("❌ No product ID");
    navigate(`/product/${productId}`);
  };

  const handleAddToWishlist = async (event) => {
    event.stopPropagation();
    if (isInWishlist) return;
    const result = await addToWishlist({ id: productId, ...product });
    if (result) openPopup("Item added to wishlist", "/wishlist");
  };

  return (
    <>
      {/* PRODUCT CARD */}
      <motion.div
        whileHover={{ y: -4 }}
        className="group bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden cursor-pointer flex flex-col hover:border-brand-gold/70 hover:shadow-xl transition-all"
        onClick={handleNavigation}
      >
        <div className="relative overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5 }}
            src={product.img}
            alt={product.title}
            className="w-full h-72 object-cover"
          />
          <button
            onClick={handleAddToWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-md transition ${
              isInWishlist ? "text-red-600" : "text-brand-navy hover:text-brand-gold"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(event) => { event.stopPropagation(); handleNavigation(); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-brand-navy text-white text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-all shadow-md"
            aria-label="View product"
          >
            <Eye size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-brand-navy line-clamp-2">
            {product.title}
          </h3>
          <p className="text-brand-gold font-bold mt-3 text-xl">
            {currency === "INR" ? "₹" : currency === "CAD" ? "CA$" : "US$"}
            {convertPrice(product.price)}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={(event) => { event.stopPropagation(); handleNavigation(); }}
              className="flex-1 bg-brand-gold text-brand-navy py-2 rounded-full font-semibold hover:bg-brand-navy hover:text-white transition shadow inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
            <button
              onClick={(event) => { event.stopPropagation(); handleNavigation(); }}
              className="px-4 py-2 rounded-full border border-brand-gold text-brand-navy hover:bg-brand-gold hover:text-white transition"
            >
              View
            </button>
          </div>
        </div>
      </motion.div>

      {/* SUCCESS POPUP (only for cart/wishlist buttons elsewhere if used) */}
      <PopupModal
        isOpen={showPopup}
        message={popupMessage}
        closeModal={() => setShowPopup(false)}
        redirectTo={redirectTo}
      />
    </>
  );
}
