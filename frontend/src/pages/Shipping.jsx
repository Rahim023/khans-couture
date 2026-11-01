import React from "react";
import Header from "../components/Header";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-serifFancy mb-4">Shipping Information</h1>
        <p className="text-gray-700 mb-4">We offer standard and express shipping worldwide. Orders are processed within 1-2 business days.</p>
        <h2 className="text-xl font-semibold mt-6">Shipping Times</h2>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li>Standard: 5-10 business days</li>
          <li>Express: 2-4 business days</li>
        </ul>
      </main>
    </div>
  );
}
