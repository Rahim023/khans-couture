import React from "react";
import Header from "../components/Header";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";

// ⭐ Currency context import
import { useCurrency } from "../context/CurrencyContext";
import Footer from "../components/Footer";
import PopupModal from "../components/Popupmodal";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [cartError, setCartError] = React.useState("");
  const [showCartError, setShowCartError] = React.useState(false);

  const { convertPrice, country } = useCurrency();

  // ⭐ Currency symbols
  const currencySymbol =
    country === "Canada" ? "CA$" :
    country === "USA" ? "US$" :
    "₹";

  // ⭐ Total in converted amount (INR → CAD/USD/INR)
  const totalConverted = cart.reduce(
    (sum, item) => sum + Number(convertPrice(item.price)) * item.quantity,
    0
  ).toFixed(2);

  const handleProceedToCheckout = () => {
    const invalidItem = cart.find((item) =>
      !item.size || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1
    );
    if (invalidItem) {
      setCartError("Every cart item must have a selected size and quantity.");
      setShowCartError(true);
      return;
    }
    setCartError("");
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <PopupModal
        isOpen={showCartError}
        title="Complete your cart"
        message={cartError}
        closeModal={() => setShowCartError(false)}
        redirectTo=""
      />
      {/* 🔹 Global Header */}
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-purple to-brand-charcoal py-10 md:py-16 text-center border-b-4 border-brand-gold px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <ShoppingCart size={40} className="text-brand-gold" />
          <h1 className="text-3xl md:text-5xl font-serifFancy font-bold text-brand-ivory">
            Your Shopping Cart
          </h1>
        </motion.div>
        <p className="text-brand-gold/80 text-lg mt-2">Review and checkout your items</p>
      </div>

      <section className="py-8 md:py-16 px-4 sm:px-6 md:px-20 flex-1 bg-brand-mist">
        {/* ✅ Empty Cart Condition */}
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <ShoppingCart size={80} className="mx-auto text-brand-gold/40 mb-6" />
            <p className="text-2xl font-semibold text-brand-navy mb-6">
              Your cart is empty
            </p>
            <p className="text-brand-charcoal/70 mb-8">Start shopping and add your favorite items</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-brand-navy to-brand-purple text-brand-gold rounded-full font-semibold hover:shadow-lg hover:shadow-brand-gold/30 transition-all"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* ⭐ Cart Items */}
            <div className="space-y-4 mb-8">
              {cart.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border border-brand-gold/20 hover:border-brand-gold"
                >
                  <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                    <div className="relative group">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform flex-none"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-brand-navy font-serifFancy line-clamp-2">{item.title}</h3>
                      {item.size && (
                        <p className="text-sm text-brand-charcoal/70">Size: <span className="font-semibold text-brand-gold">{item.size}</span></p>
                      )}
                      <p className="text-brand-gold font-bold text-sm sm:text-lg mt-2">
                        {currencySymbol} {convertPrice(item.price)} × {item.quantity} = {currencySymbol} {(convertPrice(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="p-2.5 sm:p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 flex-none"
                    title="Remove from cart"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* ⭐ Cart Summary */}
            {cartError && (
              <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-5 py-3 text-red-700 font-semibold">
                {cartError}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-brand-navy to-brand-purple rounded-2xl p-5 sm:p-8 text-brand-ivory shadow-xl mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg">Subtotal:</span>
                <span className="text-2xl font-bold text-brand-gold">{currencySymbol} {totalConverted}</span>
              </div>
              <div className="border-t border-brand-gold/30 pt-4 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
                  <span className="text-lg">Total Items:</span>
                  <span className="text-xl font-semibold">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-serifFancy">
                  Total: {currencySymbol} {totalConverted}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:flex">
                  <button
                    onClick={clearCart}
                    className="px-5 py-3 bg-brand-charcoal/20 text-brand-ivory rounded-full hover:bg-red-600 transition-all font-semibold"
                  >
                    Clear Cart
                  </button>

                  <button
                    onClick={handleProceedToCheckout}
                    className="px-8 py-3 bg-brand-gold text-brand-navy font-bold rounded-full hover:shadow-lg hover:shadow-brand-gold/50 transition-all flex items-center gap-2 group"
                  >
                    Proceed to Checkout
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
