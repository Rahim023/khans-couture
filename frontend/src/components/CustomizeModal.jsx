import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaintBrush,
  FaRulerCombined,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaImage,
  FaGem,
  FaFeatherAlt,
  FaRegStickyNote,
  FaHeartbeat,
  FaStar,
} from "react-icons/fa";
import { postCustomOrder } from "../services/customOrderApi";

const sizeChart = [
  ["", "XS", "S", "M", "L", "XL"],
  ["Bust", "36", "37", "39", "41", "43"],
  ["Waist", "31", "35", "37", "39", "41"],
  ["Hip", "38", "41", "43", "45", "47"],
  ["Shoulder", "13", "14", "14.5", "15", "15.5"],
  ["Armhole", "16", "18", "18.5", "19", "19.5"],
  ["Length", "45", "45", "45", "45", "45"],
];

const InputField = ({ icon, label, ...props }) => (
  <label className="group block text-sm font-medium text-[#2a1a0f]">
    <span className="inline-flex items-center gap-2 mb-2 text-[#4d3528]">
      {icon}
      {label}
    </span>
    <input
      {...props}
      className="w-full rounded-2xl border border-[#d9cbb4] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3b2921] outline-none transition focus:border-[#a77b4d] focus:ring-2 focus:ring-[#e6d4bc]"
    />
  </label>
);

const TextAreaField = ({ icon, label, ...props }) => (
  <label className="group block text-sm font-medium text-[#2a1a0f]">
    <span className="inline-flex items-center gap-2 mb-2 text-[#4d3528]">
      {icon}
      {label}
    </span>
    <textarea
      {...props}
      className="w-full rounded-2xl border border-[#d9cbb4] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3b2921] outline-none transition focus:border-[#a77b4d] focus:ring-2 focus:ring-[#e6d4bc]"
      rows="4"
    />
  </label>
);

