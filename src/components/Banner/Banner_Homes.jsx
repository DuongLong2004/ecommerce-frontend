import React, { useState, useEffect } from "react";

const BannerPhones = () => {
  const bannersLeft = [
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/7b/33/7b33fab08d128b808c41250a00d55416.png",
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/05/f1/05f12c8aca8a859ace2dca446dd36cbe.png",
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/43/d8/43d8c2189dddf679cf2b8e2976e2d797.png",
  ];

  const bannersRight = [
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/43/d8/43d8c2189dddf679cf2b8e2976e2d797.png",
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/7b/33/7b33fab08d128b808c41250a00d55416.png",
    "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/5f/87/5f87f1c601a9cd0720366dcde78ffc3d.png",
  ];

  const [indexLeft, setIndexLeft] = useState(0);
  const [indexRight, setIndexRight] = useState(0);

  const nextLeft = () => setIndexLeft((prev) => (prev + 1) % bannersLeft.length);
  const prevLeft = () =>
    setIndexLeft((prev) => (prev - 1 + bannersLeft.length) % bannersLeft.length);

  const nextRight = () => setIndexRight((prev) => (prev + 1) % bannersRight.length);
  const prevRight = () =>
    setIndexRight((prev) => (prev - 1 + bannersRight.length) % bannersRight.length);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setIndexLeft((prev) => (prev + 1) % bannersLeft.length);
      setIndexRight((prev) => (prev + 1) % bannersRight.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const sliderClass =
    "group relative flex-1 overflow-hidden rounded-2xl bg-white border border-black/5 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

  const btnBase =
    "absolute top-1/2 -translate-y-1/2 z-20 w-[38px] h-[38px] rounded-full bg-black/45 hover:bg-black/65 text-white text-xl flex items-center justify-center cursor-pointer border-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300";

  const imgClass =
    "w-full h-auto object-contain rounded-xl bg-white animate-bpFadeIn";

  return (
    <>
      <style>{`
        @keyframes bpFadeIn {
          0% {
            opacity: 0;
            transform: scale(1.08);
            filter: blur(6px) brightness(0.85);
          }
          60% {
            opacity: 1;
            transform: scale(1.02);
            filter: blur(2px) brightness(1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0) brightness(1);
          }
        }
        .animate-bpFadeIn {
          animation: bpFadeIn 0.7s cubic-bezier(.22,.61,.36,1) forwards;
        }
      `}</style>

      {/* Cả wrapper ẩn trên mobile, chỉ hiện từ md (≥768px) */}
      <div className="hidden md:flex w-full justify-center mt-[30px]">
        <div className="flex flex-row gap-[14px] w-full max-w-[1100px]">
          {/* LEFT SLIDER */}
          <div className={sliderClass}>
            <button
              className={`${btnBase} left-[10px]`}
              onClick={prevLeft}
              aria-label="Previous"
            >
              ❮
            </button>
            <div className="w-full h-auto">
              <img
                key={indexLeft}
                src={bannersLeft[indexLeft]}
                alt="banner"
                className={imgClass}
              />
            </div>
            <button
              className={`${btnBase} right-[10px]`}
              onClick={nextLeft}
              aria-label="Next"
            >
              ❯
            </button>
          </div>

          {/* RIGHT SLIDER */}
          <div className={sliderClass}>
            <button
              className={`${btnBase} left-[10px]`}
              onClick={prevRight}
              aria-label="Previous"
            >
              ❮
            </button>
            <div className="w-full h-auto">
              <img
                key={indexRight}
                src={bannersRight[indexRight]}
                alt="banner"
                className={imgClass}
              />
            </div>
            <button
              className={`${btnBase} right-[10px]`}
              onClick={nextRight}
              aria-label="Next"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerPhones;