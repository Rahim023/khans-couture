import React from "react";
import Header from "../components/Header";

export default function OurStory() {
  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-serifFancy mb-4">Our Story</h1>
        <p className="text-gray-700">Khan's Couture was founded with a passion for handcrafted textiles and timeless design.</p>
      </main>
    </div>
  );
}
