import React from "react";
import { motion } from "framer-motion";

const CollectionLayout = ({ assetGroups = {} }) => {
  const heroImages = Array.isArray(assetGroups.heroImages) ? assetGroups.heroImages : [];
  const collectionImages = Array.isArray(assetGroups.collectionImages) ? assetGroups.collectionImages : [];
  const trendingImages = Array.isArray(assetGroups.trendingImages) ? assetGroups.trendingImages : [];
  const posterImages = Array.isArray(assetGroups.posterImages) ? assetGroups.posterImages : [];
  const behindTheScenes = Array.isArray(assetGroups.behindTheScenes) ? assetGroups.behindTheScenes : [];

  const previewCards = [
    {
      id: "signature-series",
      title: "Signature Series",
      subtitle: "Premium signature looks",
      link: "/signature",
      image: collectionImages[0] || heroImages[0] || trendingImages[0],
    },
    {
      id: "daily-wear",
      title: "Daily Wear",
      subtitle: "Kurtis & curated essentials",
      link: "/kurtis",
      image: heroImages[0] || collectionImages[1] || trendingImages[0],
    },
    {
      id: "wedding-collection",
      title: "Wedding Collection",
      subtitle: "Bridal styling for your big day",
      link: "/wedding",
      image: posterImages[0] || trendingImages[0] || collectionImages[0],
    },
    {
      id: "hand-embroidery",
      title: "Hand Embroidery",
      subtitle: "Crafted detail and texture",
      link: "/discover",
      image: behindTheScenes[0] || trendingImages[1] || collectionImages[0],
    },
  ];

  const baseCollageImages = [
    heroImages[1],
    trendingImages[0],
    posterImages[0],
    behindTheScenes[0],
    heroImages[2],
    collectionImages[1],
  ].filter(Boolean);

  const collageImages = baseCollageImages.length
    ? Array.from({ length: 6 }, (_, index) => baseCollageImages[index % baseCollageImages.length])
    : [];

  const featuredHero = collectionImages[0] || heroImages[0] || trendingImages[0] || posterImages[0];

  return (
    <section className="relative overflow-hidden bg-[#fcf5ec] py-10 sm:py-14">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#d1a17e]/15 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#b56e4f]/10 blur-3xl" />

      <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(360px,1fr)_minmax(520px,0.9fr)] items-center rounded-[48px] border border-[#f0ddd0] bg-white/95 p-8 shadow-[0_30px_120px_rgba(64,14,0,0.08)] backdrop-blur-xl sm:p-12 lg:p-16">

          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#e7c9b5] bg-[#fff0e7] px-4 py-2 text-sm uppercase tracking-[0.35em] text-[#9c5d44]">
              Vol. 10 · November Edition
            </div>

            <div className="space-y-5">
              <h2 className="max-w-xl text-4xl font-black tracking-[-0.04em] text-[#2a1010] sm:text-5xl lg:text-6xl">
                The November 2023 Collection
              </h2>
              <p className="max-w-xl text-base leading-8 text-[#5d4032] sm:text-lg">
                Discover a calm, elegant presentation of our curated collections. Every detail is arranged to highlight the craft, color, and texture of each piece.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[32px] border border-[#f1d8cc] bg-[#f9efe7] p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.35em] text-[#9f6d53]">Refined Selection</p>
                <h3 className="mt-4 text-2xl font-semibold text-[#3c1717]">Curated for effortless style</h3>
                <p className="mt-3 text-sm leading-7 text-[#6c4d41]">
                  A seamless edit of eveningwear, tailored staples, and statement accessories for a polished wardrobe.
                </p>
              </div>
              <div className="rounded-[32px] border border-[#f1d8cc] bg-[#fff8f2] p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.35em] text-[#9f6d53]">Modern Details</p>
                <h3 className="mt-4 text-2xl font-semibold text-[#3c1717]">Balanced structure and texture</h3>
                <p className="mt-3 text-sm leading-7 text-[#6c4d41]">
                  Elegant silhouettes, luxe fabrics, and subtle finishes combine for a refined visual statement.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a href="/discover" className="inline-flex items-center justify-center rounded-full bg-[#8c4a37] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#6f3b2b]">
                Shop the Collection
              </a>
              <a href="/kurtis" className="inline-flex items-center justify-center rounded-full border border-[#8c4a37] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#8c4a37] transition hover:bg-[#f9ebe5]">
                View Lookbook
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {previewCards.map((item) => (
                <motion.a
                  key={item.id}
                  href={item.link}
                  className="group overflow-hidden rounded-[32px] border border-[#ebd7cc] bg-[#fff5ef] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(140,74,55,0.18)]"
                  whileHover={{ y: -3 }}
                >
                  <div className="relative h-40 overflow-hidden">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a08]/60 via-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xs uppercase tracking-[0.3em]">{item.subtitle}</p>
                      <p className="mt-1 text-lg font-semibold">{item.title}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-[40px] bg-[#f1e2d9] shadow-[0_30px_80px_rgba(79,24,12,0.12)]">
              {featuredHero && (
                <img
                  src={featuredHero}
                  alt="Collection highlight"
                  className="h-48x w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a08]/55 via-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-[#d9c6b1]">Featured</p>
                <p className="mt-2 text-2xl font-semibold">Royal edit</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[40px] bg-[#ede6df] h-[520px]">
              <motion.div
                className="w-full"
                animate={{ y: ["0%", "-50%"] }}
                transition={{ duration: 34, ease: "linear", repeat: Infinity, repeatType: "loop" }}
              >
                <div className="grid gap-4 sm:grid-cols-2 px-2 py-4">
                  <div className="space-y-4">
                    {collageImages.slice(0, 3).map((src, index) => (
                      <div key={`merged-left-${index}`} className="relative h-40 overflow-hidden rounded-[28px] bg-[#f3ede6] shadow-sm">
                        <img src={src} alt="Collection collage" className="absolute inset-0 h-full w-full object-cover object-center" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {collageImages.slice(3, 6).map((src, index) => (
                      <div key={`merged-right-${index}`} className="relative h-40 overflow-hidden rounded-[28px] bg-[#f3ede6] shadow-sm">
                        <img src={src} alt="Collection collage" className="absolute inset-0 h-full w-full object-cover object-center" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 px-2 pb-4">
                  <div className="space-y-4">
                    {collageImages.slice(0, 3).map((src, index) => (
                      <div key={`merged-left-repeat-${index}`} className="relative h-40 overflow-hidden rounded-[28px] bg-[#f3ede6] shadow-sm">
                        <img src={src} alt="Collection collage" className="absolute inset-0 h-full w-full object-cover object-center" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {collageImages.slice(3, 6).map((src, index) => (
                      <div key={`merged-right-repeat-${index}`} className="relative h-40 overflow-hidden rounded-[28px] bg-[#f3ede6] shadow-sm">
                        <img src={src} alt="Collection collage" className="absolute inset-0 h-full w-full object-cover object-center" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="overflow-hidden rounded-[40px] bg-[#f9efe7] p-8 shadow-sm">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#9f6d53]">Signature Shape</p>
                  <h3 className="mt-4 text-3xl font-semibold text-[#3c1717]">Timeless silhouettes</h3>
                  <p className="mt-4 text-sm leading-7 text-[#6c4d41]">
                    Clean lines, premium tailoring, and soft volume combine for a refined visual statement.
                  </p>
                </div>
                <a href="/discover" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#8c4a37] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#6f3b2b]">
                  Discover Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionLayout;
