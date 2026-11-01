// src/pages/SignatureProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import PopupModal from "../components/Popupmodal";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { ArrowLeft, Heart, ShoppingBag, Zap } from "lucide-react";
import Footer from "../components/Footer";
import { useCurrency } from "../context/CurrencyContext";

export default function SignatureProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { convertPrice, country } = useCurrency();

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/signatures/slug/${slug}`
        );

        if (!res.ok) return console.error("Signature fetch failed");

        const data = await res.json();

        setProduct(data);
        setMainImage(data.images?.[0] || data.img || "");
        setSelectedSize(data.sizes?.[0] || "");
      } catch (err) {
        console.error("Error loading signature product", err);
      }
    }

    loadProduct();
  }, [slug]);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  const openPopup = (msg, redirect) => {
    setPopupMessage(msg);
    setRedirectTo(redirect);
    setShowPopup(true);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      title: product.title,
      price: product.price,
      img: mainImage,
      quantity: qty,
      size: selectedSize,
    });

    openPopup("Item added to cart", "/cart");
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      productId: product._id,
      title: product.title,
      price: product.price,
      img: mainImage,
      quantity: qty,
      size: selectedSize,
    });

    openPopup("Item added to wishlist", "/wishlist");
  };

  const handleCheckout = () => {
    addToCart({
      productId: product._id,
      title: product.title,
      price: product.price,
      img: mainImage,
      quantity: qty,
      size: selectedSize,
    });

    navigate("/checkout");
  };

  const currencySymbol =
    country === "Canada" ? "CA$" : country === "USA" ? "US$" : "₹";

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />

      <div className="px-6 md:px-20 py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-gold transition-colors font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <section className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(380px,.82fr)] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] border border-brand-gold/20 bg-white p-3 shadow-[0_25px_60px_rgba(28,20,47,0.12)] sm:p-4"
          >
            <motion.img
              key={mainImage}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              src={mainImage}
              alt={product.title}
              className="h-[520px] w-full rounded-[24px] bg-brand-ivory object-cover sm:h-[620px] lg:h-[680px]"
            />

            <div className="flex gap-3 mt-5 overflow-x-auto pb-1">
              {(product.images?.length ? product.images : [product.img]).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`flex-shrink-0 h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden border-2 transition ${
                    mainImage === img ? "border-brand-gold shadow-md shadow-brand-gold/20" : "border-brand-gold/20"
                  }`}
                >
                  <img src={img} alt={`${product.title} shot ${i + 1}`} className="w-full h-full object-cover bg-white" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-7 rounded-[30px] bg-gradient-to-b from-white to-brand-ivory p-6 md:p-8 shadow-[0_20px_50px_rgba(20,20,30,0.08)] border border-brand-gold/20"
          >
            <div>
              <span className="inline-flex items-center rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy">
                Signature Edit
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-serifFancy font-bold text-brand-navy leading-tight">
                {product.title}
              </h1>
              <div className="mt-4 h-1 w-24 bg-gradient-to-r from-brand-gold to-brand-purple rounded-full"></div>
            </div>

            <div className="bg-gradient-to-r from-brand-gold/18 to-brand-purple/15 p-6 rounded-2xl border border-brand-gold/25">
              <p className="text-sm uppercase tracking-[0.2em] text-brand-charcoal/70">Price</p>
              <p className="mt-3 text-4xl font-bold text-brand-gold">
                {currencySymbol} {convertPrice(product.price)}
              </p>
            </div>

            <p className="text-lg text-brand-charcoal leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 border border-brand-gold/15 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-brand-charcoal/60">Stock</p>
                <p className="mt-2 text-2xl font-bold text-brand-navy">{product.stock}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-brand-gold/15 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-brand-charcoal/60">Rating</p>
                <p className="mt-2 text-2xl font-bold text-brand-gold">⭐ {product.rating}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-brand-gold/15 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-brand-charcoal/60">Reviews</p>
                <p className="mt-2 text-2xl font-bold text-brand-navy">{product.reviewsCount || 0}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-brand-navy mb-3 block">Select Size</label>
              <div className="flex gap-3 flex-wrap">
                {(product.sizes || ["S", "M", "L"]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-5 py-3 rounded-xl font-bold border-2 transition-all ${
                      selectedSize === s
                        ? "bg-brand-gold text-brand-navy border-brand-gold shadow-lg shadow-brand-gold/30"
                        : "bg-white text-brand-navy border-brand-gold/30 hover:border-brand-gold"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-brand-navy mb-3 block">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 rounded-full bg-brand-navy text-brand-ivory hover:bg-brand-purple transition font-bold"
                >
                  −
                </button>

                <div className="px-8 py-3 bg-white border-2 border-brand-gold rounded-full text-center text-2xl font-bold text-brand-navy">
                  {qty}
                </div>

                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-4 py-3 rounded-full bg-brand-navy text-brand-ivory hover:bg-brand-purple transition font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="px-6 py-4 rounded-full bg-brand-navy text-brand-gold font-bold hover:shadow-lg hover:shadow-brand-navy/30 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToWishlist}
                  className="flex-1 px-4 py-4 rounded-full border-2 border-brand-gold text-brand-navy hover:bg-brand-gold hover:text-white transition font-bold flex items-center justify-center gap-2"
                >
                  <Heart size={20} /> Wishlist
                </button>

                <button
                  onClick={handleCheckout}
                  className="flex-1 px-4 py-4 rounded-full bg-brand-gold text-brand-navy font-bold hover:shadow-lg hover:shadow-brand-gold/50 transition flex items-center justify-center gap-2"
                >
                  <Zap size={20} /> Checkout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PopupModal
        isOpen={showPopup}
        message={popupMessage}
        closeModal={() => setShowPopup(false)}
        redirectTo={redirectTo}
      />

      <Footer />
    </div>
  );
}
