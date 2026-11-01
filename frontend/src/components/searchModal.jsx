import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://khans-couture.onrender.com/api/products")
      .then((response) => {
        setAllProducts(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => console.error("Error loading search products:", error));
  }, []);

  const handleSearch = (text) => {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    const filtered = allProducts.filter((item) =>
      item.title?.toLowerCase().includes(text.toLowerCase())
    );

    setResults(filtered);
  };

  const openProduct = (product) => {
    if (!product?._id) return;
    onClose();

    const category = String(product.category || "").toLowerCase();
    const sections = Array.isArray(product.sections)
      ? product.sections.join(" ").toLowerCase()
      : "";
    let collectionPath = "/discover";

    if (product.Wedding || category.includes("wedding") || category.includes("bridal")) {
      collectionPath = "/wedding";
    } else if (
      product.Kurti ||
      product.kurti ||
      category.includes("kurti") ||
      sections.includes("kurti")
    ) {
      collectionPath = "/kurtis";
    } else if (product.Signature || category.includes("signature")) {
      collectionPath = "/signature";
    }

    navigate(`${collectionPath}?search=${encodeURIComponent(product.title || "")}`);
  };

  const handleSubmit = (event) => {
    if (event?.preventDefault) event.preventDefault();

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery || results.length === 0) return;

    const exactMatch = results.find(
      (product) => product.title?.trim().toLowerCase() === normalizedQuery
    );
    openProduct(exactMatch || results[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-[600px] p-6 rounded-xl shadow-xl border">

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-brand-navy">Search Products</h2>
          <button className="text-2xl" onClick={onClose}>&times;</button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search for clothing, jewelry, accessories..."
            className="w-full p-3 border rounded-lg"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>

        {/* Results */}
        <div className="mt-4 max-h-72 overflow-y-auto">
          {results.length === 0 && query && (
            <p className="text-gray-500 text-center">No results found.</p>
          )}

          {results.map((item) => (
            <div
              key={item._id || item.id}
              className="p-3 border-b flex gap-3 items-center cursor-pointer hover:bg-gray-100"
              onClick={() => openProduct(item)}
            >
              
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-500">${item.price}</p>
                <p className="text-xs text-brand-gold">{item.category}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
