// src/pages/Checkout.jsx
import React from "react";
import Header from "../components/Header";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, ShoppingCart, Lock, CheckCircle, MapPin, Mail, Phone, User, Navigation } from "lucide-react";
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
  const [addressSuggestions, setAddressSuggestions] = React.useState([]);
  const [addressVerified, setAddressVerified] = React.useState(false);
  const [addressSearching, setAddressSearching] = React.useState(false);
  const [addressSearchStatus, setAddressSearchStatus] = React.useState("");
  const [shippingErrors, setShippingErrors] = React.useState({});
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

  React.useEffect(() => {
    const query = shipping.addressLine1.trim();
    if (query.length < 4) {
      setAddressSuggestions([]);
      setAddressSearching(false);
      setAddressSearchStatus("");
      return;
    }
    const timer = window.setTimeout(async () => {
      setAddressSearching(true);
      setAddressSearchStatus("");
      const controller = new AbortController();
      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          q: `${query}${shipping.country ? `, ${shipping.country}` : ""}`,
        });
        let results = [];

        try {
          const photonParams = new URLSearchParams({ q: `${query}, ${shipping.country}`, limit: "8", lang: "en" });
          const photonResponse = await fetch(`https://photon.komoot.io/api/?${photonParams}`, {
            signal: controller.signal,
          });
          if (photonResponse.ok) {
            const photonData = await photonResponse.json();
            results = (photonData.features || []).map((feature, index) => {
              const property = feature.properties || {};
              const street = [property.housenumber, property.street].filter(Boolean).join(" ");
              const displayName = [property.name, street, property.city || property.town || property.village, property.state, property.postcode, property.country]
                .filter(Boolean)
                .filter((value, position, values) => values.indexOf(value) === position)
                .join(", ");
              return {
                key: `photon-${property.osm_id || index}`,
                display_name: displayName || property.name || query,
                address: {
                  house_number: property.housenumber,
                  road: property.street,
                  city: property.city || property.town || property.village,
                  state: property.state,
                  postcode: property.postcode,
                  country: property.country,
                },
              };
            });
          }
        } catch (photonError) {
          if (photonError.name !== "AbortError") results = [];
        }

        if (results.length === 0) {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
            headers: { "Accept-Language": "en" },
            signal: controller.signal,
          });
          if (response.ok) {
            const nominatimResults = await response.json();
            results = nominatimResults.map((item) => ({
              key: `nominatim-${item.place_id}`,
              display_name: item.display_name,
              address: item.address || {},
            }));
          }
        }

        setAddressSuggestions(results);
        if (results.length === 0) setAddressSearchStatus("No matching address found. Check the street, city and country.");
      } catch (searchError) {
        if (searchError.name === "AbortError") return;
        setAddressSuggestions([]);
        setAddressSearchStatus("Address search is unavailable. Check your connection and try again.");
      } finally {
        setAddressSearching(false);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [shipping.addressLine1, shipping.country]);

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
    setShippingErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "addressLine1") {
      setAddressVerified(false);
      setShippingErrors((prev) => ({ ...prev, addressLine1: "" }));
      setAddressSearchStatus("");
    }
  };

  const selectAddress = (suggestion) => {
    const parts = suggestion.address || {};
    setShipping((prev) => ({
      ...prev,
      addressLine1: suggestion.display_name || prev.addressLine1,
      city: parts.city || parts.town || parts.village || parts.county || prev.city,
      state: parts.state || parts.region || prev.state,
      postalCode: parts.postcode || prev.postalCode,
      country: parts.country || prev.country,
    }));
    setAddressVerified(true);
    setAddressSuggestions([]);
    setShippingErrors((prev) => ({ ...prev, addressLine1: "", postalCode: "", city: "", country: "" }));
  };

  const validateShipping = () => {
    const errors = {};
    if (shipping.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(shipping.email.trim())) errors.email = "Enter a valid email address.";
    if (!/^[+\d][\d\s()-]{6,}$/.test(shipping.phone.trim())) errors.phone = "Enter a valid phone number.";
    if (!shipping.addressLine1.trim()) errors.addressLine1 = "Enter your street address.";
    else if (!addressVerified) errors.addressLine1 = "Select a verified address from the suggestions.";
    if (!shipping.city.trim()) errors.city = "Enter your city.";
    if (!shipping.postalCode.trim()) errors.postalCode = "Enter your postal code.";
    if (!shipping.country.trim()) errors.country = "Enter your country.";
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
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
    if (!validateShipping()) {
      document.querySelector("[data-shipping-form]")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    if (!validateShipping()) {
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
          Authorization: token ? `Bearer ${token}` : "",
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
      <div className="bg-gradient-to-r from-brand-navy via-brand-purple to-brand-charcoal py-10 md:py-16 text-center border-b-4 border-brand-gold px-4">
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

      <section className="py-8 md:py-16 px-4 sm:px-6 md:px-20">
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
              className="bg-white shadow-xl border border-brand-gold/40 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 mb-6 md:mb-8"
            >
              {/* SUMMARY HEADER */}
              <div className="flex items-center gap-3 mb-5 md:mb-8 pb-4 md:pb-6 border-b border-brand-gold/30">
                <CheckCircle size={28} className="text-brand-gold flex-none" />
                <h2 className="text-2xl md:text-3xl font-serifFancy font-bold text-brand-navy">
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
                    className="flex items-start gap-3 bg-gradient-to-r from-brand-ivory to-brand-mist border border-brand-gold/20 p-3 sm:p-4 md:p-6 rounded-2xl hover:border-brand-gold transition-all"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base md:text-lg font-semibold text-brand-navy font-serifFancy line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs sm:text-sm text-brand-charcoal">
                        <p>Size: <span className="font-bold text-brand-gold">{item.size}</span></p>
                        <p>Qty: <span className="font-bold text-brand-gold">{item.quantity}</span></p>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="text-right flex-none">
                      <p className="text-lg font-bold text-brand-gold">
                        {currencySymbol} {(convertPrice(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-brand-charcoal/70">{currencySymbol} {convertPrice(item.price)} each</p>
                    </div>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 flex-none"
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
              className="bg-white shadow-xl border border-brand-gold/40 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8"
              data-shipping-form
            >
              <h2 className="text-3xl font-serifFancy font-bold text-brand-navy mb-6">Shipping Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Full Name</label>
                  <input name="fullName" value={shipping.fullName} onChange={handleShippingChange} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold ${shippingErrors.fullName ? "border-red-400" : "border-brand-gold/30"}`} placeholder="Full name" />
                  {shippingErrors.fullName && <p className="mt-1 text-sm text-red-600">{shippingErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Email</label>
                  <input type="email" name="email" value={shipping.email} onChange={handleShippingChange} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold ${shippingErrors.email ? "border-red-400" : "border-brand-gold/30"}`} placeholder="you@example.com" />
                  {shippingErrors.email && <p className="mt-1 text-sm text-red-600">{shippingErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Phone Number</label>
                  <input type="tel" name="phone" value={shipping.phone} onChange={handleShippingChange} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold ${shippingErrors.phone ? "border-red-400" : "border-brand-gold/30"}`} placeholder="+91 98765 43210" />
                  {shippingErrors.phone && <p className="mt-1 text-sm text-red-600">{shippingErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Country</label>
                  <input name="country" value={shipping.country} onChange={handleShippingChange} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold ${shippingErrors.country ? "border-red-400" : "border-brand-gold/30"}`} placeholder="India" />
                  {shippingErrors.country && <p className="mt-1 text-sm text-red-600">{shippingErrors.country}</p>}
                </div>
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Street Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" />
                    <input name="addressLine1" value={shipping.addressLine1} onChange={handleShippingChange} autoComplete="street-address" className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold ${shippingErrors.addressLine1 ? "border-red-400" : addressVerified ? "border-green-500" : "border-brand-gold/30"}`} placeholder="Start typing your street address" />
                  </div>
                  {shippingErrors.addressLine1 && <p className="mt-1 text-sm text-red-600">{shippingErrors.addressLine1}</p>}
                  {addressVerified && !shippingErrors.addressLine1 && <p className="mt-1 text-sm text-green-700 flex items-center gap-1"><CheckCircle size={14} /> Address verified</p>}
                  {addressSearching && <p className="mt-2 text-sm text-brand-charcoal/60">Searching for addresses...</p>}
                  {!addressSearching && addressSearchStatus && <p className="mt-2 text-sm text-red-600">{addressSearchStatus}</p>}
                  {addressSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-brand-gold/30 bg-white shadow-2xl overflow-hidden">
                      {addressSuggestions.map((suggestion) => (
                        <button type="button" key={suggestion.key} onClick={() => selectAddress(suggestion)} className="w-full text-left px-4 py-3 border-b border-brand-gold/10 hover:bg-brand-mist flex gap-3">
                          <Navigation size={16} className="mt-1 text-brand-gold flex-none" />
                          <span className="text-sm text-brand-charcoal">{suggestion.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Apartment / Building / Landmark</label>
                  <input name="addressLine2" value={shipping.addressLine2} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">City</label>
                  <input name="city" value={shipping.city} onChange={handleShippingChange} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold ${shippingErrors.city ? "border-red-400" : "border-brand-gold/30"}`} placeholder="City" />
                  {shippingErrors.city && <p className="mt-1 text-sm text-red-600">{shippingErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">State</label>
                  <input name="state" value={shipping.state} onChange={handleShippingChange} className="w-full border border-brand-gold/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold" placeholder="State" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Postal Code</label>
                  <input name="postalCode" value={shipping.postalCode} onChange={handleShippingChange} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold ${shippingErrors.postalCode ? "border-red-400" : "border-brand-gold/30"}`} placeholder="Postal code" />
                  {shippingErrors.postalCode && <p className="mt-1 text-sm text-red-600">{shippingErrors.postalCode}</p>}
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
                className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-full shadow-lg font-bold transition-all duration-300"
              >
                Clear Cart
              </button>

              <button
                onClick={handleCheckoutReview}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-brand-gold to-brand-gold text-brand-navy hover:shadow-lg hover:shadow-brand-gold/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
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
