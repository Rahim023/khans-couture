// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/Header";
import BlurText from "../components/BlurText";
import ShinyText from "../components/ShinyText";
import ProductCard from "../components/ProductCard";
import CircularGallery from "../components/CircularGallery";
import Silk from "../components/Silk";
import FashionCollectionLayout from "../components/FashionCollectionLayout";
import CollectionLayout from "../components/CollectionLayout";
import ElegantDivider from "../components/ElegantDivider";
import CollectionSlideshow from "../components/CollectionSlideshow";
import EmailSubscriptionModal from "../components/EmailSubscriptionModal";
import CustomizeModal from "../components/CustomizeModal";
import { fetchAssets } from "../services/assetsService";
import Footer from "../components/Footer";
import { api } from "../services/api";

const EMPTY_ASSETS = {
  heroImages: [],
  behindTheScenes: [],
  collectionImages: [],
  trendingImages: [],
  posterImages: [],
};

export default function Home() {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [assets, setAssets] = useState(EMPTY_ASSETS);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const trendingRes = await axios.get("http://localhost:5000/api/products/trending");
        const allRes = await axios.get("http://localhost:5000/api/products");

        const mappedTrending = trendingRes.data.map(p => ({
          ...p,
          id: p._id,
          title: p.title || p.name,
          img: p.img || p.image,
        }));

        const mappedAll = allRes.data.map(p => ({
          ...p,
          id: p._id,
          title: p.title || p.name,
          img: p.img || p.image,
        }));

        setTrendingProducts(mappedTrending);

        const others = mappedAll.filter(p => !p.trending).slice(0, 8);
        setOtherProducts(others);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAssetData = async () => {
      try {
        const data = await fetchAssets();
        setAssets({
          heroImages: Array.isArray(data.heroImages) ? data.heroImages : [],
          behindTheScenes: Array.isArray(data.behindTheScenes) ? data.behindTheScenes : [],
          collectionImages: Array.isArray(data.collectionImages) ? data.collectionImages : [],
          trendingImages: Array.isArray(data.trendingImages) ? data.trendingImages : [],
          posterImages: Array.isArray(data.posterImages) ? data.posterImages : [],
        });
      } catch (err) {
        console.warn("Could not load asset data from MongoDB.", err);
      }
    };

    fetchProducts();
    fetchAssetData();
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  /* Sparkle Dots */
  const Sparkles = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      {[...Array(30)].map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );

  /* Gradient Orbs */
  const GradientOrbs = () => (
    <>
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-gold/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-navy/50 blur-[150px] rounded-full"></div>
    </>
  );
  
  /**
   * BehindTheScenes
   * Small poster-style component used in the Home page left column.
   * Kept inline for quick iteration — move to components/ if reused elsewhere.
   */
  const BehindTheScenes = ({ assetGroups }) => {
    const leftTop = Array.isArray(assetGroups.behindTheScenes) ? assetGroups.behindTheScenes[0] : undefined;
    const rightTop = Array.isArray(assetGroups.posterImages) ? assetGroups.posterImages[0] : undefined;
    const bottomLeft = Array.isArray(assetGroups.behindTheScenes) ? assetGroups.behindTheScenes[1] : undefined;

    return (
      <div className="relative w-[440px] h-[900px] bg-[#f3f3f3] overflow-hidden font-sans">
        {/* BLANKS */}
        <h1 className="absolute top-6 left-10 text-[22px] font-bold tracking-tight text-[#2d1c1c]">
          BLANKS
        </h1>

        {/* Top Left Image */}
        {leftTop && (
          <img
            src={leftTop}
            alt=""
            className="absolute top-[110px] left-[35px] w-[170px] h-[250px] object-cover"
          />
        )}

        {/* Top Right Image */}
        {rightTop && (
          <img
            src={rightTop}
            alt=""
            className="absolute top-0 right-[35px] w-[155px] h-[390px] object-cover"
          />
        )}

        {/* White Circle */}
        <div className="absolute top-6 right-12 w-8 h-8 rounded-full bg-white"></div>

        {/* Paper Plane */}
        <div className="absolute top-[360px] left-[210px] text-[#d5d5d5] text-[40px] rotate-[-10deg]">
          ✈
        </div>

        {/* Gray Block */}
        <div className="absolute top-[310px] right-0 w-[250px] h-[520px] bg-[#c9cccc]"></div>

        {/* Bottom Left Image */}
        {bottomLeft && (
          <img
            src={bottomLeft}
            alt=""
            className="absolute bottom-[110px] left-[35px] w-[180px] h-[260px] object-cover"
          />
        )}

        {/* Top Text */}
        <div className="absolute top-[470px] right-[40px] w-[150px]">
          <h2 className="text-[#8a5b3f] text-[28px] font-bold leading-none">
            Top
          </h2>

          <p className="mt-2 text-[11px] text-white leading-[16px] font-semibold">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis
            porttitor metus. Phasellus eu tempus mi. Ut pellentesque eu erat ut
            egestas. Aliquam feugiat eu lorem non hendrerit.
          </p>
        </div>

        {/* BEHIND THE SCENES */}
        <h1 className="absolute bottom-[170px] left-[160px] text-[48px] font-extrabold tracking-wide text-white leading-none">
          BEHIND
        </h1>

        {/* THE SCENES */}
        <h1 className="absolute bottom-[65px] left-[160px] text-[60px] font-black leading-[68px] tracking-[5px] text-[#3a1f1f]">
          THE
          <br />
          SCENES.
        </h1>

        {/* Flower Icon */}
        <div className="absolute bottom-[80px] right-[30px] text-white text-[45px] rotate-[-20deg]">
          ✿
        </div>
      </div>
    );
  };

  // FashionCollectionLayout moved to components/FashionCollectionLayout.jsx

  const posterLeftImage = Array.isArray(assets.posterImages) ? assets.posterImages[0] : undefined;
  const posterRightImage = Array.isArray(assets.collectionImages) ? assets.collectionImages[0] : undefined;
  const posterBottomImage = Array.isArray(assets.trendingImages) ? assets.trendingImages[0] : undefined;

  return (
    <div className="w-full flex flex-col relative overflow-hidden font-sansTrend">
      <Header />
      <Sparkles />

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center overflow-hidden min-h-[650px] md:min-h-[900px] pt-10">
        <div className="absolute inset-0 -z-10 opacity-80">
          <Silk speed={5} scale={1.2} highlightColor="#D4C7B0" noiseIntensity={0.05} rotation={0} />
        </div>
        <GradientOrbs />

        <BlurText
          text="Discover Your Royal Style!"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-4xl md:text-7xl font-bold text-brand-ivory drop-shadow-xl tracking-wide"
        />

        <ShinyText
          text="Curated collections crafted for elegance."
          speed={3}
          className="mt-4 text-3xl md:text-4xl font-script text-brand-gold drop-shadow-2xl"
        />

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            onClick={() => scrollToSection("trending")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-4 bg-brand-maroon text-brand-ivory font-semibold rounded-full border-2 border-brand-beige shadow-xl hover:bg-brand-ivory hover:text-brand-maroon hover:border-brand-maroon transition"
          >
            Shop Now
          </motion.button>

          <motion.button
            onClick={() => setShowCustomize(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-4 bg-black text-brand-beige font-semibold rounded-full border-2 border-[#d6c7ad] shadow-2xl hover:bg-[#2a1b14] hover:text-white transition"
          >
            Customize Your Outfit
          </motion.button>
        </div>
      </section>

      {showCustomize && <CustomizeModal onClose={() => setShowCustomize(false)} />}

      {/* SEPARATOR LINE */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#590f0f] to-transparent"></div>

      
      <CollectionLayout assetGroups={assets} />
      
      <FashionCollectionLayout assetGroups={assets} />
   {/* SEPARATOR LINE */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#590f0f] to-transparent"></div>

      {/* POSTERS SECTION - Behind The Scenes & Let's Order */}
      <section className="w-full bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-center items-center max-w-full">
          
          {/* LEFT - BEHIND THE SCENES */}
          <div className="hidden lg:flex lg:flex-1 justify-center">
            <BehindTheScenes assetGroups={assets} />
          </div>

          {/* CENTER DIVIDER */}
          <div className="hidden lg:block">
            <ElegantDivider />
          </div>

          {/* RIGHT - LET'S ORDER POSTER */}
          <div className="flex-1 flex justify-center py-0">
            <div className="w-full max-w-[430px] bg-white overflow-hidden">
              
              {/* TOP GRID */}
              <div className="grid grid-cols-[1fr_72px_1fr] gap-0">
                
                {/* LEFT IMAGE */}
                <div className="relative h-[470px] overflow-hidden">
                  {posterLeftImage && (
                    <img
                      src={posterLeftImage}
                      alt="Fashion poster left"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* CENTER STRIP */}
                <div className="bg-[#8a8a8a] relative flex flex-col items-center">
                  {/* TOP LINES */}
                  <div className="absolute top-0 left-0 w-full flex flex-col gap-1">
                    <div className="h-1 bg-white/70" />
                    <div className="h-1 bg-white/70" />
                    <div className="h-1 bg-white/70" />
                    <div className="h-1 bg-white/70" />
                  </div>

                  {/* VERTICAL TEXT */}
                  <div className="flex-1 flex justify-center items-center">
                    <h1
                      className="text-white font-bold tracking-[8px] text-sm"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                      }}
                    >
                      LET'S ORDER
                    </h1>
                  </div>
                </div>

                {/* RIGHT IMAGE */}
                <div className="relative h-[470px] overflow-hidden">
                  {posterRightImage && (
                    <img
                      src={posterRightImage}
                      alt="Fashion poster right"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* PAPER PLANE */}
                  <div className="absolute top-6 right-6 text-white text-3xl opacity-80" style={{ transform: "rotate(15deg)" }}>
                    ✈
                  </div>
                </div>
              </div>

              {/* CENTER NOW TEXT */}
              <div className="relative z-20 flex justify-center bg-white py-2">
                <h1 className="text-[#3a3a3a] text-6xl sm:text-7xl font-bold tracking-widest uppercase">
                  Now
                </h1>
              </div>

              {/* BOTTOM IMAGE */}
              <div className="relative h-80 overflow-hidden">
                {posterBottomImage && (
                  <img
                    src={posterBottomImage}
                    alt="Fashion poster bottom"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* STAR */}
                <div className="absolute bottom-8 right-8 text-white text-3xl opacity-90">
                  ✧
                </div>
              </div>

              {/* FOOTER BAR */}
              <div className="flex justify-center bg-[#8a8a8a] py-2">
                <p className="text-white text-xs tracking-wider font-semibold uppercase">
                  Khan's Couture Exclusive
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
  



      {/* SEPARATOR LINE */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#590f0f] to-transparent"></div>

      {/* TRENDING SECTION */}
      <section id="trending" className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-fancy text-center text-brand-navy mb-4"
          >
            Explore the <span className="text-[#590f0f]">Trending</span>
          </motion.h3>
          
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 w-48 bg-[#590f0f] mx-auto mb-8 rounded-full"
          ></motion.div>

          <p className="text-brand-maroon max-w-2xl text-center font-sansTrend font-light mx-auto mb-12 text-lg">
            Inspired by global runway trends and handcrafted traditions.
          </p>

          <div className="w-full">
            {trendingProducts.length > 0 ? (
              <CircularGallery
                items={trendingProducts.map(p => ({
                  image: p.img || p.image,
                  text: p.title,
                }))}
              />
            ) : (
              <p className="text-center text-brand-navy">No trending products available.</p>
            )}
          </div>
        </div>
      </section>

      {/* SEPARATOR LINE */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#590f0f] to-transparent"></div>

    

      {/* SEPARATOR LINE */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#590f0f] to-transparent"></div>

      {/* NEWSLETTER SECTION */}
      <section className="w-full bg-white py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serifFancy text-brand-navy mb-3">
            Stay in the Loop
          </h2>
          <p className="text-brand-charcoal/80 mb-8 text-lg">
            Subscribe for updates, offers, and exclusive collections.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowEmailModal(true)}
            className="px-8 py-3 rounded-lg bg-[#590f0f] text-white hover:bg-[#7a1515] transition shadow-lg font-semibold"
          >
            Subscribe Now
          </motion.button>
        </div>
      </section>

      {/* SEPARATOR LINE */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#590f0f] to-transparent"></div>

      {/* Email Subscription Modal */}
      <EmailSubscriptionModal
        isOpen={showEmailModal}
        closeModal={() => setShowEmailModal(false)}
        onSubmit={async (email) => {
          try {
            await api.post("/newsletter/subscribe", { email });
          } catch (err) {
            console.error("Subscription error:", err);
            throw err;
          }
        }}
      />

      <Footer />
    </div>
  );
}
