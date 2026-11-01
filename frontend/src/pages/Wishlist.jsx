// src/pages/Wishlist.jsx
import React from "react";
import Header from "../components/Header";
import { useWishlist } from "./WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";

export default function Wishlist() {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { currencySymbol, convertPrice } = useCurrency();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-mist">
        <Header />
        <div className="flex justify-center items-center text-xl py-40 text-brand-charcoal">
          Loading wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />

      {/* LUXURY HERO SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-brand-navy via-brand-purple to-brand-navy py-20 overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 right-10 w-40 h-40 border-2 border-brand-gold/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 left-10 w-32 h-32 border border-brand-gold/5 rounded-full"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-4 inline-flex items-center justify-center"
          >
            <Heart size={40} className="text-brand-gold fill-brand-gold" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl font-serifFancy font-bold text-brand-ivory tracking-wide"
          >
            Your Wishlist
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-brand-ivory/80 mt-4 text-lg max-w-2xl mx-auto"
          >
            {wishlist.length === 0
              ? "Your wishlist is empty. Explore our collection and save your favorite items."
              : `You have ${wishlist.length} treasured items saved • Shop your favorites now`}
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-brand-gold to-transparent mx-auto mt-6 rounded-full"
          />
        </div>
      </motion.div>

      {/* EMPTY STATE */}
      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center py-32 px-6"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Heart size={80} className="text-brand-gold/30 mb-6" />
          </motion.div>

          <h2 className="text-3xl font-serifFancy text-brand-navy mb-3">
            No Favorites Yet
          </h2>

          <p className="text-brand-charcoal/70 text-lg max-w-md text-center mb-8">
            Start building your wishlist by saving items you love. Your curated collection awaits.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-brand-navy text-brand-ivory rounded-full font-bold hover:shadow-lg hover:shadow-brand-navy/30 transition flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Continue Shopping
          </motion.button>
        </motion.div>
      ) : (
        <div className="px-6 md:px-20 py-16">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 p-6 bg-gradient-to-r from-brand-gold/10 to-brand-purple/10 rounded-2xl border border-brand-gold/20"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-brand-charcoal/70 mb-1">Wishlist Total</p>
                <p className="text-3xl font-bold text-brand-navy">{wishlist.length} Items</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-brand-charcoal/70 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-brand-gold">
                  {currencySymbol}
                  {convertPrice(
                    wishlist.reduce((sum, item) => sum + (item.price || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* WISHLIST GRID */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{
                    y: -8,
                    boxShadow: "0px 20px 50px rgba(212, 175, 55, 0.25)",
                  }}
                  className="group bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-brand-gold/20 hover:border-brand-gold transition-all duration-300"
                >
                  {/* IMAGE CONTAINER */}
                  <div className="relative w-full h-72 bg-gradient-to-br from-brand-mist to-brand-ivory overflow-hidden group/image">
                    <motion.img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-contain p-4 group-hover/image:scale-105 transition-transform duration-300"
                    />

                    {/* HEART BADGE - CLICKABLE TO REMOVE */}
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-4 left-4 bg-brand-gold text-brand-navy p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 z-20"
                      title="Remove from wishlist"
                    >
                      <Heart size={20} className="fill-brand-navy hover:fill-white" />
                    </motion.button>

                    {/* REMOVE BUTTON (TRASH ICON) */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-lg p-2.5 rounded-full shadow-lg text-white hover:bg-red-600 transition z-20"
                      title="Delete from wishlist"
                    >
                      <Trash2 size={18} />
                    </motion.button>

                    {/* VIEW ICON - Shows on hover (FIXED VISIBILITY) */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-15"
                    >
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="bg-brand-gold text-brand-navy p-4 rounded-full shadow-2xl hover:shadow-gold-lg"
                        title="View product details"
                      >
                        <Eye size={28} />
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* DETAILS */}
                  <div className="p-6">
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg font-bold text-brand-navy line-clamp-2 mb-2"
                    >
                      {item.title}
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="text-3xl font-bold text-brand-gold mb-4"
                    >
                      {currencySymbol}
                      {convertPrice(item.price)}
                    </motion.p>

                    {/* BUTTONS ROW */}
                    <div className="flex gap-3">
                      {/* ADD TO CART BUTTON */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="w-full py-3 bg-gradient-to-r from-brand-navy to-brand-purple text-brand-gold font-bold rounded-2xl hover:shadow-lg hover:shadow-brand-navy/30 transition flex items-center justify-center gap-2 group"
                      >
                        <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-brand-navy text-brand-ivory py-8 text-center mt-12 border-t-2 border-brand-gold/30"
      >
        <p className="text-sm font-sansTrend">
          © 2025 Khan's Couture • Premium Fashion • Curated Collections
        </p>
      </motion.footer>
    </div>
  );
}
  