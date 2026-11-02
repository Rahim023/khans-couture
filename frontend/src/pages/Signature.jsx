// src/pages/SignatureSeries.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import LoginGuard from "../components/LoginGuard";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import Footer from "../components/Footer";

export default function SignatureSeries() {
  const [products, setProducts] = useState([]);
  const [macroShots, setMacroShots] = useState([]);
  const [spotlight, setSpotlight] = useState([]);
  const [heroImg, setHeroImg] = useState("");
  const [splitLeft, setSplitLeft] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const { addToCart, showLoginModal: cartLoginModal, setShowLoginModal: setCartLoginModal } = useCart();
  const { addToWishlist, showLoginModal: wishlistLoginModal, setShowLoginModal: setWishlistLoginModal } = useWishlist();

  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : "https://khans-couture.onrender.com";

  // Sync login modal state from contexts
  useEffect(() => {
    if (cartLoginModal || wishlistLoginModal) {
      setShowLoginModal(true);
      setCartLoginModal(false);
      setWishlistLoginModal(false);
    }
  }, [cartLoginModal, wishlistLoginModal]);

  // fetch from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/signatures`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);

        if (Array.isArray(data) && data.length > 0) {
          setHeroImg(data[0].images?.[0] || "");
          setSplitLeft(data[1]?.images?.[0] || data[0].images?.[0] || "");

          setSpotlight(
            data.slice(0, 3).map((p) => ({
              id: p._id || p.id,
              title: p.title,
              img: p.images?.[0] || ""
            }))
          );

          // macro shots from different products (DB)
          const collected = [];
          data.forEach((item) => {
            if (Array.isArray(item.macroShots) && item.macroShots.length) {
              collected.push(...item.macroShots);
            }
          });
          setMacroShots(collected.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error("Failed to load signatures", err);
      });
  }, []);

  // --------------------
  // Carousel
  // --------------------
  const [centerIndex, setCenterIndex] = useState(0);
  const carouselTimer = useRef(null);

  useEffect(() => {
    if (products.length > 0) {
      carouselTimer.current = setInterval(() => {
        setCenterIndex((i) => (i + 1) % products.length);
      }, 4000);
      return () => clearInterval(carouselTimer.current);
    }
  }, [products.length]);

  const prev = () => setCenterIndex((i) => (i - 1 + products.length) % products.length);
  const next = () => setCenterIndex((i) => (i + 1) % products.length);

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />

      {/* HERO */}
      <section className="relative h-[78vh] md:h-[85vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "linear" }}
          src={heroImg || "https://picsum.photos/1600/900?random=101"}
          className="absolute inset-0 w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto text-center pt-28"
        >
          <h1 className="text-5xl md:text-7xl font-fancy text-brand-ivory tracking-tight drop-shadow-lg">
            Signature Series
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-ivory/90 max-w-2xl mx-auto font-inter">
            Where craft meets identity — a limited collection celebrating time-honored techniques.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="#explore"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-brand-gold text-brand-navy font-semibold shadow-md"
            >
              Explore Collection <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* SPLIT REVEAL */}
      <section id="explore" className="px-6 md:px-20 py-16 bg-brand-ivory">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl h-[520px]"
          >
            <img
              src={splitLeft || "https://picsum.photos/900/1400?random=102"}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-fancy text-brand-navy">
              The Signature Philosophy
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              The Signature Series represents the peak of our craft.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl shadow-md">
                <h4 className="font-semibold text-brand-navy">Limited Editions</h4>
                <p className="text-sm text-gray-600 mt-2">
                  Small-batch luxury fashion pieces.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-md">
                <h4 className="font-semibold text-brand-navy">Made to Last</h4>
                <p className="text-sm text-gray-600 mt-2">
                  Timeless craftsmanship + premium fabric.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate("/signature-collection")}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-brand-navy text-brand-ivory font-medium"
              >
                View Signature Pieces <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CAROUSEL */}
      <section id="carousel" className="overflow-hidden bg-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h3 className="text-[34px] leading-tight font-fancy text-brand-navy mb-3 sm:text-4xl md:mb-6">
            Signature Pieces
          </h3>
          <p className="mx-auto mb-7 max-w-xl text-sm leading-6 text-brand-charcoal/60 sm:text-base md:mb-10">
            Discover limited pieces shaped by detail, texture and exceptional craftsmanship.
          </p>

          {products.length > 0 ? (
            <div className="relative mx-auto flex max-w-[650px] items-center justify-center gap-2 sm:gap-4">
              <button
                type="button"
                aria-label="Previous signature piece"
                onClick={prev}
                className="absolute left-0 z-30 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e2d5c4] bg-white shadow-[0_10px_25px_rgba(50,35,25,.16)] text-brand-navy transition hover:bg-brand-gold sm:-left-16 sm:h-12 sm:w-12"
              >
                <ChevronLeft size={20} />
              </button>

              <motion.div
                key={products[centerIndex]?._id || products[centerIndex]?.id || centerIndex}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mx-auto w-[calc(100%-52px)] max-w-[500px] overflow-hidden rounded-[22px] border border-[#eadfce] bg-white text-left shadow-[0_18px_55px_rgba(55,38,24,.12)] sm:w-[calc(100%-130px)] sm:max-w-[520px] sm:rounded-[28px]"
              >
                <div className="relative h-[390px] overflow-hidden bg-brand-mist sm:h-[460px] md:h-[520px]">
                  <img
                    src={products[centerIndex]?.images?.[0] || "https://picsum.photos/900/900?random=11"}
                    alt={products[centerIndex]?.title || "Signature piece"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-[#2b1711]/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    Limited edition
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div>
                    <h4 className="line-clamp-2 text-xl font-semibold leading-tight text-brand-navy sm:text-2xl">
                      {products[centerIndex]?.title}
                    </h4>
                    <p className="mt-2 min-h-[40px] text-sm leading-5 text-gray-600">
                      {products[centerIndex]?.tagline || "A signature piece crafted with exceptional attention to detail."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/signature/${products[centerIndex]?.slug || products[centerIndex]?._id || products[centerIndex]?.id}`)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-5 py-3.5 text-sm font-bold text-brand-ivory shadow-md transition hover:bg-brand-gold hover:text-brand-navy sm:w-auto"
                  >
                    View Piece <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>

              <button
                type="button"
                aria-label="Next signature piece"
                onClick={next}
                className="absolute right-0 z-30 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e2d5c4] bg-white shadow-[0_10px_25px_rgba(50,35,25,.16)] text-brand-navy transition hover:bg-brand-gold sm:-right-16 sm:h-12 sm:w-12"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="mx-auto flex min-h-[420px] max-w-[500px] items-center justify-center rounded-[28px] bg-brand-mist text-sm text-brand-charcoal/60">
              Loading signature pieces...
            </div>
          )}
        </div>
      </section>

      {/* MACRO SHOTS */}
      <section className="py-20 bg-brand-mist">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a18457]">A closer look</p>
            <h3 className="mt-3 font-serifFancy text-4xl font-bold text-brand-navy md:text-5xl">Details Up Close</h3>
            <p className="mt-4 leading-7 text-brand-charcoal/65">Study the embroidery, texture and delicate finishing that make every signature piece unmistakably yours.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-12 md:grid-rows-[280px_280px]">
            {macroShots.length >= 4 ? (
              <>
                <div className="group relative col-span-2 h-[420px] overflow-hidden rounded-[22px] shadow-xl sm:h-[520px] md:col-span-7 md:row-span-2 md:h-auto md:min-h-[420px] md:rounded-[28px]">
                  <img src={macroShots[0]} alt="Signature detail: crafted finish" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <span className="absolute bottom-5 left-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white sm:bottom-6 sm:left-6 sm:text-xs sm:tracking-[0.25em]">Crafted finish</span>
                </div>

                <div className="group relative h-[210px] overflow-hidden rounded-[18px] shadow-lg sm:h-[280px] md:col-span-5 md:h-full md:min-h-[280px] md:rounded-[28px] md:shadow-xl">
                  <img src={macroShots[1]} alt="Signature detail one" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>

                <div className="group relative h-[210px] overflow-hidden rounded-[18px] shadow-lg sm:h-[280px] md:col-span-5 md:h-full md:min-h-[280px] md:rounded-[28px] md:shadow-xl">
                  <img src={macroShots[2]} alt="Signature detail two" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
              </>
            ) : (
              <p className="text-gray-500 col-span-6">Loading details...</p>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <LoginGuard
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}