// src/pages/Checkout.jsx
import React from "react";
import Header from "../components/Header";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, ShoppingCart, Lock, CheckCircle } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import Footer from "../components/Footer";
import PopupModal from "../components/Popupmodal";

export default function Checkout() {
  const { cart, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { convertPrice, country } = useCurrency();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showCheckoutError, setShowCheckoutError] = React.useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = React.useState(false);
  const userData = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null") || {};
    } catch {
      return {};
    }
  }, []);

  const [shipping, setShipping] = React.useState({
    fullName: "",
    email: userData.email || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  React.useEffect(() => {
    if (!shipping.fullName && userData?.email) {
      setShipping((prev) => ({
        ...prev,
        email: userData.email || prev.email,
      }));
    }
  }, [shipping.fullName, userData.email]);

  const currencySymbol =
    country === "Canada" ? "CA$" :
    country === "USA" ? "US$" :
    "₹";

  const totalConverted = cart
    .reduce(
      (sum, item) =>
        sum + Number(convertPrice(item.price)) * Number(item.quantity),
      0
    )
    .toFixed(2);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const openCheckoutValidation = (message) => {
    setError(message);
    setShowCheckoutError(true);
  };

  const handleCheckoutReview = () => {
    if (cart.length === 0) {
      openCheckoutValidation("Your cart is empty. Add an item before checkout.");
      return;
    }
    const invalidItem = cart.find((item) =>
      !item.size || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1
    );
    if (invalidItem) {
      openCheckoutValidation("Every item must have a selected size and valid quantity.");
      return;
    }
    if (!shipping.fullName || !shipping.email || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.postalCode || !shipping.country) {
      openCheckoutValidation("Please complete the shipping information before continuing.");
      return;
    }
    setShowCheckoutConfirm(true);
  };

  // ⭐ PLACE ORDER (Backend Working)
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const invalidItem = cart.find((item) =>
      !item.size || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1
    );
    if (invalidItem) {
      setError("Every item must have a selected size and valid quantity. Please return to your cart.");
      setShowCheckoutError(true);
      return;
    }

    if (!shipping.fullName || !shipping.email || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.postalCode || !shipping.country) {
      setError("Please complete the shipping information before continuing.");
      setShowCheckoutError(true);
      return;
    }

    setLoading(true);
    setError("");

    const totalINR = cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://khans-couture.onrender.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer: {
            name: shipping.fullName,
            email: shipping.email,
            phone: shipping.phone,
            username: userData?.email ? userData.email.split("@")[0] : "",
            userId: userData?._id || "",
          },
          shippingAddress: {
            firstName: shipping.fullName.split(" ")[0] || shipping.fullName,
            lastName: shipping.fullName.split(" ").slice(1).join(" ") || "",
            addressLine1: shipping.addressLine1,
            addressLine2: shipping.addressLine2,
            city: shipping.city,
            state: shipping.state,
            postalCode: shipping.postalCode,
            country: shipping.country,
          },
          items: cart.map((i) => ({
            productId: String(i.id),
            title: i.title,
            price: Number(i.price),
            quantity: Number(i.quantity),
            size: i.size,
            img: i.img,
          })),
          totalINR,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();

      localStorage.setItem("lastOrderId", data.order._id);
      clearCart();
      navigate(`/payment/${data.order._id}`);
    } catch (err) {
      console.error("Order error:", err);
      setError(err.message || "Failed to place order. Please check your connection and try again.");
      setShowCheckoutError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <PopupModal
        isOpen={showCheckoutError}
        title="Please check your order"
        message={error}
        closeModal={() => setShowCheckoutError(false)}
        redirectTo=""
      />
      <PopupModal
        isOpen={showCheckoutConfirm}
        title="Confirm your order"
        message={`Place this order for ${currencySymbol} ${totalConverted}?`}
        closeModal={() => setShowCheckoutConfirm(false)}
        redirectTo=""
        actionLabel={loading ? "Placing order..." : "Place order securely"}
        actionIcon={<Lock size={18} />}
        onAction={() => {
          setShowCheckoutConfirm(false);
          handlePlaceOrder();
        }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-purple to-brand-charcoal py-16 text-center border-b-4 border-brand-gold">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <Lock size={40} className="text-brand-gold" />
          <h1 className="text-4xl md:text-5xl font-serifFancy font-bold text-brand-ivory">
            Secure Checkout
          </h1>
        </motion.div>
        <p className="text-brand-gold/80 text-lg mt-2">Review your order before placing</p>
      </div>

      <section className="py-16 px-6 md:px-20">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={80} className="mx-auto text-brand-gold/40 mb-6" />
            <p className="text-2xl font-semibold text-brand-navy">
              Your cart is empty
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Order Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-xl border-2 border-brand-gold rounded-3xl p-10 mb-8"
            >
              {/* SUMMARY HEADER */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-brand-gold/30">
                <CheckCircle size={32} className="text-brand-gold" />
                <h2 className="text-3xl font-serifFancy font-bold text-brand-navy">
                  Order Summary
                </h2>
              </div>
 
              <div className="space-y-4 mb-8">
                {cart.map((item, idx) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex justify-between items-center bg-gradient-to-r from-brand-ivory to-brand-mist border border-brand-gold/20 p-6 rounded-2xl hover:border-brand-gold transition-all"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-brand-navy font-serifFancy">
                        {item.title}
                      </p>
                      <div className="flex gap-6 mt-2 text-sm text-brand-charcoal">
                        <p>Size: <span className="font-bold text-brand-gold">{item.size}</span></p>
                        <p>Qty: <span className="font-bold text-brand-gold">{item.quantity}</span></p>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="text-right mx-6">
                      <p className="text-lg font-bold text-brand-gold">
                        {currencySymbol} {(convertPrice(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-brand-charcoal/70">{currencySymbol} {convertPrice(item.price)} each</p>
                    </div>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* TOTAL PRICE */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-brand-navy to-brand-purple p-6 rounded-2xl text-brand-ivory"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg">Subtotal:</span>
                  <span className="text-lg font-bold text-brand-gold">{currencySymbol} {totalConverted}</span>
                </div>
                <div className="border-t border-brand-gold/30 pt-3 flex justify-between items-center">
                  <h3 className="text-2xl font-bold font-serifFancy">Total:</h3>
                  <span className="text-3xl font-bold text-brand-gold">
                    {currencySymbol} {totalConverted}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* SHIPPING INFORMATION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-xl border-2 border-brand-gold rounded-3xl p-8 mb-8"
            >
              <h2 className="text-3xl font-serifFancy font-bold text-brand-navy mb-6">Shipping Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Full Name</label>
                  <input name="fullName" value={shipping.fullName} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Email</label>
                  <input type="email" name="email" value={shipping.email} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Phone Number</label>
                  <input name="phone" value={shipping.phone} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Country</label>
                  <input name="country" value={shipping.country} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="India" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Street Address</label>
                  <input name="addressLine1" value={shipping.addressLine1} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="House number, street, area" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Apartment / Building / Landmark</label>
                  <input name="addressLine2" value={shipping.addressLine2} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">City</label>
                  <input name="city" value={shipping.city} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">State</label>
                  <input name="state" value={shipping.state} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="State" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Postal Code</label>
                  <input name="postalCode" value={shipping.postalCode} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="Postal code" />
                </div>
              </div>
            </motion.div>

            {/* BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row justify-between gap-4"
            >
              {/* ERROR MESSAGE */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-red-100 border-l-4 border-red-600 text-red-700 p-4 rounded"
                >
                  <p className="font-semibold">Order Error</p>
                  <p>{error}</p>
                </motion.div>
              )}

              <button
                onClick={clearCart}
                disabled={loading}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-full shadow-lg font-bold transition-all duration-300"
              >
                Clear Cart
              </button>

              <button
                onClick={handleCheckoutReview}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-brand-gold to-brand-gold text-brand-navy hover:shadow-lg hover:shadow-brand-gold/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} className="group-hover:rotate-12 transition-transform" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
