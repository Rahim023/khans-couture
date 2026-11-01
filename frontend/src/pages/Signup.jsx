import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Header from "../components/Header";
import { api } from "../services/api";

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const HERO_IMAGE = "https://res.cloudinary.com/divypkla0/image/upload/v1780204546/lhnga_lurrsq.jpg";

const countries = ["Canada", "USA", "India", "UK", "Australia", "Germany", "France", "Other"];
const EMAIL_DOMAIN_TYPOS = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cmo": "gmail.com",
  "gmail.co": "gmail.com",
  "hotnail.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
};

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    postalCode: "",
    country: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  const emailIsValid = EMAIL_PATTERN.test(formData.email.trim());

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "", api: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    const postalPatterns = {
      Canada: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      USA: /^\d{5}(-\d{4})?$/,
      India: /^[1-9][0-9]{5}$/,
      UK: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
      Australia: /^\d{4}$/,
      Germany: /^\d{5}$/,
      France: /^\d{5}$/,
      Other: /^.{2,12}$/,
    };

    if (!formData.username.trim()) nextErrors.username = "Username is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    else if (!emailIsValid) nextErrors.email = "Please enter a valid email address";
    else {
      const domain = formData.email.trim().toLowerCase().split("@")[1];
      if (EMAIL_DOMAIN_TYPOS[domain]) {
        nextErrors.email = `Did you mean @${EMAIL_DOMAIN_TYPOS[domain]}?`;
      }
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      nextErrors.password = "Use 8+ characters with uppercase, lowercase, and a number";
    }
    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.phone.trim()) nextErrors.phone = "Phone number is required";
    if (!formData.country) nextErrors.country = "Country is required";
    if (!formData.postalCode.trim()) {
      nextErrors.postalCode = "Postal code is required";
    } else {
      const pattern = postalPatterns[formData.country] || postalPatterns.Other;
      if (!pattern.test(formData.postalCode.trim())) {
        nextErrors.postalCode = `Invalid postal code for ${formData.country || "your country"}`;
      }
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await api.post("/auth/register", {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });
      setSuccess(true);
      setVerificationEmail(formData.email.trim().toLowerCase());
      setVerificationMessage("Enter the 6-digit code sent to your email");
    } catch (error) {
      const message = error.response?.data?.message || "Unable to create account";
      if (/email|domain|address|valid|did you mean/i.test(message)) {
        setErrors({ email: message });
      } else {
        setErrors({ api: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(verificationCode)) {
      setVerificationMessage("Enter a valid 6-digit verification code");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-email", {
        email: verificationEmail,
        code: verificationCode,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        _id: response.data._id,
        email: response.data.email,
        role: response.data.role,
        isAdmin: response.data.isAdmin,
      }));
      navigate("/", { replace: true });
    } catch (error) {
      setVerificationMessage(error.response?.data?.message || "Unable to verify this email");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    try {
      const response = await api.post("/auth/resend-verification", { email: verificationEmail });
      setVerificationMessage(response.data.message || "A new verification code was sent");
    } catch (error) {
      setVerificationMessage(error.response?.data?.message || "Unable to resend the code");
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = "text", placeholder, Icon, options = null) => (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[1.5px] text-[#590f0f]/70">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#590f0f]/40" size={17} />}
        {options ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full appearance-none rounded-xl border bg-white py-3.5 px-4 text-sm outline-none transition ${
              errors[name] ? "border-red-400 ring-4 ring-red-100" : "border-[#590f0f]/12 focus:border-[#b08a55] focus:ring-4 focus:ring-[#d5b98c]/20"
            }`}
          >
            <option value="">Select country</option>
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ) : (
          <input
            name={name}
            type={type === "password" && showPassword ? "text" : type}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            aria-invalid={Boolean(errors[name])}
            className={`w-full rounded-xl border bg-white py-3.5 text-sm outline-none transition placeholder:text-[#6d5555]/35 ${
              Icon ? "pl-11 pr-4" : "px-4"
            } ${type === "password" ? "pr-11" : ""} ${
              errors[name] ? "border-red-400 ring-4 ring-red-100" : "border-[#590f0f]/12 focus:border-[#b08a55] focus:ring-4 focus:ring-[#d5b98c]/20"
            }`}
          />
        )}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#590f0f]/55"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {errors[name] && <p className="mt-1.5 text-xs font-medium text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#160707] text-[#3d1717]">
      <Header />
      {success && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#240909]/75 px-4 backdrop-blur-md">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md rounded-3xl bg-[#fffaf3] px-6 py-8 text-center shadow-2xl sm:px-10">
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setVerificationCode("");
              }}
              aria-label="Close email verification"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[#590f0f]/10 bg-white text-[#590f0f]/70 shadow-sm transition hover:bg-[#590f0f] hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#590f0f] text-white"><ShieldCheck /></div>
            <p className="text-xl font-semibold text-[#590f0f]">Verify your email</p>
            <p className="mt-2 break-all text-sm text-[#6d5555]">We sent a 6-digit code to <strong>{verificationEmail}</strong></p>
            <form onSubmit={verifyEmail} className="mt-6">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                autoFocus
                className="w-full rounded-2xl border border-[#590f0f]/15 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[12px] text-[#590f0f] outline-none focus:border-[#b08a55] focus:ring-4 focus:ring-[#d5b98c]/20"
              />
              <p className="mt-3 min-h-5 text-xs font-medium text-[#8a4545]">{verificationMessage}</p>
              <button type="submit" disabled={loading} className="mt-3 w-full rounded-full bg-[#590f0f] py-4 text-sm font-bold text-white disabled:opacity-60">
                {loading ? "Verifying..." : "Verify and continue"}
              </button>
            </form>
            <button type="button" onClick={resendVerification} disabled={loading} className="mt-5 text-sm font-bold text-[#590f0f] underline decoration-[#d5b98c] decoration-2 underline-offset-4">
              Resend verification code
            </button>
          </motion.div>
        </div>
      )}

      <main className="relative min-h-screen px-4 pb-6 pt-[118px] sm:px-6 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid min-h-[760px] max-w-[1180px] overflow-hidden rounded-[28px] border border-white/15 bg-[#fbf8f2] shadow-[0_30px_90px_rgba(0,0,0,.42)] lg:grid-cols-[.82fr_1.18fr]"
        >
          <div className="relative hidden overflow-hidden lg:block">
            <motion.img
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              src={HERO_IMAGE}
              alt="Khan Couture bridal collection"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#240909]/95 via-[#240909]/25 to-transparent" />
            <div className="absolute left-9 top-9 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[3px] text-white backdrop-blur-md">
              The couture circle
            </div>
            <div className="absolute bottom-12 left-10 right-10 text-white">
              <Sparkles className="mb-5 text-[#d8bc88]" size={30} />
              <p className="text-4xl font-light leading-tight">Designed for moments worth remembering.</p>
              <p className="mt-4 text-sm text-white/70">Join and enjoy a beautifully personal shopping experience.</p>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="w-full max-w-[560px]">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[3px] text-[#a46d4b]">New member</p>
                  <h1 className="text-4xl font-semibold tracking-tight text-[#590f0f]">Create your account</h1>
                </div>
                <img src="/images/kclogo.png" alt="Khan Couture" className="hidden h-14 object-contain sm:block lg:hidden" />
              </div>

              <form onSubmit={handleSubmit} noValidate className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                {field("username", "Username", "text", "Your name", UserRound)}
                {field("email", "Email address", "email", "name@example.com", Mail)}
                {field("password", "Password", "password", "Create a strong password", LockKeyhole)}
                {field("confirmPassword", "Confirm password", "password", "Repeat your password", ShieldCheck)}
                {field("phone", "Phone number", "tel", "+1 555 000 0000", Phone)}
                {field("country", "Country", "text", "", MapPin, countries)}
                <div className="sm:col-span-2">
                  {field("postalCode", "Postal code", "text", "Your postal code", MapPin)}
                </div>

                {errors.api && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sm:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.api}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group sm:col-span-2 mt-1 flex w-full items-center justify-center gap-3 rounded-full bg-[#590f0f] py-4 text-sm font-bold text-white shadow-[0_14px_32px_rgba(89,15,15,.22)] transition hover:bg-[#741818] disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create account"}
                  {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#6d5555]">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-[#590f0f] underline decoration-[#d5b98c] decoration-2 underline-offset-4">Sign in</Link>
              </p>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
