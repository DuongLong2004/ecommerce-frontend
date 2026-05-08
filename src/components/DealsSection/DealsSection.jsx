import React from "react";

const banners = [
  { src: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/e6/f6/e6f6ae536aacf8eb1dc936a48c02267b.png", badge: "HOT" },
  { src: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/c3/37/c3370fa4d4cf3cef53798e0bce576e1b.png", badge: "SALE" },
  { src: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/69/a9/69a98c98aa2807af142256bf3f1ad1fc.png", badge: "ƯU ĐÃI" },
  { src: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/69/24/692481985b335acaf989a8e9ccc3c875.png", badge: "MỚI" },
];

const DealsSection = () => {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-10">
      {/* Title */}
      <h3 className="flex items-center gap-2 text-base font-medium tracking-widest mb-5 border-l-4 border-red-600 pl-3">
        <svg className="w-4 h-4 fill-red-600 shrink-0" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        GIAN HÀNG ƯU ĐÃI
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {banners.map(({ src, badge }, i) => (
          <div
            key={i}
            className="relative rounded-2xl overflow-hidden border border-gray-200 cursor-pointer
                       transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.015]
                       hover:shadow-xl"
          >
            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
              {badge}
            </span>
            <img
              src={src}
              alt={`Banner ưu đãi ${i + 1}`}
              className="w-full h-full object-cover aspect-[3/5]"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DealsSection;