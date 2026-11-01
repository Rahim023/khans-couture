import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * CollectionSlideshow Component
 * Displays a rotating slideshow of images for a collection
 * Features:
 * - Auto-rotating with smooth transitions
 * - Manual navigation with arrows
 * - Click to navigate to collection page
 * - Responsive design
 */
export default function CollectionSlideshow({ images, title, link, autoPlay = true, interval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Debug log
  useEffect(() => {
    console.log(`CollectionSlideshow: ${title}`, {
      imagesCount: images?.length || 0,
      firstImage: images?.[0] || "no images",
      link,
    });
  }, [images, title, link]);

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || !images || images.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, images, interval]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    if (images && images.length > 0) {
      setCurrentIndex((prev) => (prev + newDirection + images.length) % images.length);
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 md:h-[500px] bg-gray-300 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 font-semibold">No images available</p>
          <p className="text-gray-600 text-sm mt-1">Please add images to {title}</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div
      className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 cursor-pointer group"
      onClick={() => navigate(link)}
    >
      {/* Image Container */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {currentImage ? (
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`${title} slide ${currentIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            onError={(e) => {
              console.error(`Failed to load image: ${currentImage}`);
              setImageError(true);
            }}
            onLoad={() => {
              console.log(`✅ Loaded image: ${currentImage}`);
            }}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-400 animate-pulse"></div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Title Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white"
      >
        <h3 className="text-2xl md:text-4xl font-sansTrend font-semibold">{title}</h3>
        <p className="text-sm md:text-base mt-2 opacity-90">Click to explore</p>
      </motion.div>

      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            paginate(-1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur transition"
          aria-label="Previous slide"
        >
          ◀
        </button>
      )}

      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            paginate(1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur transition"
          aria-label="Next slide"
        >
          ▶
        </button>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition ${
                idx === currentIndex ? "bg-white w-6" : "bg-white/50 w-2"
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
