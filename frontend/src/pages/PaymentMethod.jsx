import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, Lock, PackageCheck, WalletCards } from "lucide-react";

export default function PaymentMethod() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  const validateCardNumber = (num) => /^\d{16}$/.test(num) ? "" : "Enter a valid 16-digit card number.";
  const validateExpiry = (exp) => {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return "Use MM/YY.";
    const [mm, yy] = exp.split("/").map(Number);
    if (mm < 1 || mm > 12) return "Enter a valid month.";
    const expiryDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
    return expiryDate < new Date() ? "This card has expired." : "";
  };
  const validateCVV = (value) => /^\d{3,4}$/.test(value) ? "" : "Enter a valid 3 or 4-digit CVV.";

  const handleConfirm = () => {
    if (method === "card") {
      const nextErrors = {
        cardNumber: validateCardNumber(cardNumber.replace(/\s/g, "")),
        expiry: validateExpiry(expiry),
        cvv: validateCVV(cvv),
      };
      if (Object.values(nextErrors).some(Boolean)) {
        setErrors(nextErrors);
        return;
      }
    }
    navigate(`/payment-success/${orderId}`);
  };

  const options = [
    { id: "card", label: "Credit / Debit Card", detail: "Visa, Mastercard and major cards", icon: CreditCard },
    { id: "paypal", label: "PayPal", detail: "Pay securely with your PayPal account", icon: WalletCards },
    { id: "cod", label: "Cash on Delivery", detail: "Pay when your order arrives", icon: PackageCheck },
  ];

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <section className="px-4 py-8 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="mb-7 text-center md:mb-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
              <Lock size={24} />
            </div>
            <h1 className="font-serifFancy text-3xl font-bold text-brand-navy md:text-4xl">Payment</h1>
            <p className="mt-2 text-sm text-brand-charcoal/70">Choose a payment method for your order</p>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-brand-gold/20 bg-white p-4 shadow-lg sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-brand-navy">Payment method</h2>
              <div className="space-y-3">
                {options.map(({ id, label, detail, icon: Icon }) => {
                  const selected = method === id;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => { setMethod(id); setErrors({}); }}
                      className={`w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                        selected ? "border-brand-gold bg-brand-gold/10 ring-1 ring-brand-gold" : "border-brand-charcoal/10 bg-white hover:border-brand-gold/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${selected ? "bg-brand-gold text-brand-navy" : "bg-brand-mist text-brand-charcoal"}`}>
                          <Icon size={21} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-brand-navy">{label}</span>
                          <span className="mt-0.5 block text-xs text-brand-charcoal/60 sm:text-sm">{detail}</span>
                        </span>
                        <span className={`ml-auto h-5 w-5 flex-none rounded-full border-2 ${selected ? "border-brand-gold bg-brand-gold shadow-[inset_0_0_0_4px_white]" : "border-brand-charcoal/30"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {method === "card" && (
                <div className="mt-6 border-t border-brand-gold/20 pt-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-brand-charcoal">Card number</label>
                    <input
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                        setErrors((prev) => ({ ...prev, cardNumber: "" }));
                      }}
                      className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold ${errors.cardNumber ? "border-red-400" : "border-brand-gold/30"}`}
                      placeholder="0000 0000 0000 0000"
                    />
                    {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-brand-charcoal">Expiry</label>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        maxLength="5"
                        value={expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (value.length >= 3) value = `${value.slice(0, 2)}/${value.slice(2)}`;
                          setExpiry(value);
                          setErrors((prev) => ({ ...prev, expiry: "" }));
                        }}
                        className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold ${errors.expiry ? "border-red-400" : "border-brand-gold/30"}`}
                        placeholder="MM/YY"
                      />
                      {errors.expiry && <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-brand-charcoal">CVV</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength="4"
                        value={cvv}
                        onChange={(e) => {
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                          setErrors((prev) => ({ ...prev, cvv: "" }));
                        }}
                        className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold ${errors.cvv ? "border-red-400" : "border-brand-gold/30"}`}
                        placeholder="123"
                      />
                      {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl bg-gradient-to-br from-brand-navy to-brand-purple p-5 text-brand-ivory shadow-lg md:sticky md:top-24">
              <Lock size={20} className="mb-3 text-brand-gold" />
              <h2 className="font-serifFancy text-xl font-bold">Secure checkout</h2>
              <p className="mt-2 text-sm leading-6 text-brand-ivory/75">Your payment details are protected. Never share your CVV or card PIN.</p>
              <button
                onClick={handleConfirm}
                className="mt-5 w-full rounded-full bg-brand-gold px-5 py-3.5 font-bold text-brand-navy shadow-md transition hover:bg-brand-ivory"
              >
                Confirm Payment
              </button>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
