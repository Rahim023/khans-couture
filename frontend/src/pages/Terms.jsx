import React from "react";
import Header from "../components/Header";

export default function Terms() {
  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-serifFancy mb-4">Terms & Conditions</h1>
        <p className="text-gray-700">These are the standard terms and conditions for using Khan's Couture website.</p>
      </main>
    </div>
  );
}
