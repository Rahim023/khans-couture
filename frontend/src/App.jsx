import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// 🔹 Context Providers
import { CartProvider } from "./pages/CartContext";
import { WishlistProvider } from "./pages/WishlistContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import ProjectDisclaimer from "./components/ProjectDisclaimer";


// 🔹 Styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 🔹 Pages
import ProductPage from "./pages/Productpage";
import SignatureProductPage from "./pages/SignatureProductPage";
import Home from "./pages/Home";
import Kurtis from "./pages/Kurtis";
import Wedding from "./pages/Wedding";
import Signature from "./pages/Signature";
import Discover from "./pages/Discover";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// ⭐ NEW IMPORTS ⭐
import PaymentMethod from "./pages/PaymentMethod";
import PaymentSuccess from "./pages/PaymentSuccess";
import ReturnPolicy from "./pages/ReturnPolicy";
import Shipping from "./pages/Shipping";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import OurStory from "./pages/OurStory";
import AdminCustomOrders from "./pages/AdminCustomOrders";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import CollectionPage from "./pages/CollectionPage";

function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const frameId = window.requestAnimationFrame(scrollToTop);
    const timeoutId = window.setTimeout(scrollToTop, 50);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname, search, hash, key]);

  return null;
}

export default function App() {
  return (
    <CurrencyProvider>
    <CartProvider>
      <WishlistProvider>
        <Router>
          <ProjectDisclaimer />
          <ScrollToTop />
          <Routes>
            {/* 🔹 Home */}
            <Route path="/" element={<Home />} />

            {/* 🔹 Kurtis */}
            <Route path="/kurtis" element={<Kurtis />} />

            {/* 🔹 Main Sections */}
            <Route path="/wedding" element={<Wedding />} />
            <Route path="/signature" element={<Signature />} />
            <Route path="/discover" element={<Discover />} />

            {/* 🔹 Women Subcategories */}
           
            <Route path="/product/:id" element={<ProductPage />} />


            {/* 🔹 Cart + Checkout */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* ⭐ NEW PAYMENT ROUTES ⭐ */}
            <Route path="/payment/:orderId" element={<PaymentMethod />} />
            <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />

            {/* ⭐ ORDERS PAGE — FIXED ⭐ */}
            <Route path="/orders" element={<OrderStatus />} />

            {/* 🔹 Detailed order tracking */}
            <Route path="/order-status/:orderId" element={<OrderStatus />} />
            <Route path="/order-status" element={<OrderStatus />} />

            {/* 🔹 Wishlist */}
            <Route path="/wishlist" element={<Wishlist />} />

            {/* 🔹 Static informational pages */}
            <Route path="/returns" element={<ReturnPolicy />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/our-story" element={<OurStory />} />

            {/* Admin */}
            <Route path="/admin/custom-orders" element={<AdminCustomOrders />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 🔹 Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />


            {/* 🔹 Signature Series */}
            <Route path="/products" element={<CollectionPage mode="products" />} />
            <Route path="/signature-collection" element={<CollectionPage mode="signature" />} />
            <Route path="/signature-series" element={<CollectionPage mode="signature" />} />
            <Route path="/signature/:slug" element={<SignatureProductPage />} />

            {/* 🔹 404 Page */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center h-screen text-center">
                  <h1 className="text-3xl font-bold text-red-600">
                    404 – Page Not Found
                  </h1>
                </div>
              }
            />
          </Routes>
        </Router>
      </WishlistProvider>
    </CartProvider>
    </CurrencyProvider>
  );
}
