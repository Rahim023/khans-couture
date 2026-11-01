import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, X, Package, Heart, ShoppingCart } from "lucide-react";

export default function PopupModal({
  isOpen,
  message,
  closeModal,
  redirectTo,
  title = "Perfect!",
  actionLabel,
  actionIcon = null,
  onAction,
  tone = "success",
}) {
  // Determine icon based on message
  const getIcon = () => {
    if (message.toLowerCase().includes("wishlist")) {
      return <Heart className="text-brand-maroon" size={56} fill="currentColor" />;
    } else if (message.toLowerCase().includes("cart")) {
      return <ShoppingCart className="text-brand-gold" size={56} />;
    } else if (tone === "warning") {
      return <Package className="text-amber-600" size={56} />;
    } else {
      return <CheckCircle className="text-green-500" size={56} />;
    }
  };

  // Get action button label
  const getButtonLabel = () => {
    if (actionLabel) return actionLabel;
    if (!redirectTo) return "Continue Shopping";
    const path = redirectTo.replace("/", "");
    return `View ${path}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.5, y: 30 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-ivory via-brand-mist to-white" />

            {/* Content */}
            <div className="relative px-8 py-10 z-10">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-brand-gold/20 rounded-full transition-all duration-300 group"
              >
                <X
                  size={24}
                  className="text-brand-charcoal group-hover:text-brand-gold transition-colors"
                />
              </button>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="p-4 bg-gradient-to-br from-brand-gold/10 to-brand-purple/10 rounded-full">
                  {getIcon()}
                </div>
              </motion.div>

              {/* Message */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-center mb-3 text-brand-navy font-serifFancy"
              >
                {title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-brand-charcoal mb-8 font-sansTrend text-sm leading-relaxed"
              >
                {message}
              </motion.p>

              {/* Decorative Divider */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3"
              >
                {redirectTo ? (
                  <Link
                    to={redirectTo}
                    onClick={closeModal}
                    className="group flex items-center justify-center gap-2 text-center py-3 px-4 rounded-2xl font-semibold 
                             bg-gradient-to-r from-brand-navy via-brand-purple to-brand-navy
                             text-brand-gold transition-all duration-300 
                             hover:shadow-lg hover:shadow-brand-gold/30
                             hover:scale-105 active:scale-95"
                  >
                    {actionIcon}
                    {getButtonLabel()}
                  </Link>
                ) : onAction ? (
                  <button
                    onClick={onAction}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold bg-brand-navy text-brand-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                  >
                    {actionIcon}
                    {getButtonLabel()}
                  </button>
                ) : null}

                <button
                  className="py-3 px-4 rounded-2xl font-semibold 
                           bg-brand-mist text-brand-navy transition-all duration-300
                           hover:bg-brand-gold hover:text-brand-navy
                           hover:shadow-md active:scale-95"
                  onClick={closeModal}
                >
                  Continue Shopping
                </button>
              </motion.div>

              {/* Decorative Element */}
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="w-2 h-2 rounded-full bg-brand-gold"
                  />
                ))}
              </div>
            </div>

            {/* Border Gradient */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                borderWidth: "2px",
                borderImage: "linear-gradient(135deg, #D4AF37, #0B1B3B, #D4AF37) 1",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
