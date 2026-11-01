import React, { useState, useRef, useEffect } from "react";

export default function SupportChat({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can we assist you today?" }
  ]);

  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto scroll to bottom on every message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Fake AI Support Bot Logic
  const getBotReply = (userMessage) => {
    userMessage = userMessage.toLowerCase();

    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      return "Hi there! 👋 How can I help you today?";
    }
    if (userMessage.includes("order")) {
      return "Sure! Please provide your Order ID so I can check it for you.";
    }
    if (userMessage.includes("refund")) {
      return "Refund requests are processed within 5–7 business days.";
    }
    if (userMessage.includes("shipping")) {
      return "Shipping usually takes 3–5 business days depending on location.";
    }
    if (userMessage.includes("help") || userMessage.includes("support")) {
      return "I'm here to help! Please describe your issue.";
    }

    return "Thank you! Our support team will get back to you shortly.";
  };

  // 🔹 Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Generate bot reply
    setTimeout(() => {
      const botReply = getBotReply(input);
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 600);

    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
      <div className="w-80 bg-white shadow-xl rounded-xl border overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-navy text-brand-ivory p-3 flex justify-between items-center">
          <span className="font-semibold">Support Chat</span>
          <button onClick={onClose} className="text-xl text-brand-ivory">×</button>
        </div>

        {/* Chat Body */}
        <div
          style={{ height: "320px" }}
          className="p-3 overflow-y-auto space-y-3 bg-brand-mist"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-[85%] ${
                msg.sender === "user"
                  ? "bg-brand-gold text-white ml-auto"
                  : "bg-white text-brand-charcoal mr-auto shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          ))}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input Area */}
        <div className="flex items-center p-3 gap-2 border-t bg-white">
          <input
            type="text"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="bg-brand-gold px-4 py-2 rounded-lg text-white font-semibold hover:bg-brand-navy transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
