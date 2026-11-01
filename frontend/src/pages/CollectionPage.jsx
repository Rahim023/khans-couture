import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Gem, Heart, PackageSearch, ShoppingBag, Sparkles } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCurrency } from "../context/CurrencyContext";

export default function CollectionPage({ mode = "products" }) {
  const isSignature = mode === "signature";
  const navigate = useNavigate();
  const { convertPrice, country } = useCurrency();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = country === "Canada" ? "CA$" : country === "USA" ? "US$" : "₹";
  const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

  useEffect(() => {
    const endpoint = isSignature ? "/api/signatures" : "/api/products";
    fetch(`${API_BASE}${endpoint}`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [API_BASE, isSignature]);

  const openItem = (item) => {
    if (isSignature) navigate(`/signature/${item.slug || item._id || item.id}`);
    else navigate(`/product/${item._id || item.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f3ea] font-sansTrend">
      <Header />
      <section className="relative overflow-hidden bg-brand-navy px-5 py-16 text-brand-ivory sm:px-8 md:px-16 md:py-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <button onClick={() => navigate(-1)} className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-brand-gold transition hover:-translate-x-1">
            <ArrowLeft size={17} /> Back
          </button>
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.32em] text-brand-gold">
                {isSignature ? <Gem size={16} /> : <Sparkles size={16} />} Khan's Couture
              </p>
              <h1 className="max-w-4xl font-serifFancy text-5xl font-bold leading-none md:text-7xl">
                {isSignature ? "The Signature Collection" : "The Complete Collection"}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-brand-ivory/75 md:text-lg">
                {isSignature ? "Rare finishes, considered details and pieces created to be remembered." : "Explore timeless silhouettes designed for every occasion and every personal style."}
              </p>
            </div>
            <PackageSearch className="hidden h-20 w-20 text-brand-gold/30 md:block" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:px-16 md:py-16">
        {loading ? (
          <div className="py-24 text-center text-brand-navy/60">Preparing the collection...</div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-brand-gold/20 bg-white py-20 text-center">
            <h2 className="font-serifFancy text-3xl font-bold text-brand-navy">The collection is resting</h2>
            <p className="mt-3 text-brand-charcoal/60">Please check back soon.</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {items.map((item, index) => {
              const image = item.images?.[0] || item.img || "";
              const title = item.title || item.name || "Khan's Couture Piece";
              return (
                <motion.article
                  key={item._id || item.id || index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  className="group grid overflow-hidden rounded-[28px] border border-[#e7dcc9] bg-white shadow-[0_18px_50px_rgba(62,45,30,.08)] md:grid-cols-[42%_58%]"
                >
                  <button onClick={() => openItem(item)} className="relative min-h-[360px] overflow-hidden bg-[#eee5d7] text-left md:min-h-[430px]">
                    <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full bg-brand-ivory/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy">
                      {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                  </button>
                  <div className="flex flex-col justify-center p-7 sm:p-9 md:p-12">
                    <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9a805a]">
                      {isSignature ? <Gem size={14} /> : <Sparkles size={14} />}
                      {isSignature ? (item.tagline || "Signature Piece") : (item.section || "Khan's Couture")}
                    </div>
                    <h2 className="font-serifFancy text-4xl font-bold leading-tight text-brand-navy md:text-5xl">{title}</h2>
                    <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-brand-charcoal/70 md:text-base">
                      {item.description || "A beautifully balanced piece, selected for exceptional fabric, graceful proportion and considered finishing."}
                    </p>
                    {Number(item.price) > 0 && (
                      <p className="mt-6 text-2xl font-bold text-[#a66f2d]">{currency} {convertPrice(item.price)}</p>
                    )}
                    <button
                      onClick={() => openItem(item)}
                      className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-brand-navy px-6 py-3.5 text-sm font-bold text-brand-gold shadow-lg shadow-brand-navy/10 transition hover:-translate-y-0.5 hover:bg-[#5b0c0c]"
                    >
                      <ShoppingBag size={17} /> View {isSignature ? "Signature Piece" : "Product"} <ArrowRight size={17} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
