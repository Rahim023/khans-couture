import React from "react";
import { motion } from "framer-motion";

/**
 * ElegantDivider Component
 * Creates an attractive, animated separator between sections
 * with vertical line and decorative elements
 */
export default function ElegantDivider() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Top Decorative Element */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-[#590f0f] text-2xl mb-4"
      >
        ✦
      </motion.div>

      {/* Animated Vertical Line */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-1 h-16 bg-gradient-to-b from-[#590f0f] via-[#f1eae2] to-[#590f0f] rounded-full"
      />

      {/* Bottom Decorative Element */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-[#590f0f] text-2xl mt-4"
      >
        ✿
      </motion.div>
    </div>
  );
}
