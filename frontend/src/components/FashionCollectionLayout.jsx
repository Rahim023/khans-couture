import React from "react";

/**
 * FashionCollectionLayout
 * Renders the 2023 fashion collection section in a responsive split layout.
 * Uses backend-driven imagery to avoid scaffold placeholders.
 */
export default function FashionCollectionLayout({ assetGroups = {} }) {
  const primaryHero = Array.isArray(assetGroups.collectionImages) ? assetGroups.collectionImages[0] : undefined;
  const secondaryHero = Array.isArray(assetGroups.heroImages) ? assetGroups.heroImages[0] : undefined;
  const tertiaryHero = Array.isArray(assetGroups.heroImages) ? assetGroups.heroImages[1] : undefined;

  return (
    <section id="collection-2023" className="w-full bg-[#f7f0e8] py-10 sm:py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[35%_65%] items-center">

          <div className="flex flex-col justify-center rounded-[24px] border border-[#e7d8cb] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:p-12 lg:rounded-[32px]">
            <p className="text-sm uppercase tracking-[0.4em] text-[#b38066]">Vol. 10 · November Edition</p>
            <h2 className="mt-4 text-[34px] sm:text-5xl lg:text-6xl font-black text-[#590f0f] leading-[1.05]">
              2023 Collection
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#5a3a2c] max-w-2xl leading-relaxed">
              Discover an elevated wardrobe edit shaped by couture craftsmanship, luxurious textures, and runway-inspired silhouettes.
            </p>

            <div className="mt-10 rounded-3xl bg-[#f1eae2] px-6 py-6 sm:px-8 sm:py-8 text-[#590f0f] shadow-sm border border-[#eedbd0]">
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">NEW</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed">
                Shop the new season collection with signature styling, rich accents, and modern tailoring.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:grid-rows-[280px_280px] lg:gap-6">
            <div className="relative h-[420px] overflow-hidden rounded-[28px] bg-[#ede3da] sm:h-auto sm:row-span-2">
              {primaryHero && (
                <img
                  src={primaryHero}
                  alt="Model wearing luxury fashion"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute bottom-6 left-6 rounded-3xl bg-[#590f0f]/90 px-4 py-3 text-white shadow-lg">
                <p className="text-xs uppercase tracking-[0.3em]">Collection</p>
                <p className="mt-1 text-xl font-semibold">Royal Edit</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-[#f5efe6]">
              {secondaryHero && (
                <img
                  src={secondaryHero}
                  alt="Model portrait"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="overflow-hidden rounded-[28px] bg-[#f5efe6]">
              {tertiaryHero && (
                <img
                  src={tertiaryHero}
                  alt="Model seated"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
