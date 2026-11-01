// src/pages/Wedding.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/Header";
import LoginGuard from "../components/LoginGuard";
import Footer from "../components/Footer";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useCurrency } from "../context/CurrencyContext";
import { Heart, ShoppingBag, Eye, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PopupModal from "../components/Popupmodal";

export default function Wedding() {
  const [weddingProducts, setWeddingProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [currentHero, setCurrentHero] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const BASE_URL = "http://localhost:5000/api";
  const exploreRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { addToCart, showLoginModal: cartLoginModal, setShowLoginModal: setCartLoginModal } = useCart();
  const { wishlist, addToWishlist, showLoginModal: wishlistLoginModal, setShowLoginModal: setWishlistLoginModal } = useWishlist();
  const { convertPrice, country } = useCurrency();

  const currencySymbol =
    country === "Canada" ? "CA$" : country === "USA" ? "US$" : "₹";

  const formatFilterPrice = (inrPrice) =>
    new Intl.NumberFormat(
      country === "India" ? "en-IN" : "en-CA",
      {
        style: "currency",
        currency: country === "Canada" ? "CAD" : country === "USA" ? "USD" : "INR",
        maximumFractionDigits: 0,
      }
    ).format(Number(convertPrice(inrPrice)));

  // Sync login modal from contexts
  useEffect(() => {
    if (cartLoginModal || wishlistLoginModal) {
      setShowLoginModal(true);
      setCartLoginModal(false);
      setWishlistLoginModal(false);
    }
  }, [cartLoginModal, wishlistLoginModal, setCartLoginModal, setWishlistLoginModal]);

  const heroImages = [
    "https://res.cloudinary.com/divypkla0/image/upload/v1780204546/lhnga_lurrsq.jpg",
    "https://res.cloudinary.com/divypkla0/image/upload/v1780204673/lhnga2_ohuexo.png",
  ];

  // Hero auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Fetch wedding products
  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/products`);
        const onlyWedding = res.data.filter((p) => p.Wedding === true);
        setWeddingProducts(onlyWedding);

        const queryFromUrl = new URLSearchParams(location.search).get("search");
        if (queryFromUrl) {
          setSearchQuery(queryFromUrl);
          const matches = onlyWedding.filter((product) =>
            `${product.title || ""} ${product.description || ""}`
              .toLowerCase()
              .includes(queryFromUrl.toLowerCase())
          );
          setFilteredProducts(matches);
          window.setTimeout(() => {
            document
              .getElementById(`wedding-product-${matches[0]?._id}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 500);
        } else {
          setFilteredProducts(onlyWedding);
        }
      } catch (err) {
        console.error("Error fetching wedding products:", err);
      }
    };
    fetchWedding();
  }, [location.search]);

  // Filter logic
  const applyFilter = (
    query = searchQuery,
    category = categoryFilter,
    price = priceFilter,
    sorting = sortBy
  ) => {
    let list = weddingProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
    );

    if (category !== "All") {
      const catLower = category.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(catLower) ||
          p.description?.toLowerCase().includes(catLower) ||
          p.category?.toLowerCase().includes(catLower)
      );
    }

    list = list.filter((product) => {
      const priceValue = Number(product.price) || 0;
      const convertedPrice = Number(convertPrice(priceValue));
      const lowerLimit = Number(convertPrice(25000));
      const upperLimit = Number(convertPrice(50000));

      if (price === "under25000") return convertedPrice < lowerLimit;
      if (price === "25000to50000")
        return convertedPrice >= lowerLimit && convertedPrice <= upperLimit;
      if (price === "above50000") return convertedPrice > upperLimit;
      return true;
    });

    if (sorting === "priceLow")
      list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sorting === "priceHigh")
      list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sorting === "name")
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));

    setFilteredProducts(list);
  };

  useEffect(() => {
    applyFilter(searchQuery, categoryFilter, priceFilter, sortBy);
  }, [country]);

  const handleSearchSubmit = () => {
    applyFilter(searchQuery, categoryFilter);
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let targetId = null;
    if (normalizedQuery) {
      const exactMatch = filteredProducts.find(
        (product) =>
          product.title?.trim().toLowerCase() === normalizedQuery
      );
      const searchedProduct =
        exactMatch ||
        filteredProducts.find((product) =>
          product.title?.toLowerCase().includes(normalizedQuery)
        );
      targetId = searchedProduct?._id;
    }

    window.setTimeout(() => {
      const target = targetId
        ? document.getElementById(`wedding-product-${targetId}`)
        : exploreRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const categories = [
    "All",
    "Lehenga",
    "Sherwani",
    "Saree",
    "Jewellery",
    "Groom",
    "Bridal",
  ];

  const isInWishlist = (id) =>
    wishlist?.some((w) => w.id === id || w._id === id || w.productId === id);

  // Add to cart
  const handleAddToCart = (product) => {
    navigate(`/product/${product._id}`);
  };

  // Add to wishlist
  const handleAddToWishlist = (product) => {
    if (isInWishlist(product._id)) return;
    addToWishlist({ id: product._id, ...product }).then((result) => {
      if (!result) {
        if (!localStorage.getItem("token")) setShowLoginModal(true);
        return;
      }
      setPopupMessage("Item added to wishlist");
      setShowPopup(true);
    });
  };

  // Featured products
  const featuredWedding = useMemo(() => {
    const trending = weddingProducts.filter((p) => p.trending);
    return (trending.length ? trending : weddingProducts).slice(0, 4);
  }, [weddingProducts]);

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />

      {/* ================= HERO ================= */}
      <div className="relative w-full h-[68vh] md:h-[82vh] overflow-hidden bg-[#1a0c0c]">
        {heroImages.map((img, idx) => (
          <motion.img
            key={idx}
            src={img}
            alt={idx === 0 ? "Wedding couture lehenga" : "Bridal couture collection"}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentHero === idx ? 1 : 0,
              scale: currentHero === idx ? 1.06 : 1,
              x: currentHero === idx && idx === 1 ? "-1%" : "0%",
            }}
            transition={{
              opacity: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
              scale: { duration: 6, ease: "linear" },
              x: { duration: 6, ease: "linear" },
            }}
          />
        ))}

        {/* Cinematic overlays */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3 }}
          className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/60 flex flex-col items-center justify-center px-5 text-center"
        >
          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="text-white text-4xl sm:text-5xl md:text-7xl font-bold tracking-[0.02em] leading-tight drop-shadow-2xl"
          >
            Wedding Couture Collection
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-4 text-lg sm:text-xl md:text-2xl text-[#f8ead5] italic tracking-wide"
          >
            Luxury. Heritage. Elegance. ✨
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              exploreRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-8 px-8 sm:px-10 py-3 rounded-full bg-[#d5b98c] text-[#590f0f] font-semibold shadow-2xl border border-white/30
              hover:bg-[#fff8ef] transition-all text-base sm:text-lg"
          >
            Explore Collection
          </motion.button>
        </motion.div>

        {/* Hero slide indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Show wedding hero image ${idx + 1}`}
              onClick={() => setCurrentHero(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentHero === idx
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ================= SEARCH SECTION ================= */}
      <section className="px-4 sm:px-6 lg:px-20 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto w-full max-w-7xl"
        >
          <div className="rounded-[28px] border border-[#590f0f]/10 bg-white/95 p-4 sm:p-5 shadow-[0_18px_45px_rgba(89,15,15,0.08)] backdrop-blur-xl">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#590f0f]/55" size={20} />
              <input
                type="search"
                placeholder="Search lehengas, sherwanis, sarees..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  applyFilter(value, categoryFilter, priceFilter, sortBy);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                className="w-full rounded-2xl border border-[#590f0f]/12 bg-[#fcfaf8] py-3.5 pl-12 pr-12 text-[15px] text-[#4a2828] outline-none transition focus:border-[#c19a6b] focus:ring-4 focus:ring-[#c19a6b]/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    applyFilter("", categoryFilter, priceFilter, sortBy);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#590f0f]/60 hover:bg-[#590f0f]/8 hover:text-[#590f0f]"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* Category filters */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <div className="mr-1 flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] text-[#590f0f]/60">
                <SlidersHorizontal size={16} />
                Style
              </div>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    applyFilter(searchQuery, cat, priceFilter, sortBy);
                  }}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    categoryFilter === cat
                      ? "border-[#590f0f] bg-[#590f0f] text-white shadow-[0_8px_18px_rgba(89,15,15,0.16)]"
                      : "border-[#590f0f]/12 bg-white text-[#590f0f] hover:border-[#c19a6b] hover:bg-[#fbf7f0]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Price and sort controls */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <label className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[1.2px] text-[#590f0f]/45">
                  Price
                </span>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#590f0f]/50" size={16} />
                <select
                  value={priceFilter}
                  onChange={(e) => {
                    setPriceFilter(e.target.value);
                    applyFilter(searchQuery, categoryFilter, e.target.value, sortBy);
                  }}
                  className="w-full appearance-none rounded-xl border border-[#590f0f]/12 bg-[#fcfaf8] py-3 pl-16 pr-10 text-sm font-semibold text-[#590f0f] outline-none focus:border-[#c19a6b]"
                >
                  <option value="All">All prices</option>
                  <option value="under25000">
                    Under {formatFilterPrice(25000)}
                  </option>
                  <option value="25000to50000">
                    {formatFilterPrice(25000)} - {formatFilterPrice(50000)}
                  </option>
                  <option value="above50000">
                    Above {formatFilterPrice(50000)}
                  </option>
                </select>
              </label>

              <label className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[1.2px] text-[#590f0f]/45">
                  Sort
                </span>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#590f0f]/50" size={16} />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    applyFilter(searchQuery, categoryFilter, priceFilter, e.target.value);
                  }}
                  className="w-full appearance-none rounded-xl border border-[#590f0f]/12 bg-[#fcfaf8] py-3 pl-14 pr-10 text-sm font-semibold text-[#590f0f] outline-none focus:border-[#c19a6b]"
                >
                  <option value="featured">Featured</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setPriceFilter("All");
                  setSortBy("featured");
                  setFilteredProducts(weddingProducts);
                }}
                className="rounded-xl border border-[#590f0f]/12 px-4 py-3 text-sm font-semibold text-[#590f0f] transition hover:border-[#590f0f] hover:bg-[#590f0f] hover:text-white"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1 text-sm text-[#590f0f]/65">
            <span>
              <strong className="text-[#590f0f]">{filteredProducts.length}</strong>{" "}
              {filteredProducts.length === 1 ? "piece" : "pieces"} found
            </span>
            {(categoryFilter !== "All" || priceFilter !== "All" || searchQuery) && (
              <span className="hidden sm:block">Refined for you</span>
            )}
          </div>
        </motion.div>
      </section>

      {/* ================= FEATURED STACKED ================= */}
      {featuredWedding.length > 0 && (
        <section className="py-10 px-6 md:px-20">
          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-5xl font-bold text-brand-navy"
          >
            Featured Wedding Styles
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center text-lg text-brand-charcoal/80 mb-10"
          >
            Curated masterpieces for your special moments ✨
          </motion.p>

          <div className="relative flex items-center justify-center h-[420px]">
            <div className="flex space-x-[-40px] md:space-x-[-60px]">
              {featuredWedding.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  whileHover={{
                    scale: 1.08,
                    rotate: index % 2 === 0 ? 2 : -2,
                  }}
                  className="w-[230px] md:w-[260px] h-[340px] rounded-3xl bg-white
                    shadow-xl overflow-hidden cursor-pointer border border-brand-gold/50"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-[240px] object-cover"
                  />
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-brand-navy">{item.title}</h3>
                    <p className="text-brand-gold font-bold mt-1">
                      {currencySymbol}
                      {convertPrice(item.price)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= ALL WEDDING PRODUCTS ================= */}
      <section ref={exploreRef} className="py-16 px-6 md:px-20">
        <motion.h2
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-5xl font-bold text-brand-navy mb-10"
        >
          Explore Wedding Collection
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10"
        >
          {filteredProducts.length === 0 && (
            <div className="col-span-full rounded-3xl border border-[#590f0f]/10 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-xl font-semibold text-[#590f0f]">No wedding pieces match these filters</p>
              <p className="mt-2 text-sm text-[#590f0f]/60">Try another category, price range, or search term.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setPriceFilter("All");
                  setSortBy("featured");
                  setFilteredProducts(weddingProducts);
                }}
                className="mt-5 rounded-full bg-[#590f0f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7a2020]"
              >
                Reset filters
              </button>
            </div>
          )}
          {filteredProducts.map((item, index) => (
            <motion.div
              key={item._id}
              id={`wedding-product-${item._id}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.6 }}
              className="group bg-white rounded-3xl shadow-md border border-gray-200 
                hover:border-brand-gold/70 hover:shadow-xl overflow-hidden flex flex-col"
            >
              <div className="relative overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                  src={item.img}
                  className="w-full h-72 object-cover"
                />

                {/* Wishlist Icon */}
                <button
                  onClick={() => handleAddToWishlist(item)}
                  className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-md 
                    transition ${
                      isInWishlist(item._id)
                        ? "text-red-600"
                        : "text-brand-navy hover:text-brand-gold"
                    }`}
                >
                  <Heart size={18} />
                </button>

                {/* View Btn */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(`/product/${item._id}`)}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 
                    rounded-full bg-brand-navy text-white text-xs md:text-sm 
                    opacity-0 group-hover:opacity-100 transition-all shadow-md"
                >
                  <Eye size={16} />
                </motion.button>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-brand-navy line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-brand-gold font-bold mt-3 text-xl">
                  {currencySymbol}
                  {convertPrice(item.price)}
                </p>

                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex-1 bg-brand-gold text-brand-navy py-2 rounded-full font-semibold hover:bg-brand-navy hover:text-white transition shadow"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingBag size={16} className="inline-block mr-2" />
                    Add to Cart
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full border border-brand-gold text-brand-navy hover:bg-brand-gold hover:text-white transition"
                    onClick={() => navigate(`/product/${item._id}`)}
                  >
                    View
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />

      <LoginGuard
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <PopupModal
        isOpen={showPopup}
        message={popupMessage}
        closeModal={() => setShowPopup(false)}
        redirectTo="/wishlist"
      />
    </div>
  );
}
