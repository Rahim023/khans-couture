import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaCommentDots,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { ArrowLeft, LogOut, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCart } from "../pages/CartContext.jsx";
import { useWishlist } from "../pages/WishlistContext";
import { useCurrency } from "../context/CurrencyContext";

import SupportChat from "../components/SupportChat";
import SearchModal from "./searchModal.jsx";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showChat, setShowChat] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY;

      if (currentScrollY < 24) {
        setNavbarHidden(false);
      } else if (difference > 6) {
        setNavbarHidden(true);
        setMenuOpen(false);
      } else if (difference < -6) {
        setNavbarHidden(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const { country, setCountry } = useCurrency();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const itemCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const wishlistCount = wishlist?.length || 0;

  const showBack = location.pathname !== "/";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Kurtis", path: "/kurtis" },
    { name: "Wedding", path: "/wedding" },
    { name: "Signature", path: "/signature" },
    { name: "Discover", path: "/discover" },
    { name: "Orders", path: "/orders" },
  ];

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <motion.div
        animate={{ y: navbarHidden ? -36 : 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 28 }}
        className="
          fixed top-0 left-0 w-full z-[60]
          bg-black/60
          backdrop-blur-md
          text-[#f3e6d0]
          text-center
          text-[11px]
          sm:text-xs
          tracking-[3px]
          uppercase
          py-2
        "
      >
        Complimentary Shipping on Your First Order
      </motion.div>

      {/* HEADER */}
      <motion.header
        animate={{ y: navbarHidden ? -180 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 30 }}
        className="
          fixed top-[32px] left-0 w-full z-50
          bg-transparent
          hover:bg-[#f1eae2]/20
          transition-all duration-500 ease-in-out
          backdrop-blur-[2px]
          hover:backdrop-blur-xl
          border-b border-transparent
          hover:border-[#1a1a1a]
          group
        "
      >
        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />

        {/* TOP ROW */}
        <div className="relative flex items-center justify-between px-2 h-[72px] sm:px-8 sm:h-[82px] lg:px-14">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {/* BACK BUTTON */}
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="
                  text-[#590f0f]
                  hover:text-[#590f0f]
                  transition-all duration-300
                "
              >
                <ArrowLeft size={20} />
              </button>
            )}

            {/* COUNTRY */}
            <select
              className="
                hidden sm:block
                bg-white/10
                border border-white/20
                text-white
                px-4 py-2
                rounded-full
                text-sm
                backdrop-blur-md
                outline-none
              "
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="Canada" className="text-black">
                Canada
              </option>

              <option value="USA" className="text-black">
                USA
              </option>

              <option value="India" className="text-black">
                India
              </option>
            </select>
          </div>

          {/* LOGO */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2"
          >
            <img
              src="/images/kclogo.png"
              alt="Khan Couture"
              className="
                h-[48px]
                sm:h-[68px]
                object-contain
                transition-all duration-500
                group-hover:scale-[1.03]
              "
            />
          </Link>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2 sm:gap-5">

            {/* SEARCH */}
            <FaSearch
              size={17}
              className="
                cursor-pointer
                text-[#590f0f]
                hover:text-[#590f0f]
                transition-all duration-300
              "
              onClick={() => setShowSearch(true)}
            />

            {/* WISHLIST */}
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/wishlist")}
            >
              <FaHeart
                size={17}
                className="
                  text-[#590f0f]
                  hover:text-[#590f0f]
                  transition-all duration-300
                "
              />

              {wishlistCount > 0 && (
                <span
                  className="
                    absolute -top-2 -right-2
                    bg-[#c19a6b]
                    text-white
                    text-[10px]
                    min-w-[18px]
                    h-[18px]
                    flex items-center justify-center
                    rounded-full
                    font-semibold
                  "
                >
                  {wishlistCount}
                </span>
              )}
            </div>

            {/* CART */}
            <Link to="/cart" className="relative">
              <FaShoppingCart
                size={17}
                className="
                  text-[#590f0f]
                  hover:text-[#590f0f]
                  transition-all duration-300
                "
              />

              {itemCount > 0 && (
                <span
                  className="
                    absolute -top-2 -right-2
                    bg-[#c19a6b]
                    text-white
                    text-[10px]
                    min-w-[18px]
                    h-[18px]
                    flex items-center justify-center
                    rounded-full
                    font-semibold
                  "
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* CHAT */}
            <FaCommentDots
              size={17}
              className="
                hidden sm:block
                cursor-pointer
                text-[#590f0f]
                hover:text-[#590f0f]
                transition-all duration-300
              "
              onClick={() => setShowChat(true)}
            />

            {/* USER */}
            {!user ? (
              <FaUser
                size={17}
                className="
                  hidden sm:block
                  cursor-pointer
                  text-[#590f0f]
                  hover:text-[#590f0f]
                  transition-all duration-300
                "
                onClick={() => navigate("/login")}
              />
            ) : (
              <button
                onClick={handleLogout}
                className="
                  hidden sm:block
                  group/logout
                  items-center
                  gap-2
                  px-3 py-2
                  text-[#590f0f]
                  border border-[#590f0f]/20
                  rounded-full
                  bg-white/40
                  hover:bg-[#590f0f]
                  hover:text-white
                  hover:border-[#590f0f]
                  shadow-sm
                  transition-all duration-300
                "
              >
                <span className="flex items-center gap-2 text-xs uppercase tracking-[1.5px]">
                  <LogOut size={15} />
                  Sign out
                </span>
              </button>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              className="
                sm:hidden
                relative
                w-10 h-10
                flex items-center justify-center
                rounded-full
                text-[#590f0f]
                bg-white/70
                border border-[#590f0f]/15
                shadow-[0_8px_24px_rgba(89,15,15,0.12)]
                backdrop-blur-md
                transition-all duration-300
                active:scale-95
              "
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <motion.span
                animate={{ rotate: menuOpen ? 90 : 0, scale: menuOpen ? 0.9 : 1 }}
                className="flex"
              >
                {menuOpen ? <FaTimes size={17} /> : <FaBars size={17} />}
              </motion.span>
            </button>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden sm:flex justify-center border-t border-white/10">
          <ul className="flex items-center gap-10 relative">

            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              return (
                <li key={link.path} className="relative py-5">

                  <Link
                    to={link.path}
                    className={`
                      relative
                      text-[14px]
                      uppercase
                      tracking-[2px]
                      transition-all duration-300
                      ${
                        active
                          ? "text-[#590f0f]"
                          : "text-[#590f0f] hover:text-[#590f0f]"
                      }
                    `}
                  >
                    {link.name}

                    {/* ANIMATED UNDERLINE */}
                    {active && (
                      <motion.div
                        layoutId="navbar-underline"
                        className="
                          absolute
                          left-0
                          right-0
                          -bottom-[20px]
                          h-[2px]
                          bg-[#c19a6b]
                          rounded-full
                        "
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -12 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="
                sm:hidden
                overflow-hidden
                bg-[#f8f3ed]/95
                backdrop-blur-xl
                border-t border-[#590f0f]/10
                shadow-[0_18px_40px_rgba(44,20,20,0.18)]
                px-5 py-5
              "
            >
              <div className="space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={`
                        flex items-center justify-between
                        px-4 py-3
                        rounded-2xl
                        text-[13px]
                        tracking-[2px]
                        uppercase
                        transition-all duration-300
                        ${
                          location.pathname === link.path
                            ? "bg-[#590f0f] text-white shadow-[0_8px_20px_rgba(89,15,15,0.18)]"
                            : "text-[#590f0f] hover:bg-[#590f0f]/10"
                        }
                      `}
                    >
                      <span>{link.name}</span>
                      <span className="text-[10px] opacity-50">0{index + 1}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* LOGIN / LOGOUT */}
              <div className="pt-4 mt-3 border-t border-[#590f0f]/10">
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowChat(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#590f0f]/15 bg-white text-[#590f0f] text-xs uppercase tracking-[1.5px]"
                  >
                    <FaCommentDots size={15} />
                    Support
                  </button>
                  <select
                    aria-label="Select currency region"
                    className="rounded-2xl border border-[#590f0f]/15 bg-white px-3 py-3 text-[#590f0f] outline-none text-xs"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="Canada">Canada</option>
                    <option value="USA">USA</option>
                    <option value="India">India</option>
                  </select>
                </div>
                {!user ? (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="
                      w-full
                      flex items-center justify-center gap-2
                      py-3.5
                      rounded-full
                      bg-[#590f0f] text-white
                      shadow-[0_10px_24px_rgba(89,15,15,0.20)]
                      tracking-[2px]
                      uppercase
                      transition-all duration-300
                    "
                  >
                    <UserRound size={16} />
                    Login
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="
                      w-full
                      flex items-center justify-center gap-2
                      py-3.5
                      rounded-full
                      bg-[#fffafa]
                      border border-[#590f0f]/15
                      text-[#590f0f]
                      tracking-[2px]
                      uppercase
                      shadow-sm
                      hover:bg-[#590f0f] hover:text-white
                      transition-all duration-300
                    "
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* MODALS */}
      {showChat && (
        <SupportChat onClose={() => setShowChat(false)} />
      )}

      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} />
      )}
    </>
  );
}