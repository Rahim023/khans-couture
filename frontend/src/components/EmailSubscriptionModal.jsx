import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle, Loader } from "lucide-react";

export default function EmailSubscriptionModal({ isOpen, closeModal, onSubmit }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(email.trim().toLowerCase());
      }

      setSubmitted(true);
      setEmail("");

      // Auto close after 3 seconds
      setTimeout(() => {
        closeModal();
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <div className="relative px-8 py-12 z-10">
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

              {/* Success State */}
              {submitted ? (
                <>
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-4 bg-green-100 rounded-full">
                      <CheckCircle className="text-green-600" size={56} />
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-center mb-3 text-brand-navy font-serifFancy"
                  >
                    Thank You!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-brand-charcoal text-sm leading-relaxed font-sansTrend"
                  >
                    Welcome to our exclusive collection! Check your email for special offers.
                  </motion.p>
                </>
              ) : (
                <>
                  {/* Mail Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-4 bg-gradient-to-br from-brand-gold/20 to-brand-purple/20 rounded-full">
                      <Mail className="text-brand-gold" size={56} />
                    </div>
                  </motion.div>

                  {/* Heading */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-center mb-2 text-brand-navy font-serifFancy"
                  >
                    Get Exclusive Offers
                  </motion.h2>

                  {/* Subheading */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-brand-charcoal text-sm mb-8 font-sansTrend"
                  >
                    Subscribe to receive special discounts and early access to our new collections.
                  </motion.p>

                  {/* Decorative Divider */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
                  </div>

                  {/* Email Form */}
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Email Input */}
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading}
                        className="w-full px-5 py-3 rounded-2xl border-2 border-brand-gold/30
                               bg-white text-brand-charcoal placeholder-gray-400
                               focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20
                               transition-all duration-300 disabled:opacity-50"
                      />
                      <Mail
                        size={20}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold/60"
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-red-600 text-sm font-sansTrend"
                      >
                        {error}
                      </motion.p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-2xl font-semibold 
                               bg-gradient-to-r from-brand-navy via-brand-purple to-brand-navy
                               text-brand-gold transition-all duration-300 
                               hover:shadow-lg hover:shadow-brand-gold/30
                               hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        "Subscribe Now"
                      )}
                    </button>
                  </motion.form>

                  {/* Trust Badge */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-gray-500 mt-4 font-sansTrend"
                  >
                    ✓ We never spam • 100% Private
                  </motion.p>
                </>
              )}

              {/* Border Gradient */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  borderWidth: "2px",
                  borderImage:
                    "linear-gradient(135deg, #D4AF37, #0B1B3B, #D4AF37) 1",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
