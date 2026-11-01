import React from "react";

export default function MiniProductCard({ product }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white">
      <img
        src={product.img}
        alt={product.title}
        className="w-full h-40 object-cover"
      />

      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {product.title}
        </h3>

        <p className="text-xs text-gray-600 truncate">
          {product.description}
        </p>

        <p className="mt-2 font-bold text-brand-navy text-sm">
          ₹{product.price}
        </p>
      </div>
    </div>
  );
}
