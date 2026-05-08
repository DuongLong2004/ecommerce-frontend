import React, { useState, useEffect, useCallback } from "react";
import "./Banner.css";

/* =====================================================
   DATA
===================================================== */
const mainBanners = [
  "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/desk_header_54255dc0c8.png",
  "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/desk_header_d7212039d2.png",
  "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/desk_header_cd27fb9ffd.png",
];

const bannersLeft = [
  "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/7b/33/7b33fab08d128b808c41250a00d55416.png",
  "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/05/f1/05f12c8aca8a859ace2dca446dd36cbe.png",
  "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/43/d8/43d8c2189dddf679cf2b8e2976e2d797.png",
];

const bannersRight = [
  "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/43/d8/43d8c2189dddf679cf2b8e2976e2d797.png",
  "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/5f/87/5f87f1c601a9cd0720366dcde78ffc3d.png",
  "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/7b/33/7b33fab08d128b808c41250a00d55416.png",
];

/* =====================================================
   HOOK: useSlider — tái sử dụng cho cả 3 slider
===================================================== */
const useSlider = (total, autoMs = 0) => {
  const [index, setIndex] = useState(0);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % total),
    [total]
  );
  const goTo = useCallback((i) => setIndex(i), []);

  useEffect(() => {
    if (!autoMs) return;
    const timer = setInterval(next, autoMs);
    return () => clearInterval(timer);
  }, [next, autoMs]);

  return { index, prev, next, goTo };
};

/* =====================================================
   SUB-COMPONENT: SmallSlider
===================================================== */
const SmallSlider = ({ images, autoMs = 4000 }) => {
  const { index, prev, next, goTo } = useSlider(images.length, autoMs);

  return (
    <div className="bn-small">
      {/* Slides */}
      <div
        className="bn-small-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img key={i} src={src} alt={`banner-${i}`} className="bn-small-img" />
        ))}
      </div>

      {/* Nav buttons */}
      <button className="bn-snav bn-snav-l" onClick={prev} aria-label="Trước">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button className="bn-snav bn-snav-r" onClick={next} aria-label="Tiếp">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Dots */}
      <div className="bn-sdots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`bn-sdot ${i === index ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */
const Banner = () => {
  const { index, prev, next, goTo } = useSlider(mainBanners.length, 4500);

  return (
    <div className="bn-root Reponsive_mobile">
      <div className="bn-inner">

        {/* ── MAIN SLIDER ── */}
        <div className="bn-main">
          <div
            className="bn-main-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {mainBanners.map((src, i) => (
              <img key={i} src={src} alt={`main-banner-${i}`} className="bn-main-img" />
            ))}
          </div>

          {/* Nav buttons */}
          <button className="bn-nav bn-nav-l" onClick={prev} aria-label="Trước">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="bn-nav bn-nav-r" onClick={next} aria-label="Tiếp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {/* Dots */}
          <div className="bn-dots">
            {mainBanners.map((_, i) => (
              <button
                key={i}
                className={`bn-dot ${i === index ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── SMALL SLIDERS ── */}
        <div className="bn-row">
          <SmallSlider images={bannersLeft}  autoMs={4000} />
          <SmallSlider images={bannersRight} autoMs={4000} />
        </div>

      </div>
    </div>
  );
};

export default Banner;