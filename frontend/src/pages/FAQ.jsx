import React from "react";
import Header from "../components/Header";

const faqs = [
  { q: "How do I track my order?", a: "Use the orders page or tracking link in your email." },
  { q: "What payment methods do you accept?", a: "We accept major credit cards and PayPal." },
  { q: "Can I change my order?", a: "Contact support as soon as possible to modify orders." },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-serifFancy mb-4">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold">{f.q}</h3>
              <p className="text-gray-700">{f.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
