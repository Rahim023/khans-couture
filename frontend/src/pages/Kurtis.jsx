import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, useAnimation, useInView } from "framer-motion";
import { LucideSearch, Filter } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginGuard from "../components/LoginGuard";
import ProductCard from "../components/ProductCard";
import BlurText from "../components/BlurText";
import ShinyText from "../components/ShinyText";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";

export default function Kurtis() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentHero, setCurrentHero] = useState(0);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = "http://localhost:5000/api";
  const filterRef = useRef(null);
  const { showLoginModal: cartLoginModal, setShowLoginModal: setCartLoginModal } = useCart();
  const { showLoginModal: wishlistLoginModal, setShowLoginModal: setWishlistLoginModal } = useWishlist();

  useEffect(() => {
    if (cartLoginModal || wishlistLoginModal) {
      setShowLoginModal(true);
      setCartLoginModal(false);
      setWishlistLoginModal(false);
    }
  }, [cartLoginModal, wishlistLoginModal, setCartLoginModal, setWishlistLoginModal]);

  const exploreRef = useRef(null);

  const heroImages = [
    "/images/collections/home/lehenga-hero.jpg",
    "/images/collections/home/lehenga-hero2.png",
    "/images/collections/wedding/wedding-1.jpg",
    "/images/collections/home/lehenga-hero.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const isKurtiProduct = (product) => {
    const normalizedSections = Array.isArray(product?.sections)
      ? product.sections.map((section) => String(section).toLowerCase())
      : [];

    const haystack = [
      product?.title,
      product?.description,
      product?.section,
      product?.category,
      ...(normalizedSections || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      product?.section === "kurti" ||
      normalizedSections.includes("kurti") ||
      product?.kurti === true ||
      product?.Kurti === true ||
      product?.category?.toLowerCase() === "kurti" ||
      /kurti/.test(haystack)
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/products`);
        const kurtiProducts = Array.isArray(res.data)
          ? res.data.filter(isKurtiProduct)
          : [];
        setProducts(kurtiProducts);

        const queryFromUrl = new URLSearchParams(location.search).get("search");
        if (queryFromUrl) {
          setSearchQuery(queryFromUrl);
          const matches = kurtiProducts.filter((product) =>
            `${product.title || ""} ${product.description || ""}`
              .toLowerCase()
              .includes(queryFromUrl.toLowerCase())
          );
          setFilteredProducts(matches);
          window.setTimeout(() => {
            document
              .getElementById(`kurti-product-${matches[0]?._id}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 500);
        } else {
          setFilteredProducts(kurtiProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [location.search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilters(query, filterCategory);
  };

  const triggerSearchScroll = () => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let targetId = null;

    if (normalizedQuery) {
      const exactMatch = filteredProducts.find(
        (product) => product.title?.trim().toLowerCase() === normalizedQuery
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
        ? document.getElementById(`kurti-product-${targetId}`)
        : exploreRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSearchEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearchScroll();
    }
  };

  const applyFilters = (query, category) => {
    let filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );

    if (category === "Western") filtered = filtered.filter((p) => p.Western);
    else if (category === "Indian") filtered = filtered.filter((p) => p.Indian);

    setFilteredProducts(filtered);
  };

  const handleFilterClick = (category) => {
    setFilterCategory(category);
    applyFilters(searchQuery, category);
    setFilterOpen(false);
  };

  const featuredProducts = products.filter((p) => p.trending).slice(0, 5);

  const featuredRef = useRef(null);
  const isInView = useInView(featuredRef, { margin: "-100px" });
  const featuredControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      featuredControls.start({ opacity: 1, y: 0 });
    } else {
      featuredControls.start({ opacity: 0, y: 50 });
    }
  }, [isInView]);

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />

      <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
        {heroImages.map((img, idx) => (
          <motion.img
            key={idx}
            src={img}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentHero === idx ? 1 : 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ))}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="text-white text-4xl md:text-6xl font-sansTrend font-bold mb-4"
          >
            Kurtis Collection
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg border-2 border-brand-navy bg-brand-gold text-brand-navy  hover:bg-brand-navy hover:text-brand-gold hover:border-brand-gold transition"
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          >
            Shop Kurtis
          </motion.button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-brand-mist to-brand-white">
        <div className="px-6 md:px-20 py-8 flex flex-wrap justify-center gap-4 relative">
          <div className="relative flex-1 max-w-lg flex">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleSearchEnter}
              className="w-full p-3 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-navy transition pl-10"
            />
            <LucideSearch
              className="absolute left-3 top-3.5 text-gray-400"
              size={20}
            />
            <button
              onClick={triggerSearchScroll}
              className="px-6 rounded-r-full bg-brand-gold text-brand-navy hover:bg-brand-ivory transition font-semibold"
            >
              Search
            </button>
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
            >
              <Filter size={18} />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute mt-1 bg-white shadow-lg rounded-lg overflow-hidden w-40 z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-brand-mist"
                  onClick={() => handleFilterClick("Western")}
                >
                  Western
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-brand-mist"
                  onClick={() => handleFilterClick("Indian")}
                >
                  Indian
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-brand-mist"
                  onClick={() => handleFilterClick("All")}
                >
                  All
                </button>
              </div>
            )}
          </div>
        </div>

        {featuredProducts.length > 0 && (
          <section
            ref={featuredRef}
            className="px-6 md:px-20 pt-24 pb-20 flex flex-col md:flex-row items-center md:items-stretch gap-12 relative overflow-hidden"
          >
            <motion.div
              animate={featuredControls}
              transition={{ type: "spring", stiffness: 80, damping: 12 }}
              className="w-full md:w-[40%] flex flex-col justify-center"
            >
              <div className="flex l">
                <BlurText
                  text="Featured "
                  delay={100}
                  animateBy="words"
                  direction="top"
                  className="text-5xl md:text-8xl font-fancy font-light text-brand-navy mb-4 gap-5"
                />
                <BlurText
                  text="Products"
                  delay={100}
                  animateBy="words"
                  direction="top"
                  className="text-5xl md:text-8xl font-fancy font-light text-brand-gold mb-4"
                />
              </div>
              <ShinyText
                text="Check out our trending collection from all categories"
                speed={5}
                className="text-3xl md:text-2xl font-sansTrend text-gray-600 mb-6"
              />
              <div className="w-full h-[8px] bg-gradient-to-r from-transparent via-brand-maroon to-transparent "></div>
            </motion.div>

            <div className="w-full md:w-[60%] overflow-hidden rounded-2xl">
              <motion.div
                className="flex w-max gap-5 py-2"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  duration: Math.max(16, featuredProducts.length * 6),
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {[...featuredProducts, ...featuredProducts].map((product, index) => (
                  <motion.div
                    key={`${product._id}-${index}`}
                    whileHover={{ scale: 1.04, y: -4 }}
                    className="w-[220px] md:w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-white p-3 shadow-md border border-brand-gold/10"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-56 object-cover rounded-xl mb-3"
                    />
                    <h3 className="text-center font-sansTrend font-semibold text-brand-navy line-clamp-2">
                      {product.title}
                    </h3>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}
      </div>

      <section ref={exploreRef} className="py-12 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-sansSerif font-light text-brand-navy text-center mb-10">
          Explore All Products
        </h2>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {(searchQuery
            ? filteredProducts
            : filteredProducts.slice(0, 12)
          ).map((product) => (
            <motion.div
              key={product._id}
              id={`kurti-product-${product._id}`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
