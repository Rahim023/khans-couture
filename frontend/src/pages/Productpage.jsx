import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import PopupModal from "../components/Popupmodal";
import LoginGuard from "../components/LoginGuard";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { ArrowLeft, Heart, ShoppingBag, Zap } from "lucide-react";
import Footer from "../components/Footer";

// ⭐ Currency Hook
import { useCurrency } from "../context/CurrencyContext";

export default function ProductPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);

  const { addToCart, showLoginModal: cartLoginModal, setShowLoginModal: setCartLoginModal } = useCart();
  const { addToWishlist, showLoginModal: wishlistLoginModal, setShowLoginModal: setWishlistLoginModal } = useWishlist();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { convertPrice, country } = useCurrency();  // ⭐ Use currency hook

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupTitle, setPopupTitle] = useState("Perfect!");
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    async function loadProduct() {
      try {
        // First try to fetch from products endpoint
        let res = await fetch(`http://localhost:5000/api/products/${id}`);
        let data = null;

        if (res.ok) {
          data = await res.json();
        } else {
          // If not found in products, try signatures endpoint
          res = await fetch(`http://localhost:5000/api/signatures/${id}`);
          if (res.ok) {
            data = await res.json();
          }
        }

        if (!data) {
          console.error("Product not found in either collection");
          return;
        }

        setProduct(data);
        setMainImage(data.img);
        setSelectedSize("");
      } catch (err) {
        console.error("Error loading product", err);
      }
    }
    loadProduct();
  }, [id]);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  const openPopup = (msg, redirect) => {
    setPopupMessage(msg);
    setPopupTitle("Perfect!");
    setRedirectTo(redirect);
    setShowPopup(true);
  };
// ⭐ FINAL ADD TO CART FUNCTION (PASTE)
const handleAddToCart = async () => {
  if (!selectedSize) {
    setPopupMessage("Please select a size before adding this item to your cart.");
    setPopupTitle("Size required");
    setRedirectTo("");
    setShowPopup(true);
    return;
  }
  if (!Number.isInteger(qty) || qty < 1) {
    setPopupMessage("Please select a valid quantity.");
    setPopupTitle("Quantity required");
    setRedirectTo("");
    setShowPopup(true);
    return;
  }
  const productId = product?._id || product?.id || product?.productId;
  const result = await addToCart({
    productId,
    title: product.title,
    price: product.price,
    img: product.img,
    quantity: qty,
    size: selectedSize,
  });

  if (!result) {
    if (!localStorage.getItem("token")) setShowLoginModal(true);
    return;
  }

  openPopup("Item added to cart", "/cart");
};

// ⭐ FINAL ADD TO WISHLIST
const handleAddToWishlist = async () => {
  const productId = product?._id || product?.id || product?.productId;
  const result = await addToWishlist({
    productId,
    title: product.title,
    price: product.price,
    img: product.img,
    quantity: qty,
    size: selectedSize,
  });

  if (!result) {
    if (!localStorage.getItem("token")) setShowLoginModal(true);
    return;
  }

  openPopup("Item added to wishlist", "/wishlist");
};

