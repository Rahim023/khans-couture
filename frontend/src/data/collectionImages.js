/**
 * Collection Images Configuration
 * Maps collection names to their local image paths
 * 
 * IMAGE ORGANIZATION GUIDE:
 * Place your images in: frontend/public/images/collections/{category}/
 * 
 * Kurtis Collection (4 images):
 * - /images/collections/women/women-1.jpg (wedding dress)
 * - /images/collections/women/women-2.jpg (casual/evening)
 * - /images/collections/women/women-3.jpg (elegant gown)
 * - /images/collections/women/women-4.jpg (modern style)
 * 
 * Signature Collection (4 images):
 * - /images/collections/signature/signature-1.jpg (bridal lehenga)
 * - /images/collections/signature/signature-2.jpg (embroidered saree)
 * - /images/collections/signature/signature-3.jpg (premium dress)
 * - /images/collections/signature/signature-4.jpg (luxury gown)
 * 
 * Wedding Collection (3 images):
 * - /images/collections/wedding/wedding-1.jpg (bridal outfit)
 * - /images/collections/wedding/wedding-2.jpg (wedding dress)
 * - /images/collections/wedding/wedding-3.jpg (elegant dress)
 */

export const collectionImages = {
  kurtis: [
    "/images/collections/women/women-1.jpg",
    "/images/collections/women/women-2.jpg",
    "/images/collections/women/women-3.jpg",
    "/images/collections/women/women-4.jpg",
  ],
  signature: [
    "/images/collections/signature/signature-1.jpg",
    "/images/collections/signature/signature-2.jpg",
    "/images/collections/signature/signature-3.jpg",
    "/images/collections/signature/signature-4.jpg",
  ],
  wedding: [
    "/images/collections/wedding/wedding-1.jpg",
    "/images/collections/wedding/wedding-2.jpg",
    "/images/collections/wedding/wedding-3.jpg",
  ],
};

export const collectionData = [
  {
    id: "kurtis",
    title: "Kurtis Collection",
    link: "/kurtis",
    images: collectionImages.kurtis,
  },
  {
    id: "signature",
    title: "Signature Series",
    link: "/signature",
    images: collectionImages.signature,
  },
  {
    id: "wedding",
    title: "Wedding Collection",
    link: "/wedding",
    images: collectionImages.wedding,
  },
  {
    id: "2023",
    title: "2023 Collection",
    link: "/2023",
    images: collectionImages.kurtis, // Using same images as fallback
  },
];
