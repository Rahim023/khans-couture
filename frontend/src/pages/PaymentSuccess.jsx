// src/pages/PaymentSuccess.jsx
import React, { useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { convertPrice } = useCurrency();

  useEffect(() => {
    async function finalizeOrder() {
      const pending = JSON.parse(localStorage.getItem("pendingOrder"));
      if (!pending) return;

      // ⭐ Create a final order record
      const finalOrder = {
        id: pending.id,
        items: pending.items,
        total: pending.total,
        status: "Ordered",
        createdAt: new Date().toLocaleString(),
      };

      // ⭐ SAVE FINAL ORDER
      localStorage.setItem("lastOrder", JSON.stringify(finalOrder));
      localStorage.setItem("lastOrderId", pending.id);

      // ⭐ REMOVE pending order AFTER saving final
      localStorage.removeItem("pendingOrder");
    }

    finalizeOrder();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-mist to-brand-ivory font-sansTrend">
      <Header />

      <section className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center max-w-md mx-4"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="mb-8"
          >
            <div className="p-6 bg-gradient-to-br from-green-100 to-green-50 rounded-full inline-block shadow-xl">
              <CheckCircle size={80} className="text-green-600" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-serifFancy font-bold text-brand-navy mb-4"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-brand-charcoal/80 mb-6"
          >
            Thank you for your purchase! Your order has been confirmed.
          </motion.p>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package size={24} className="text-brand-gold" />
              <p className="text-lg font-semibold text-brand-navy">Order Confirmed</p>
            </div>
            <p className="text-sm text-brand-charcoal/70">
              A confirmation email has been sent to your inbox with all order details.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-brand-ivory border-2 border-brand-navy text-brand-navy rounded-full font-bold hover:bg-brand-gold hover:border-brand-gold transition-all"
            >
              Continue Shopping
            </button>

            <button
              onClick={() => navigate("/orders")}
              className="px-8 py-3 bg-gradient-to-r from-brand-navy to-brand-purple text-brand-gold rounded-full font-bold hover:shadow-lg hover:shadow-brand-gold/30 transition-all flex items-center justify-center gap-2 group"
            >
              View Order
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Decorative dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-2 mt-8"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="w-2 h-2 rounded-full bg-brand-gold"
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Badge */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-brand-navy text-brand-ivory py-6 text-center mt-10"
      >
        <p className="text-sm">✓ Secure • Encrypted • 100% Safe</p>
        <p className="text-xs mt-2 opacity-70">© 2025 Khan's Couture. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}
