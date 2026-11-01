import React from "react";
import Header from "../components/Header";

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-serifFancy mb-4">Return Policy</h1>
        <p className="text-gray-700 mb-4">
          We accept returns within 30 days of delivery. Items must be unused, with tags attached, and in original packaging. To start a return, contact our support team via the Contact page.
        </p>
        <h2 className="text-xl font-semibold mt-6">How to Return</h2>
        <ol className="list-decimal list-inside mt-2 text-gray-700">
          <li>Contact support to request a return authorization.</li>
          <li>Pack the item securely and attach the return label.</li>
          <li>Ship the package using the provided instructions.</li>
        </ol>
      </main>
    </div>
  );
}
