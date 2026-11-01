// src/components/CircularGalleryWithData.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import CircularGallery from "./CircularGallery";

export default function CircularGalleryWithData({
  bend = 5,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
  scrollSpeed = 2,
  scrollEase = 0.05,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products"); // Update your backend URL
        const formatted = res.data.map((p) => ({
          img: p.img || p.image,
          title: p.title || p.name,
        }));
        setProducts(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading gallery...
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="circular-gallery-wrapper w-full h-[500px] md:h-[600px]">
      <CircularGallery
        items={products}
        bend={bend}
        textColor={textColor}
        borderRadius={borderRadius}
        font={font}
        scrollSpeed={scrollSpeed}
        scrollEase={scrollEase}
      />
    </div>
  );
}
