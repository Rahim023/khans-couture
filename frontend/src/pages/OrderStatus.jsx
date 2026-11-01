// src/pages/OrderStatus.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCurrency } from "../context/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Clock, CheckCircle, AlertCircle, Trash2, XCircle, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderStatus() {
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [mobileView, setMobileView] = useState("recent");

  const { currencySymbol, convertPrice } = useCurrency();
  const navigate = useNavigate();

  const cancellationReasons = [
    "Ordered by mistake",
    "Found a better price elsewhere",
    "Delivery taking too long",
    "Item not needed anymore",
    "Changed my mind",
    "Other",
  ];

  // ⭐ Fetch user order history and selected/latest order
  useEffect(() => {
    async function fetchOrder() {
      const token = localStorage.getItem("token");
      if (!token) {
        setOrders([]);
        setOrder(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const history = await res.json();
          const safeHistory = Array.isArray(history) ? history : [];
          setOrders(safeHistory);

          const currentOrderId = localStorage.getItem("lastOrderId");
          const existingSelected = currentOrderId
            ? safeHistory.find((entry) => entry._id === currentOrderId)
            : null;

          const selectedOrder = existingSelected || safeHistory[0] || null;
          setOrder(selectedOrder);

          if (selectedOrder) {
            localStorage.setItem("lastOrderId", selectedOrder._id);
          } else {
            localStorage.removeItem("lastOrderId");
          }

          if (currentOrderId && !existingSelected) {
            const directRes = await fetch(`http://localhost:5000/api/orders/${currentOrderId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (directRes.ok) {
              const directOrder = await directRes.json();
              if (directOrder && directOrder._id) {
                setOrder(directOrder);
                localStorage.setItem("lastOrderId", directOrder._id);
              }
            }
          }
        } else {
          setOrders([]);
          setOrder(null);
          localStorage.removeItem("lastOrderId");
        }
      } catch (err) {
        console.error("Order fetch error:", err);
        setOrders([]);
        setOrder(null);
      }

      setLoading(false);
    }

    fetchOrder();
  }, []);

  // ⭐ Cancel order in backend
  const handleCancelOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/orders/cancel/${order._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setShowCancel(false);
        setCancelReason("");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  // ⭐ Delete order from backend
  const handleDeleteOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/orders/${order._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        localStorage.removeItem("lastOrderId");
        const nextOrders = orders.filter((entry) => entry._id !== order._id);
        setOrders(nextOrders);
        setOrder(nextOrders[0] || null);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDeleteHistory = async (entryId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/orders/${entryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const nextOrders = orders.filter((entry) => entry._id !== entryId);
        setOrders(nextOrders);
        if (order?._id === entryId) {
          setOrder(nextOrders[0] || null);
          if (nextOrders[0]) localStorage.setItem("lastOrderId", nextOrders[0]._id);
          else localStorage.removeItem("lastOrderId");
        }
      }
    } catch (err) {
      console.error("Delete history failed:", err);
    }
  };

  const handleReorder = (entry) => {
    if (!entry?.items) return;

    const reordered = entry.items.map((item) => ({
      id: item.productId || item.id || item._id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      img: item.img,
    }));

    localStorage.setItem("rt_guest_cart", JSON.stringify(reordered));
    navigate("/checkout");
  };

  // ⭐ Progress Bar Logic
  const progressWidth = () => {
    if (!order) return "0%";
    if (order.status === "Cancelled") return "0%";

    const steps = {
      Ordered: "15%",
      Processing: "35%",
      Shipped: "65%",
      "Out for Delivery": "85%",
      Delivered: "100%",
    };

    return steps[order.status] || "15%";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-mist">
        <Header />
        <div className="mt-20 text-brand-navy">
          <Package size={48} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-mist">
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-40"
        >
          <AlertCircle size={60} className="text-brand-gold/50 mx-auto mb-4" />
          <p className="text-lg text-brand-navy font-semibold mb-6">
            No order found. Please place an order first.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-brand-navy text-brand-ivory rounded-full font-bold hover:shadow-lg transition"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
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
        className="relative bg-gradient-to-br from-brand-navy via-brand-purple to-brand-navy py-12 md:py-16 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-28 h-28 border-2 border-brand-gold/10 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-4 inline-flex items-center justify-center"
          >
            <Package size={40} className="text-brand-gold" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl font-serifFancy font-bold text-brand-ivory tracking-wide"
          >
            Order Status
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-brand-ivory/80 mt-4 text-lg"
          >
            Track your delivery in real-time
          </motion.p>

          {/* Status Badge */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className={`inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full font-bold text-sm ${
              order.status === "Cancelled"
                ? "bg-red-500/20 text-red-300 border border-red-400"
                : "bg-brand-gold/20 text-brand-gold border border-brand-gold"
            }`}
          >
            {order.status === "Cancelled" ? (
              <>
                <XCircle size={16} /> {order.status}
              </>
            ) : order.status === "Delivered" ? (
              <>
                <CheckCircle size={16} /> {order.status}
              </>
            ) : (
              <>
                <Clock size={16} /> {order.status}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      <section className="px-3 sm:px-5 md:px-8 py-6 md:py-8 max-w-[1440px] mx-auto">

        <div className="grid grid-cols-2 gap-2 mb-4 sm:mb-6" role="tablist" aria-label="Order views">
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === "recent"}
            onClick={() => setMobileView("recent")}
            className={`py-3 rounded-xl text-sm font-bold transition-all ${
              mobileView === "recent"
                ? "bg-brand-navy text-brand-ivory shadow-lg"
                : "bg-white text-brand-navy border border-brand-gold/30"
            }`}
          >
            Recent Order
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === "history"}
            onClick={() => setMobileView("history")}
            className={`py-3 rounded-xl text-sm font-bold transition-all ${
              mobileView === "history"
                ? "bg-brand-navy text-brand-ivory shadow-lg"
                : "bg-white text-brand-navy border border-brand-gold/30"
            }`}
          >
            Order History
          </button>
        </div>

        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${mobileView === "recent" ? "block" : "hidden"} w-full bg-white rounded-2xl shadow-xl border-2 border-brand-gold/20 p-4 sm:p-5 md:p-7`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-navy">Recent Order</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {order.status}
              </span>
            </div>

            <AnimatePresence>
              {order.status === "Cancelled" && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl border-2 border-red-400/50"
                >
                  <p className="text-red-600 font-bold mb-1">Order Cancelled</p>
                  <p className="text-red-500/80 text-sm"><b>Reason:</b> {order.cancelledReason}</p>
                  <p className="text-red-500/80 text-sm"><b>Cancelled At:</b> {new Date(order.cancelledAt).toLocaleString()}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl bg-brand-mist border border-brand-gold/15 p-3 sm:p-4">
                <p className="text-xs text-brand-charcoal/60 mb-1">Order ID</p>
                <p className="text-sm sm:text-base font-bold text-brand-navy font-mono">#{order._id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="rounded-xl bg-brand-mist border border-brand-gold/15 p-3 sm:p-4">
                <p className="text-xs text-brand-charcoal/60 mb-1">Customer</p>
                <p className="text-sm sm:text-base font-semibold text-brand-navy truncate">{order.customer?.name || "Customer"}</p>
              </div>

              <div className="rounded-xl bg-brand-mist border border-brand-gold/15 p-3 sm:p-4">
                <p className="text-xs text-brand-charcoal/60 mb-1">Placed</p>
                <p className="text-sm sm:text-base font-semibold text-brand-navy">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <div className="rounded-xl bg-brand-gold/10 border border-brand-gold/25 p-3 sm:p-4">
                <p className="text-xs text-brand-charcoal/60 mb-1">Total</p>
                <p className="text-lg sm:text-xl font-bold text-brand-gold">{currencySymbol}{convertPrice(order.totalINR)}</p>
              </div>
            </div>

            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-bold text-brand-navy mb-3">Items in this order</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item, index) => (
                    <div key={`${order._id}-recent-${index}`} className="flex items-center gap-3 p-2 rounded-xl bg-brand-mist border border-brand-gold/15">
                      {item.img ? (
                        <img src={item.img} alt={item.title || "Product"} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-brand-gold/20 bg-white" />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-brand-gold/10 flex items-center justify-center text-xs text-brand-navy font-semibold">No image</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-brand-navy truncate">{item.title || "Product"}</p>
                        <p className="text-xs text-brand-charcoal/60 mt-1">Qty: {item.quantity || 1}</p>
                        <p className="text-sm font-bold text-brand-gold mt-1">{currencySymbol}{convertPrice(item.price || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {order.status !== "Cancelled" && !["Shipped", "Out for Delivery", "Delivered"].includes(order.status) && (
                <button onClick={() => setShowCancel(true)} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold">Cancel</button>
              )}
              {order.status !== "Cancelled" && ["Ordered", "Processing", "Shipped", "Out for Delivery"].includes(order.status) && (
                <button onClick={() => setShowCancel(false)} className="bg-brand-navy text-brand-ivory px-4 py-2 rounded-xl font-bold">Track Order</button>
              )}
              {order.status === "Cancelled" && (
                <button onClick={() => handleReorder(order)} className="bg-brand-gold text-brand-navy px-4 py-2 rounded-xl font-bold">Order Again</button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${mobileView === "history" ? "block" : "hidden"} w-full bg-white rounded-2xl shadow-xl border-2 border-brand-gold/20 p-4 sm:p-5 md:p-7`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-navy">Order History</h2>
              <span className="text-sm text-brand-charcoal/70">{orders.length} total</span>
            </div>

            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
              {orders.map((entry) => {
                const previewItems = Array.isArray(entry.items) ? entry.items : [];

                return (
                  <div key={entry._id} className={`p-3 rounded-xl border ${entry._id === order?._id ? "border-brand-gold bg-brand-gold/10" : "border-brand-gold/20 bg-brand-mist"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-brand-navy text-sm">#{entry._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-brand-charcoal/60">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${entry.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {entry.status}
                      </span>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {previewItems.map((item, index) => (
                        <div key={`${entry._id}-${index}`} className="flex items-center gap-3">
                          {item.img ? (
                            <img
                              src={item.img}
                              alt={item.title || "Product"}
                              className="w-12 h-12 object-cover rounded-lg border border-brand-gold/20 bg-white"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-brand-gold/10 flex items-center justify-center text-[10px] text-brand-navy font-semibold">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-brand-navy leading-snug">{item.title || "Product"}</p>
                            <p className="text-[11px] text-brand-charcoal/60">
                              {item.quantity || 1} x {currencySymbol}{convertPrice(item.price || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-brand-charcoal/70">{entry.items?.length || 0} item(s)</span>
                      <span className="font-bold text-brand-gold">{currencySymbol}{convertPrice(entry.totalINR)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => { setOrder(entry); setMobileView("recent"); }} className="bg-brand-navy text-brand-ivory px-3 py-2 rounded-lg text-xs font-semibold">View</button>
                      {entry.status === "Cancelled" ? (
                        <>
                          <button onClick={() => handleReorder(entry)} className="bg-brand-gold text-brand-navy px-3 py-2 rounded-lg text-xs font-semibold">Order Again</button>
                          <button onClick={() => handleDeleteHistory(entry._id)} className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold">Delete</button>
                        </>
                      ) : (
                        <button onClick={() => { setOrder(entry); setMobileView("recent"); }} className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold">Track</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ORDER HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-brand-gold/20 p-5 mb-6"
        >
          <div className="grid md:grid-cols-4 gap-8">
            <div className="border-r border-brand-gold/20 pr-6">
              <p className="text-sm text-brand-charcoal/70 mb-2">Order ID</p>
              <p className="text-2xl font-bold text-brand-navy font-mono">{order._id.slice(-8).toUpperCase()}</p>
            </div>

            <div className="border-r border-brand-gold/20 pr-6">
              <p className="text-sm text-brand-charcoal/70 mb-2">Customer</p>
              <p className="text-lg font-semibold text-brand-navy">{order.customer?.name || "Customer"}</p>
            </div>

            {order.status !== "Cancelled" && (
              <div className="border-r border-brand-gold/20 pr-6">
                <p className="text-sm text-brand-charcoal/70 mb-2 flex items-center gap-2"><Calendar size={16} /> Order Date</p>
                <p className="text-lg font-semibold text-brand-navy">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            )}

            {order.status !== "Cancelled" && !["Cancelled"].includes(order.status) && (
              <div>
                <p className="text-sm text-brand-charcoal/70 mb-2 flex items-center gap-2"><MapPin size={16} /> Est. Delivery</p>
                <p className="text-lg font-semibold text-brand-gold">February 5, 2025</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* PROGRESS TRACKER */}
        {order.status !== "Cancelled" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl border-2 border-brand-gold/20 p-8 mb-8"
          >
            <h3 className="text-2xl font-bold text-brand-navy mb-8">Delivery Progress</h3>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-2 bg-brand-mist rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-gold to-brand-purple"
                  initial={{ width: 0 }}
                  animate={{ width: progressWidth() }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Status Steps */}
            <div className="grid grid-cols-5 gap-2">
              {["Ordered", "Processing", "Shipped", "Out for Delivery", "Delivered"].map(
                (step, idx) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`text-center p-3 rounded-2xl transition-all ${
                      ["Ordered", "Processing", "Shipped", "Out for Delivery", "Delivered"]
                        .indexOf(order.status) >= idx
                        ? "bg-brand-gold/20 border-2 border-brand-gold text-brand-gold"
                        : "bg-brand-mist border-2 border-brand-mist/30 text-brand-charcoal/50"
                    }`}
                  >
                    <p className="text-xs font-bold">{step}</p>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}

        {(order.shippingAddress || order.customer) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-3xl shadow-xl border-2 border-brand-gold/20 p-8 mb-8"
          >
            <h3 className="text-2xl font-bold text-brand-navy mb-6">Shipping Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-brand-charcoal/70 mb-2">Customer</p>
                <p className="text-lg font-semibold text-brand-navy">{order.customer?.name || order.shippingAddress?.firstName + " " + (order.shippingAddress?.lastName || "")}</p>
                <p className="text-brand-charcoal/70">{order.customer?.email}</p>
                <p className="text-brand-charcoal/70">{order.customer?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-brand-charcoal/70 mb-2">Shipping Address</p>
                <p className="text-brand-navy font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                <p className="text-brand-charcoal/70">{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p className="text-brand-charcoal/70">{order.shippingAddress.addressLine2}</p>}
                <p className="text-brand-charcoal/70">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                <p className="text-brand-charcoal/70">{order.shippingAddress?.country}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ORDER ITEMS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-brand-gold/20 p-8 mb-8"
        >
          <h3 className="text-2xl font-bold text-brand-navy mb-6">Order Items</h3>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-brand-mist to-brand-ivory rounded-2xl border border-brand-gold/20 hover:border-brand-gold/40 transition"
              >
                <div className="flex-1">
                  <p className="font-bold text-brand-navy text-lg">{item.title}</p>
                  <p className="text-sm text-brand-charcoal/60">
                    Quantity: <span className="font-semibold">{item.quantity}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-gold">
                    {currencySymbol}
                    {convertPrice(item.price)}
                  </p>
                  <p className="text-xs text-brand-charcoal/60">
                    × {item.quantity}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ORDER TOTAL */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-gradient-to-r from-brand-gold/10 to-brand-purple/10 rounded-2xl border-2 border-brand-gold/30"
          >
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-brand-navy">Total Amount</p>
              <p className="text-4xl font-bold text-brand-gold">
                {currencySymbol}
                {convertPrice(order.totalINR)}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Cancel Button - Only if order is NOT cancelled and NOT shipped */}
          {order.status !== "Cancelled" &&
            !["Shipped", "Out for Delivery", "Delivered"].includes(order.status) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCancel(true)}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition flex items-center justify-center gap-2"
              >
                <XCircle size={20} /> Cancel Order
              </motion.button>
            )}

          {/* Delete Order History - Only appears AFTER cancellation */}
          {order.status === "Cancelled" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <Trash2 size={20} /> Delete Order History
            </motion.button>
          )}

          {/* Back to Shopping */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-brand-gold to-brand-purple text-brand-navy rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-gold/30 transition"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </section>

      {/* CANCEL MODAL */}
      <AnimatePresence>
        {showCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border-2 border-brand-gold/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={28} className="text-red-500" />
                <h2 className="text-2xl font-bold text-brand-navy">Cancel Order</h2>
              </div>

              <p className="text-brand-charcoal mb-6">
                Please select a reason for cancellation:
              </p>

              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border-2 border-brand-gold/30 rounded-xl mb-6 focus:outline-none focus:border-brand-gold text-brand-navy font-medium"
              >
                <option value="">-- Select Reason --</option>
                {cancellationReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCancel(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-mist text-brand-navy font-bold border-2 border-brand-mist hover:bg-brand-mist/70 transition"
                >
                  Close
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelOrder}
                  disabled={!cancelReason}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE ORDER CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border-2 border-red-500/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={28} className="text-red-600" />
                <h2 className="text-2xl font-bold text-brand-navy">Delete Order History?</h2>
              </div>

              <p className="text-brand-charcoal mb-2">
                Are you sure you want to permanently delete this order from your history?
              </p>
              <p className="text-sm text-brand-charcoal/60 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-mist text-brand-navy font-bold border-2 border-brand-mist hover:bg-brand-mist/70 transition"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteOrder}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold hover:shadow-lg hover:shadow-red-600/30 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