// ⭐ FINAL PROCEED-TO-CHECKOUT
const handleCheckout = async () => {
  if (!selectedSize) {
    setPopupMessage("Please select a size before continuing to checkout.");
    setPopupTitle("Size required");
    setRedirectTo("");
    setShowPopup(true);
    return;
  }
  if (!Number.isInteger(qty) || qty < 1) {
    setPopupMessage("Please select a valid quantity.");
    setPopupTitle("Quantity required");
    setRedirectTo("");
    setShowPopup(true);
    return;
  }
  const result = await addToCart({
    productId: product?._id || product?.id || product?.productId,
    title: product.title,
    price: product.price,
    img: product.img,
    quantity: qty,
    size: selectedSize,
  });

  if (!result) {
    if (!localStorage.getItem("token")) setShowLoginModal(true);
    return;
  }
  navigate("/checkout");
};

  // ⭐ Currency symbol based on selected country
  const currencySymbol =
    country === "Canada"
      ? "CA$"
      : country === "USA"
      ? "US$"
      : "₹";

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />

      <div className="px-6 md:px-20 py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-gold transition-colors font-semibold"
        >
          <ArrowLeft size={20} /> Back to Shopping
        </button>
      </div>

      <section className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-12 py-8">
        
        {/* IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.img
            key={mainImage}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            src={mainImage}
            alt={product.title}
            className="w-full h-[600px] object-contain rounded-3xl shadow-2xl bg-white p-6 border-2 border-brand-gold/20"
          />
        </motion.div>

        {/* DETAILS SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          {/* Title */}
          <div>
            <h1 className="text-4xl md:text-5xl font-serifFancy font-bold text-brand-navy mb-2">{product.title}</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-brand-gold to-brand-purple rounded-full"></div>
          </div>

          {/* ⭐ CONVERTED PRICE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-brand-gold/20 to-brand-purple/20 p-6 rounded-2xl border border-brand-gold/30"
          >
            <p className="text-sm text-brand-charcoal/70 mb-2">Price</p>
            <p className="text-4xl font-bold text-brand-gold">
              {currencySymbol} {convertPrice(product.price)}
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-brand-charcoal leading-relaxed"
          >
            {product.description}
          </motion.p>

          {/* STOCK + RATING */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="bg-white rounded-xl p-4 border border-brand-gold/20 text-center">
              <p className="text-xs text-brand-charcoal/70 mb-1">Stock</p>
              <p className="text-2xl font-bold text-brand-navy">{product.stock}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-brand-gold/20 text-center">
              <p className="text-xs text-brand-charcoal/70 mb-1">Rating</p>
              <p className="text-2xl font-bold text-brand-gold">⭐ {product.rating}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-brand-gold/20 text-center">
              <p className="text-xs text-brand-charcoal/70 mb-1">Reviews</p>
              <p className="text-2xl font-bold text-brand-navy">{product.reviewsCount || 0}</p>
            </div>
          </motion.div>

          {/* SIZE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="text-sm font-semibold text-brand-navy mb-3 block">Select Size</label>
            <div className="flex gap-3 flex-wrap">
              {(product.sizes || ["S", "M", "L", "XL"]).map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSize(s)}
                  className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 border-2 ${
                    selectedSize === s
                      ? "bg-brand-gold text-brand-navy border-brand-gold shadow-lg shadow-brand-gold/30"
                      : "bg-white text-brand-navy border-brand-gold/30 hover:border-brand-gold"
                  }`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* QUANTITY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="text-sm font-semibold text-brand-navy mb-3 block">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3 rounded-full bg-brand-navy text-brand-ivory hover:bg-brand-purple transition font-bold"
              >
                −
              </button>
              <div className="px-8 py-3 bg-white rounded-full border-2 border-brand-gold text-center font-bold text-2xl text-brand-navy min-w-20">{qty}</div>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-3 rounded-full bg-brand-navy text-brand-ivory hover:bg-brand-purple transition font-bold"
              >
                +
              </button>
            </div>
          </motion.div>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3 pt-4"
          >
            <button
              onClick={handleAddToCart}
              className="px-6 py-4 rounded-full bg-brand-navy text-brand-gold font-bold hover:shadow-lg hover:shadow-brand-navy/30 transition flex items-center justify-center gap-2 group"
            >
              <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
              Add to Cart
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleAddToWishlist}
                className="flex-1 px-4 py-4 rounded-full border-2 border-brand-gold text-brand-navy hover:bg-brand-gold hover:text-white transition font-bold flex items-center justify-center gap-2 group"
              >
                <Heart size={20} className="group-hover:fill-current transition-all" />
                Wishlist
              </button>

              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-4 rounded-full bg-brand-gold text-brand-navy font-bold hover:shadow-lg hover:shadow-brand-gold/50 transition flex items-center justify-center gap-2 group"
              >
                <Zap size={20} className="group-hover:rotate-12 transition-transform" />
                Checkout
              </button>
            </div>
          </motion.div>

        </motion.div>
      </section>

      <PopupModal
        isOpen={showPopup}
        title={popupTitle}
        message={popupMessage}
        closeModal={() => setShowPopup(false)}
        redirectTo={redirectTo}
      />

      <LoginGuard
        isOpen={showLoginModal || cartLoginModal || wishlistLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          if (setCartLoginModal) setCartLoginModal(false);
          if (setWishlistLoginModal) setWishlistLoginModal(false);
        }}
      />

            <Footer />
    </div>
  );
}
