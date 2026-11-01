import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Header from "../components/Header";
import { api } from "../services/api";

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const HERO_IMAGE = "https://res.cloudinary.com/divypkla0/image/upload/v1780204673/lhnga2_ohuexo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailIsValid = EMAIL_PATTERN.test(email.trim());

  const handleLogin = async (event) => {
    event.preventDefault();
    setEmailTouched(true);
    setError("");

    if (!emailIsValid) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({
        _id: res.data._id,
        email: res.data.email,
        role: res.data.role,
        isAdmin: res.data.isAdmin,
      }));

      navigate(res.data.isAdmin || res.data.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#160707] text-[#3d1717]">
      <Header />
      <main className="relative min-h-screen px-4 pb-6 pt-[118px] sm:px-6 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid min-h-[720px] max-w-[1180px] overflow-hidden rounded-[28px] border border-white/15 bg-[#fbf8f2] shadow-[0_30px_90px_rgba(0,0,0,.42)] lg:grid-cols-[1.08fr_.92fr]"
        >
          <div className="relative hidden overflow-hidden lg:block">
            <motion.img
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              src={HERO_IMAGE}
              alt="Khan Couture wedding collection"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#240909]/90 via-[#240909]/20 to-transparent" />
            <div className="absolute left-10 top-10 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[3px] text-white backdrop-blur-md">
              Khan Couture
            </div>
            <div className="absolute bottom-12 left-12 right-12 text-white">
              <Sparkles className="mb-5 text-[#d8bc88]" size={30} />
              <p className="max-w-md text-4xl font-light leading-tight">
                Where every stitch carries a story.
              </p>
              <p className="mt-4 text-sm text-white/70">Curated elegance, made personal.</p>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18, duration: 0.65 }}
              className="w-full max-w-[420px]"
            >
              <img src="/images/kclogo.png" alt="Khan Couture" className="mb-8 h-16 object-contain lg:hidden" />
              <p className="mb-3 text-xs font-bold uppercase tracking-[3px] text-[#a46d4b]">Member access</p>
              <h1 className="text-4xl font-semibold tracking-tight text-[#590f0f] sm:text-5xl">Welcome back</h1>
              <p className="mt-3 text-sm leading-6 text-[#6d5555]">Sign in to view orders, save favourites, and continue shopping.</p>

              <form onSubmit={handleLogin} noValidate className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-[#590f0f]/75">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#590f0f]/45" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError("");
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="name@example.com"
                      aria-invalid={emailTouched && !emailIsValid}
                      className={`w-full rounded-2xl border bg-white py-4 pl-12 pr-4 text-sm outline-none transition placeholder:text-[#6d5555]/35 ${
                        emailTouched && !emailIsValid
                          ? "border-red-400 ring-4 ring-red-100"
                          : "border-[#590f0f]/12 focus:border-[#b08a55] focus:ring-4 focus:ring-[#d5b98c]/20"
                      }`}
                    />
                  </div>
                  {emailTouched && email.length > 0 && !emailIsValid && (
                    <p className="mt-2 text-xs font-medium text-red-600">Please enter a valid email address</p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-[1.5px] text-[#590f0f]/75">Password</label>
                    <button type="button" className="text-xs font-semibold text-[#9a7045] hover:text-[#590f0f]">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#590f0f]/45" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-2xl border border-[#590f0f]/12 bg-white py-4 pl-12 pr-12 text-sm outline-none transition focus:border-[#b08a55] focus:ring-4 focus:ring-[#d5b98c]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#590f0f]/55 hover:bg-[#590f0f]/8"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm text-[#6d5555]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#590f0f]/20 accent-[#590f0f]" />
                  Keep me signed in
                </label>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#590f0f] py-4 text-sm font-bold text-white shadow-[0_14px_32px_rgba(89,15,15,.22)] transition hover:bg-[#741818] disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in securely"}
                  {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[2px] text-[#6d5555]/45">
                <span className="h-px flex-1 bg-[#590f0f]/10" /> or continue with <span className="h-px flex-1 bg-[#590f0f]/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 rounded-full border border-[#590f0f]/12 bg-white py-3 text-sm font-semibold transition hover:border-[#d5b98c] hover:bg-[#fffaf2]">
                  <FcGoogle size={21} /> Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 rounded-full border border-[#590f0f]/12 bg-white py-3 text-sm font-semibold transition hover:border-[#d5b98c] hover:bg-[#fffaf2]">
                  <FaApple size={19} /> Apple
                </button>
              </div>

              <div className="mt-7 flex items-center justify-center gap-2 text-sm text-[#6d5555]">
                New to Khan Couture?
                <Link to="/signup" className="font-bold text-[#590f0f] underline decoration-[#d5b98c] decoration-2 underline-offset-4">Create account</Link>
              </div>
              <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#6d5555]/55"><ShieldCheck size={14} /> Secure and private checkout</p>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
