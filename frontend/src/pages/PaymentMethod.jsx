import React, { useState } from "react";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";

export default function PaymentMethod() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // ------------------------------
  // 🔍 VALIDATION FUNCTIONS
  // ------------------------------

  const validateCardNumber = (num) => {
    if (!/^\d{16}$/.test(num)) return "Card number must be 16 digits";
    return "";
  };

  const validateExpiry = (exp) => {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return "Format must be MM/YY";

    const [mm, yy] = exp.split("/").map(Number);
    if (mm < 1 || mm > 12) return "Invalid month";

    const current = new Date();
    const expiryDate = new Date(2000 + yy, mm);

    if (expiryDate < current) return "Card has expired";

    return "";
  };

  const validateCVV = (c) => {
    if (!/^\d{3}$/.test(c)) return "CVV must be 3 digits";
    return "";
  };

  // ------------------------------
  // 🔐 HANDLE PAYMENT
  // ------------------------------
  const handleConfirm = () => {
    if (method === "card") {
      const cardError = validateCardNumber(cardNumber);
      const expiryError = validateExpiry(expiry);
      const cvvError = validateCVV(cvv);

      if (cardError || expiryError || cvvError) {
        setErrors({
          cardNumber: cardError,
          expiry: expiryError,
          cvv: cvvError,
        });
        return;
      }
    }

    // On success → go to Payment Success page
    navigate(`/payment-success/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />

      <section className="py-16 px-6 md:px-20 flex-1 bg-brand-mist">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy text-center mb-10">
          Choose Payment Method
        </h1>

        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6">

          {/* ------------------------------------ */}
          {/*     CREDIT / DEBIT CARD OPTION        */}
          {/* ------------------------------------ */}
          <div
            onClick={() => setMethod("card")}
            className={`border p-4 rounded-lg cursor-pointer mb-4 ${
              method === "card" ? "border-brand-gold bg-yellow-50" : "border-gray-300"
            }`}
          >
            <p className="font-semibold flex items-center gap-2">
              💳 Credit / Debit Card
            </p>

            {method === "card" && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Card Number"
                  maxLength="16"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(e.target.value.replace(/\D/, ""));
                    setErrors((prev) => ({ ...prev, cardNumber: "" }));
                  }}
                  className="w-full p-3 border rounded-lg mb-1"
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm">{errors.cardNumber}</p>
                )}

                <div className="flex gap-3 mt-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={expiry}
                    onChange={(e) => {
                      let exp = e.target.value;
                      exp = exp.replace(/[^\d\/]/g, "");

                      if (exp.length === 2 && !exp.includes("/")) exp = exp + "/";
                      if (exp.length <= 5) setExpiry(exp);

                      setErrors((prev) => ({ ...prev, expiry: "" }));
                    }}
                    className="w-1/2 p-3 border rounded-lg mb-1"
                  />

                  <input
                    type="text"
                    placeholder="CVV"
                    maxLength="3"
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value.replace(/\D/, ""));
                      setErrors((prev) => ({ ...prev, cvv: "" }));
                    }}
                    className="w-1/2 p-3 border rounded-lg mb-1"
                  />
                </div>

                {errors.expiry && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
                )}
                {errors.cvv && (
                  <p className="text-red-500 text-sm">{errors.cvv}</p>
                )}
              </div>
            )}
          </div>

          {/* ------------------------------------ */}
          {/*             PAYPAL OPTION             */}
          {/* ------------------------------------ */}

          <div
            onClick={() => setMethod("paypal")}
            className={`border p-4 rounded-lg cursor-pointer mb-4 ${
              method === "paypal" ? "border-brand-gold bg-blue-50" : "border-gray-300"
            }`}
          >
            <p className="font-semibold flex items-center gap-2">
              🅿 PayPal
            </p>
          </div>

          {/* ------------------------------------ */}
          {/*         CASH ON DELIVERY OPTION       */}
          {/* ------------------------------------ */}

          <div
            onClick={() => setMethod("cod")}
            className={`border p-4 rounded-lg cursor-pointer mb-4 ${
              method === "cod" ? "border-brand-gold bg-orange-50" : "border-gray-300"
            }`}
          >
            <p className="font-semibold flex items-center gap-2">
              📦 Cash on Delivery
            </p>
          </div>

          {/* CONFIRM BUTTON */}
          <button
            onClick={handleConfirm}
            className="mt-6 w-full py-3 bg-brand-gold text-brand-navy font-semibold rounded-lg shadow hover:bg-brand-ivory transition"
          >
            Confirm Payment
          </button>
        </div>
      </section>
    </div>
  );
}
