// src/components/LoginGuard.jsx
import React from "react";
import { motion } from "framer-motion";
import { X, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginGuard({ isOpen, onClose, onRedirect }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose?.();
    navigate("/login");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-fancy text-brand-navy">Sign In Required</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-brand-navy" />
          </button>
        </div>

        <p className="text-gray-600 text-lg mb-8">
          Please log in to your account to continue with this action.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-gold text-brand-navy font-semibold rounded-full hover:brightness-95 transition shadow-md"
          >
            <LogIn size={18} /> Sign In
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 border-2 border-brand-navy text-brand-navy font-semibold rounded-full hover:bg-brand-mist transition"
          >
            Cancel
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => {
              onClose?.();
              navigate("/signup");
            }}
            className="text-brand-gold font-semibold hover:underline"
          >
            Sign up here
          </button>
        </p>
      </motion.div>
    </div>
  );
}
