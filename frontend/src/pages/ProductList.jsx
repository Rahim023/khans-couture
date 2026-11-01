import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        console.log("📥 Raw response from /api/products:", res.data);

        if (!res.data || res.data.length === 0) {
          console.warn("⚠️ No products returned from backend");
          setProducts([]);
          return;
        }

        // Check first product to see what fields exist
        console.log("📦 First product from backend:", res.data[0]);

        const mapped = res.data.map((p) => {
          const normalized = {
            ...p,
            // Ensure we always have an id - check both id and _id
            id: p.id || p._id,
            _id: p._id || p.id,
          };
          return normalized;
        });

        console.log("✅ After normalization, first product:", mapped[0]);
        console.log("📊 Total products normalized:", mapped.length);
        setProducts(mapped);
      } catch (err) {
        console.error("❌ Error fetching products:", err.response?.data || err.message);
      }
    };

    fetchProducts();
  }, []);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </div>
  );
}