export default function CustomizeModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState("Single Order");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    outfitType: "Kurti",
    color: "",
    budget: "",
    deliveryDate: "",
    fabricPreference: "",
    embroideryDetails: "",
    specialInstructions: "",
    weddingPieces: 1,
    weddingNotes: "",
    measurements: {
      chest: "",
      waist: "",
      hip: "",
      shoulder: "",
      sleeveLength: "",
      armhole: "",
      shirtLength: "",
      trouserLength: "",
    },
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const imagePreviewsRef = useRef([]);

  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("m_")) {
      const key = name.replace("m_", "");
      setForm((current) => ({
        ...current,
        measurements: { ...current.measurements, [key]: value },
      }));
    } else {
      setForm((current) => ({ ...current, [name]: value }));
    }
  };

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"));
    imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const previews = selectedFiles.slice(0, 8).map((file) => URL.createObjectURL(file));
    setImages(selectedFiles.slice(0, 8));
    setImagePreviews(previews);
    imagePreviewsRef.current = previews;
  };

  const validateStep = () => {
    if (step === 1) return true;
    const required = ["fullName", "email", "phone", "address", "color", "budget", "deliveryDate"];
    for (const key of required) {
      if (!form[key]) return false;
    }
    if (orderType === "Wedding Order" && !form.weddingPieces) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("orderType", orderType);
      Object.entries(form).forEach(([key, value]) => {
        if (key === "measurements") {
          fd.append("measurements", JSON.stringify(value));
        } else {
          fd.append(key, value);
        }
      });
      images.forEach((file) => fd.append("designImages", file));

      await postCustomOrder(fd);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to submit your request at this time.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center px-0 py-0 sm:items-center sm:px-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Customize Your Outfit"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl max-h-[92dvh] overflow-hidden rounded-t-[28px] border border-[#e8dcc8] bg-[#fffdf7] shadow-[0_40px_120px_rgba(16,16,16,0.22)] sm:max-h-[85vh] sm:rounded-[32px]"
      >
        <div className="flex items-center justify-between gap-3 bg-[#130b07] px-5 py-5 text-white sm:px-8 sm:py-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#d7bea3]">Custom Couture</p>
            <h2 className="mt-1 text-xl font-serif font-semibold tracking-tight sm:mt-2 sm:text-3xl">Customize Your Outfit</h2>
          </div>
          <button type="button" aria-label="Close customize form" onClick={onClose} className="shrink-0 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20">
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[calc(92dvh-84px)] overflow-y-auto px-4 py-5 sm:max-h-[72vh] sm:px-10 sm:py-6">
          {step === 1 ? (
          <div className="grid gap-4 py-2 sm:grid-cols-2 sm:px-6 sm:py-6">
            <div className="rounded-[20px] bg-[#f8f0e7] p-5 shadow-sm ring-1 ring-[#e6d5be]/70 sm:rounded-[28px] sm:p-8">
              <div className="flex items-center gap-3 text-[#7b5f48] mb-4">
                <FaHeartbeat className="h-6 w-6 text-[#a37c50]" />
                <span className="text-sm uppercase tracking-[0.25em]">Single Order</span>
              </div>
              <p className="text-sm leading-relaxed text-[#3d2a20]">Perfect for personal outfits, one-off designs and premium tailoring.</p>
              <div className="mt-6 text-sm text-[#5f4a3f]">Ideal for bespoke kurti, dress, co-ord or western style with your own palette and measurements.</div>
              <button
                onClick={() => {
                  setOrderType("Single Order");
                  setStep(2);
                }}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#2e190d] px-5 py-3 text-sm font-semibold text-[#f7e7cf] transition hover:bg-[#4f3727]"
              >
                Start Single Order
              </button>
            </div>

            <div className="rounded-[20px] bg-[#fff7ed] p-5 shadow-sm ring-1 ring-[#efd2b2]/70 sm:rounded-[28px] sm:p-8">
              <div className="flex items-center gap-3 text-[#845f3a] mb-4">
                <FaGem className="h-6 w-6 text-[#b1845c]" />
                <span className="text-sm uppercase tracking-[0.25em]">Wedding Order</span>
              </div>
              <p className="text-sm leading-relaxed text-[#3d2a20]">Book a luxury wedding outfit with custom embroidery, multiple pieces, and bridal dream detailing.</p>
              <div className="mt-6 text-sm text-[#6d563f]">Includes extra options for wedding notes, piece count and event-ready styling.</div>
              <button
                onClick={() => {
                  setOrderType("Wedding Order");
                  setStep(2);
                }}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#8a6337] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a0784d]"
              >
                Start Wedding Order
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 py-2 sm:px-6 sm:py-6">
            <div className="grid gap-6 rounded-[32px] border border-[#e2d1bb] bg-[#fffaf3] p-6 shadow-sm sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-semibold text-[#2b1810]">{orderType}</h3>
                <p className="text-sm leading-relaxed text-[#5c4736]">Share your design vision, measurements, and fabric preferences to get a custom-tailored creation delivered on time.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-3xl bg-[#f7ede1] p-4 text-[#4b372b] shadow-inner">
                  <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[#846a53]">
                    <FaPaintBrush /> Outfit Style
                  </div>
                  <div className="mt-2 text-lg font-semibold">{form.outfitType}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-[#5b4738]">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#947b60]">Budget</div>
                    <div className="mt-2 text-lg font-semibold">{form.budget || "--"}</div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#947b60]">Delivery</div>
                    <div className="mt-2 text-lg font-semibold">{form.deliveryDate || "--"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField icon={<FaEnvelope />} label="Full Name*" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" />
              <InputField icon={<FaPhone />} label="Email Address*" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" type="email" />
              <InputField icon={<FaMapMarkerAlt />} label="Phone Number*" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 890" />
              <InputField icon={<FaMapMarkerAlt />} label="Address*" name="address" value={form.address} onChange={handleChange} placeholder="Your delivery address" />
              <label className="block text-sm font-medium text-[#2a1a0f]">
                <span className="inline-flex items-center gap-2 mb-2 text-[#4d3528]">
                  <FaPaintBrush /> Outfit Type*
                </span>
                <select
                  name="outfitType"
                  value={form.outfitType}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#d9cbb4] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3b2921] outline-none transition focus:border-[#a77b4d] focus:ring-2 focus:ring-[#e6d4bc]"
                >
                  <option>Bridal Lehenga</option>
                  <option>Embroidered Suit</option>
                  <option>Kurti</option>
                  <option>Co-Ord Set</option>
                  <option>Western Dress</option>
                  <option>Other</option>
                </select>
              </label>
              <InputField icon={<FaGem />} label="Preferred Color*" name="color" value={form.color} onChange={handleChange} placeholder="E.g. rose gold, ivory" />
              <InputField icon={<FaMoneyBillWave />} label="Budget*" name="budget" value={form.budget} onChange={handleChange} placeholder="Your budget range" />
              <InputField icon={<FaCalendarAlt />} label="Expected Delivery Date*" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} type="date" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[28px] border border-[#e6d2b7] bg-[#fff4ea] p-5 shadow-sm">
                <div className="flex items-center gap-3 text-[#6b4e34] mb-4 text-sm uppercase tracking-[0.25em]">
                  <FaRulerCombined className="h-5 w-5" />
                  Size Reference Chart
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm text-[#493324]">
                    <tbody>
                      {sizeChart.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={rowIndex === 0 ? "bg-[#f9e8d6] text-[#7a5b3f]" : "border-t border-[#eed9c0]"}
                        >
                          {row.map((cell, idx) => (
                            <td
                              key={idx}
                              className={`px-3 py-3 ${rowIndex === 0 ? "font-semibold uppercase tracking-[0.1em]" : "text-center"}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-[#5f4636]">Use the size chart to compare your preferred measurements or type your exact custom values.</p>
              </div>

              <div className="rounded-[28px] border border-[#e6d2b7] bg-[#fffdf6] p-5 shadow-sm">
                <div className="flex items-center gap-3 text-[#6b4e34] mb-4 text-sm uppercase tracking-[0.25em]">
                  <FaImage className="h-5 w-5" /> Design References
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFiles}
                  className="w-full rounded-2xl border border-[#d9cbb4] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3b2921] outline-none"
                />
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="group relative overflow-hidden rounded-2xl border border-[#e2d3bd] bg-white">
                        <img src={imagePreviews[index]} alt={file.name} className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
                            setImagePreviews((current) => {
                              const urlToRemove = current[index];
                              if (urlToRemove) URL.revokeObjectURL(urlToRemove);
                              const next = current.filter((_, currentIndex) => currentIndex !== index);
                              imagePreviewsRef.current = next;
                              return next;
                            });
                          }}
                          className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                          aria-label={`Remove ${file.name}`}
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                        <p className="truncate px-2 py-2 text-[10px] text-[#695744]">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextAreaField icon={<FaFeatherAlt />} label="Fabric Preference" name="fabricPreference" value={form.fabricPreference} onChange={handleChange} placeholder="Silk, chiffon, georgette, velvet..." />
              <TextAreaField icon={<FaGem />} label="Embroidery Details" name="embroideryDetails" value={form.embroideryDetails} onChange={handleChange} placeholder="Beads, zardozi, mirrors, threadwork..." />
              <TextAreaField icon={<FaRegStickyNote />} label="Special Instructions" name="specialInstructions" value={form.specialInstructions} onChange={handleChange} placeholder="Any special requests or finishing details" className="md:col-span-2" />
            </div>

            {orderType === "Wedding Order" && (
              <div className="grid gap-4 rounded-[28px] border border-[#e6d2b7] bg-[#fef6ee] p-5 shadow-sm">
                <div className="flex items-center gap-3 text-[#6b4e34] text-sm uppercase tracking-[0.25em]">
                  <FaStar className="h-5 w-5" /> Wedding Extras
                </div>
                <InputField icon={<FaGem />} label="Number of Pieces*" name="weddingPieces" type="number" value={form.weddingPieces} onChange={handleChange} placeholder="e.g. 3" />
                <TextAreaField icon={<FaRegStickyNote />} label="Wedding Notes" name="weddingNotes" value={form.weddingNotes} onChange={handleChange} placeholder="Ceremony, reception, dupatta style..." />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center rounded-full border border-[#d9cbb4] bg-white px-6 py-3 text-sm font-semibold text-[#6b4e34] transition hover:bg-[#f3ebe1]"
              >
                Back to Order Type
              </button>
              <div className="flex flex-col gap-2 sm:items-end">
                {error && <span className="text-sm text-red-600">{error}</span>}
                {success && <span className="text-sm text-green-600">Your custom order has been submitted successfully.</span>}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2c190f] px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-[#4b2e1f] disabled:cursor-not-allowed disabled:bg-[#a89485]"
                >
                  {loading ? "Submitting..." : "Submit Custom Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  </div>
  );
}
