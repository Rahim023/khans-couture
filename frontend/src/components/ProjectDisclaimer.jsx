import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Info, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { Link } from "react-router-dom";

const demoAdminEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL;
const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD;

const features = [
  "Browse clothing collections and product details.",
  "Explore the cart, checkout, wishlist, and order-tracking flows.",
  "Try custom-order, contact, and newsletter features.",
  "View the protected admin dashboard for product, order, customer, and custom-order management.",
];

export default function ProjectDisclaimer() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-disclaimer-title"
        aria-describedby="project-disclaimer-description"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-brand-gold/40 bg-brand-off-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close project disclaimer"
          className="absolute right-4 top-4 rounded-full p-2 text-brand-charcoal transition hover:bg-brand-gold/15 focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <X size={20} />
        </button>

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-navy">
          <Info size={25} aria-hidden="true" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">
          Project disclaimer
        </p>
        <h1
          id="project-disclaimer-title"
          className="mb-3 pr-8 font-serifFancy text-2xl font-bold text-brand-navy sm:text-3xl"
        >
          Welcome to Khan&apos;s Couture
        </h1>
        <p
          id="project-disclaimer-description"
          className="mb-6 text-sm leading-6 text-brand-charcoal"
        >
          This website is a project made by Abdul Rahim. You can explore the
          shopping experience and its features; some actions may use demo or
          live services.
        </p>

        <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-brand-navy">
            <ShoppingBag size={18} aria-hidden="true" />
            What you can explore
          </h2>
          <ul className="space-y-2 text-sm leading-5 text-brand-charcoal">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-brand-gold-dark">
                  &bull;
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6 flex gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-4">
          <Clock3 className="mt-0.5 shrink-0 text-brand-navy" size={19} aria-hidden="true" />
          <p className="text-sm leading-5 text-brand-charcoal">
            Please wait a moment if a page or action takes time. The backend
            service may need a little while to wake up and respond.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-brand-gold/30 bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-brand-navy">
            <ShieldCheck size={18} aria-hidden="true" />
            Explore the admin dashboard
          </h2>
          {demoAdminEmail && demoAdminPassword ? (
            <>
              <p className="mb-3 text-sm text-brand-charcoal">
                Use these demo credentials to sign in and explore the admin features:
              </p>
              <dl className="space-y-1 break-all text-sm text-brand-charcoal">
                <div><dt className="inline font-semibold">Email: </dt><dd className="inline">{demoAdminEmail}</dd></div>
                <div><dt className="inline font-semibold">Password: </dt><dd className="inline">{demoAdminPassword}</dd></div>
              </dl>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mt-3 inline-block text-sm font-semibold text-brand-navy underline underline-offset-4 hover:text-brand-brown-light"
              >
                Go to admin sign in
              </Link>
            </>
          ) : (
            <p className="text-sm text-brand-charcoal">
              Admin demo sign-in details are not currently available.
            </p>
          )}
        </div>

        <button
          type="button"
          autoFocus
          onClick={() => setIsOpen(false)}
          className="w-full rounded-xl bg-brand-navy px-5 py-3 font-semibold text-brand-ivory transition hover:bg-brand-brown-light focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
        >
          I understand, continue
        </button>
      </motion.section>
    </div>
  );
}
