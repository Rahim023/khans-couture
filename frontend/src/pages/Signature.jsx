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
      <section id="carousel" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-fancy text-brand-navy mb-6">
            Signature Pieces
          </h3>

          <div className="relative">
            <div className="flex items-center justify-center gap-6">
              <button onClick={prev} className="p-3 rounded-full bg-black/5 hover:bg-black/10">
                <ChevronLeft />
              </button>

              <div className="w-[780px] max-w-full flex items-center justify-center">
                <div className="relative w-full h-[520px]">
                  {products.map((p, idx) => {
                    const offset =
                      (idx - centerIndex + products.length) % products.length;
                    const isCenter = offset === 0;

                    const posClass =
                      offset === 0
                        ? "translate-x-0 z-20 scale-100"
                        : offset === 1
                        ? "translate-x-48 z-10 scale-95 opacity-80"
                        : offset === products.length - 1
                        ? "-translate-x-48 z-10 scale-95 opacity-80"
                        : "translate-x-96 z-0 scale-90 opacity-60";

                    return (
                      <motion.div
                        key={p._id || p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className={`absolute left-0 right-0 mx-auto w-[70%] md:w-[62%] rounded-3xl overflow-hidden shadow-2xl bg-white ${posClass}`}
                        style={{
                          transition:
                            "transform 0.6s ease, opacity 0.6s ease",
                        }}
                      >
                        <img
                          src={p.images?.[0] || "https://picsum.photos/900/900?random=11"}
                          className={`w-full h-[360px] object-cover ${
                            isCenter ? "" : "filter grayscale-10"
                          }`}
                        />
                        <div className="p-6 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-2xl font-semibold text-brand-navy">
                                {p.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {p.tagline}
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                Limited
                              </div>
                              <button
                                onClick={() => navigate(`/signature/${p.slug || p._id || p.id}`)}
                                className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white"
                              >
                                View Piece
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <button onClick={next} className="p-3 rounded-full bg-black/5 hover:bg-black/10">
                <ChevronRight />
              </button>
            </div>
          </div>
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

          <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:grid-rows-[280px_280px]">
            {macroShots.length >= 4 ? (
              <>
                <div className="group relative overflow-hidden rounded-[28px] shadow-xl md:col-span-7 md:row-span-2">
                  <img src={macroShots[0]} className="h-full min-h-[420px] w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <span className="absolute bottom-6 left-6 text-xs font-bold uppercase tracking-[0.25em] text-white">Crafted finish</span>
                </div>

                <div className="group relative overflow-hidden rounded-[28px] shadow-xl md:col-span-5">
                  <img src={macroShots[1]} className="h-full min-h-[280px] w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>

                <div className="group relative overflow-hidden rounded-[28px] shadow-xl md:col-span-5">
                  <img src={macroShots[2]} className="h-full min-h-[280px] w-full object-cover transition duration-700 group-hover:scale-105" />
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