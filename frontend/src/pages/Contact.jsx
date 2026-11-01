import React from "react";
import Header from "../components/Header";

export default function Contact() {
  return (
    <div className="min-h-screen bg-brand-mist font-sansTrend">
      <Header />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-serifFancy mb-4">Contact Us</h1>
        <p className="text-gray-700 mb-4">Need help? Reach us at support@khanscouture.example or fill the contact form below.</p>
        <form className="space-y-4">
          <input placeholder="Your name" className="w-full p-3 rounded border" />
          <input placeholder="Your email" className="w-full p-3 rounded border" />
          <textarea placeholder="Message" className="w-full p-3 rounded border h-40" />
          <button type="submit" className="px-6 py-3 bg-brand-gold text-brand-navy rounded-full font-semibold">Send</button>
        </form>
      </main>
    </div>
  );
}
