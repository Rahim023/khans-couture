import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTwitter, FaCcVisa, FaCcMastercard, FaShoppingBag, FaTag, FaQuestionCircle, FaInfoCircle, FaEnvelope, FaShippingFast, FaUndo } from "react-icons/fa";

const sections = [
  {
    title: "Shop",
    items: [
      { label: "Kurtis", to: "/kurtis" },
      { label: "Wedding", to: "/wedding" },
      { label: "Signature", to: "/signature" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "Contact Us", to: "/contact" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Our Story", to: "/our-story" },
      { label: "Careers", to: "/" },
      { label: "Sustainability", to: "/" },
    ],
  },
  {
    title: "Follow Us",
    items: [
      { label: "Instagram", to: "https://instagram.com" },
      { label: "Facebook", to: "https://facebook.com" },
      { label: "Twitter", to: "https://twitter.com" },
    ],
  },
];

export default function Footer() {
  const [open, setOpen] = useState({});

  const toggle = (title) => setOpen((s) => ({ ...s, [title]: !s[title] }));

  return (
    <footer className="w-full py-12" style={{ fontFamily: "'Poppins', sans-serif", background: '#23110b', color: '#efe6d0' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8">
        {sections.map((sec) => (
          <div key={sec.title}>
            <button
              onClick={() => toggle(sec.title)}
              className="w-full flex items-center justify-between mb-4 text-lg font-bold md:cursor-default"
              aria-expanded={!!open[sec.title]}
              style={{ color: '#efe6d0' }}
            >
              <span className="flex items-center gap-3">
                <span className="text-brand-gold text-xl">{getIconFor(sec.title)}</span>
                <span>{sec.title}</span>
              </span>
              <span className={`md:hidden text-brand-ivory/80 transition-transform ${open[sec.title] ? 'rotate-180' : ''}`}>▾</span>
            </button>

            <ul className={`space-y-2 text-sm ${open[sec.title] ? 'block' : 'hidden md:block'}`}>
              {sec.items.map((it) => {
                const icon = getIconFor(it.label);
                const content = (
                  <span className="flex items-center gap-3">
                    <span className="text-brand-gold text-lg">{icon}</span>
                    <span className="text-sm">{it.label}</span>
                  </span>
                );

                return (
                  <li key={it.label}>
                    {it.to.startsWith("/") ? (
                      <Link to={it.to} className="inline-flex items-center gap-3 p-2 rounded transition-transform transform hover:translate-x-1" style={{ color: '#efe6d0' }}>
                        {content}
                      </Link>
                    ) : (
                      <a href={it.to} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 p-2 rounded transition-transform transform hover:translate-x-1" style={{ color: '#efe6d0' }}>
                        {content}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-brand-ivory/20 pt-6">
        <div className="flex items-center gap-4 text-sm opacity-90">
          <span>© 2025 Khan's Couture.</span>
          <span className="hidden md:inline">All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full transition-transform hover:scale-110" style={{ background: 'transparent' }}>
            <span style={{ display: 'inline-flex', padding: 6, borderRadius: 9999, transition: 'transform .18s', background: 'transparent' }} className="hover:bg-[#efe6d0]/15 hover:text-[#23110b]">
              <FaInstagram />
            </span>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-full transition-transform hover:scale-110" style={{ background: 'transparent' }}>
            <span style={{ display: 'inline-flex', padding: 6, borderRadius: 9999 }} className="hover:bg-[#efe6d0]/15 hover:text-[#23110b]">
              <FaFacebookF />
            </span>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-full transition-transform hover:scale-110" style={{ background: 'transparent' }}>
            <span style={{ display: 'inline-flex', padding: 6, borderRadius: 9999 }} className="hover:bg-[#efe6d0]/15 hover:text-[#23110b]">
              <FaTwitter />
            </span>
          </a>
        </div>

        <div className="flex items-center gap-3 opacity-80" style={{ color: '#efe6d0' }}>
          <FaCcVisa />
          <FaCcMastercard />
        </div>
      </div>
    </footer>
  );
}

function getIconFor(label) {
  const key = label.toLowerCase();
  if (key.includes("kurtis") || key.includes("wedding") || key.includes("signature")) return <FaShoppingBag />;
  if (key.includes("contact") || key.includes("email")) return <FaEnvelope />;
  if (key.includes("shipping")) return <FaShippingFast />;
  if (key.includes("return") || key.includes("returns")) return <FaUndo />;
  if (key.includes("faq") || key.includes("help")) return <FaQuestionCircle />;
  if (key.includes("our story") || key.includes("about")) return <FaInfoCircle />;
  return <FaTag />;
}
