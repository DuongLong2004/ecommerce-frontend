import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axios";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const formatVND = (price) => {
  if (!price && price !== 0) return "";
  return Number(price).toLocaleString("vi-VN") + "đ";
};
const toSoldLabel = (s) =>
  s > 999 ? (s / 1000).toFixed(1) + "k" : s || 0;

/* ─────────────────────────────────────────────
   SVG Icons — Lucide-style, zero deps
───────────────────────────────────────────── */
const Svg = ({ size = 16, stroke = "currentColor", fill = "none", sw = 1.75, style = {}, children }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}
    stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}>
    {children}
  </svg>
);

const IcoHeart = ({ filled }) => filled ? (
  <Svg size={17} fill="#e63946" stroke="#e63946" sw={1.5}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
) : (
  <Svg size={17} stroke="#c4c4c4" sw={1.75}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);
const IcoTag = () => (
  <Svg size={11} stroke="#fde68a" sw={2.2}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1" fill="#fde68a" stroke="none" />
  </Svg>
);
const IcoFire = () => (
  <Svg size={11} stroke="#f97316" sw={1.8}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Svg>
);
const IcoArrow = () => (
  <Svg size={13} stroke="currentColor" sw={2.2}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </Svg>
);
const IcoGlobe = () => (
  <Svg size={10} stroke="#9ca3af" sw={1.6}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </Svg>
);
const IcoWarning = () => (
  <Svg size={10} stroke="#fff" sw={2}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </Svg>
);
const IcoCheckCircle = () => (
  <Svg size={10} stroke="#15803d" sw={2.2}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </Svg>
);
const IcoShield = () => (
  <Svg size={10} stroke="#16a34a" sw={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
const IcoBox = () => (
  <Svg size={11} stroke="#94a3b8" sw={1.8}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </Svg>
);
const IcoSpinner = () => (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="none"
    stroke="#e63946" strokeWidth={2.5} strokeLinecap="round"
    style={{ display: "block", animation: "pcSpin .65s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IcoTruck = () => (
  <Svg size={10} stroke="currentColor" sw={1.8}>
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
    <rect width="7" height="7" x="14" y="10" rx="1" />
    <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
    <path d="M19 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
  </Svg>
);
const IcoReturn = () => (
  <Svg size={10} stroke="currentColor" sw={1.8}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);
const IcoVerified = () => (
  <Svg size={10} stroke="currentColor" sw={2}>
    <path d="M12 2l2.4 4.8 5.6.8-4 3.9.9 5.5L12 14.5l-4.9 2.5.9-5.5-4-3.9 5.6-.8z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
const IcoBolt = () => (
  <Svg size={9} stroke="#dc2626" sw={2} fill="#fee2e2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);
const IcoGift = () => (
  <Svg size={10} stroke="currentColor" sw={1.8}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </Svg>
);

/* ─────────────────────────────────────────────
   Star Rating
───────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center" style={{ gap: "1.5px" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 24 24" width={11} height={11}
        fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   Inject global styles once
───────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("pc-kf-rg")) {
  const st = document.createElement("style");
  st.id = "pc-kf-rg";
  st.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

    @keyframes pcHeartPop {
      0%  { transform:scale(1); }
      28% { transform:scale(1.6); }
      56% { transform:scale(.88); }
      78% { transform:scale(1.22); }
      100%{ transform:scale(1); }
    }
    @keyframes pcSpin    { to { transform:rotate(360deg); } }
    @keyframes pcShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .pc-heart-pop { animation: pcHeartPop .52s cubic-bezier(.34,1.56,.64,1) both; }

    .pc-skeleton {
      background: linear-gradient(90deg, #f5f5f5 25%, #ececec 50%, #f5f5f5 75%);
      background-size: 200% 100%;
      animation: pcShimmer 1.4s ease infinite;
    }

    .pc-wrap {
      border-radius: 20px;
      padding: 2px;
      background: transparent;
      transition: background .22s ease, box-shadow .26s ease;
    }
    @media(hover:hover) {
      .pc-wrap:hover {
        background: linear-gradient(135deg, #dc2626, #f97316);
        box-shadow: 0 16px 40px rgba(220,38,38,.14), 0 6px 14px rgba(0,0,0,.07);
      }
      .pc-wrap:hover .pc-prod-img { transform: translateY(-6px) !important; }
      .pc-wrap:hover .pc-title    { color: #b91c1c !important; }
      .pc-wrap:hover .pc-cta      {
        opacity: 1 !important;
        transform: translateY(0) !important;
        pointer-events: auto !important;
      }
    }

    .pc-card {
      border-radius: 18px;
      overflow: hidden;
      background: #fff;
      border: none;
    }

    .pc-prod-img { transition: transform .36s cubic-bezier(.22,1,.36,1); }
    .pc-title    { transition: color .2s; }

    .pc-wish {
      transition: transform .25s cubic-bezier(.34,1.56,.64,1),
                  box-shadow .25s, border-color .25s, background .25s;
    }
    .pc-wish:hover {
      transform: scale(1.15);
      box-shadow: 0 3px 14px rgba(230,57,70,.3) !important;
      border-color: #fca5a5 !important;
    }

    .pc-cta {
      opacity: 0;
      transform: translateY(6px);
      pointer-events: none;
      transition: opacity .2s ease, transform .2s ease;
    }
    .pc-cta-btn { transition: transform .16s, box-shadow .16s; }
    .pc-cta-btn:hover  { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(185,28,28,.46) !important; }
    .pc-cta-btn:active { transform: scale(.98); }
  `;
  document.head.appendChild(st);
}

/* ─────────────────────────────────────────────
   ProductCard
───────────────────────────────────────────── */
const ProductCard = ({ item, wishlistIds = [], onWishlistChange }) => {
  const [wished, setWished]       = useState(wishlistIds.includes(item.id));
  const [loading, setLoading]     = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isOutOfStock = item.stock === 0;
  const isLowStock   = item.stock > 0 && item.stock <= 5;
  const savedAmount  = item.oldPrice && !isOutOfStock ? item.oldPrice - item.price : null;

  useEffect(() => setWished(wishlistIds.includes(item.id)), [wishlistIds, item.id]);

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!localStorage.getItem("token")) {
      alert("Vui lòng đăng nhập để lưu yêu thích!"); return;
    }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 520);
    setLoading(true);
    try {
      if (wished) { await axiosClient.delete(`/wishlist/${item.id}`); setWished(false); }
      else         { await axiosClient.post(`/wishlist/${item.id}`);  setWished(true);  }
      onWishlistChange?.();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  return (
    <div
      className="pc-wrap w-full cursor-pointer"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 2px 10px rgba(0,0,0,.04)",
      }}
    >
      <div
        className={["pc-card relative flex flex-col w-full", isOutOfStock ? "opacity-[.68]" : ""].join(" ")}
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >

        {/* ─── DISCOUNT BADGE ──────────────────────────────────── */}
        {/* FIX: bỏ gradient + boxShadow, dùng solid đỏ đơn giản */}
        {item.discount && !isOutOfStock && (
          <div
            className="absolute top-0 left-0 z-10 flex items-center gap-[5px] px-[10px] py-[6px]"
            style={{
              background: "#dc2626",
              borderRadius: "0 0 10px 0",
            }}
          >
            <IcoTag />
            <span className="text-[10px] font-black text-white tracking-[.01em] leading-none">Giảm</span>
            <span className="text-[12.5px] font-black leading-none" style={{ color: "#fde68a" }}>{item.discount}%</span>
          </div>
        )}

        {/* ─── OUT OF STOCK ─────────────────────────────────────── */}
        {isOutOfStock && (
          <div className="absolute top-[10px] left-[10px] z-10 flex items-center gap-[4px] bg-slate-500 text-white px-[9px] py-[3.5px] rounded-full">
            <IcoBox />
            <span className="text-[9.5px] font-bold tracking-[.04em]">Hết hàng</span>
          </div>
        )}

        {/* ─── WISHLIST BTN ─────────────────────────────────────── */}
        <button
          onClick={handleWishlist}
          disabled={loading}
          title={wished ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          aria-label={wished ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          className={[
            "pc-wish",
            "absolute top-[10px] right-[10px] z-10",
            "w-[33px] h-[33px] rounded-full",
            "flex items-center justify-center",
            wished
              ? "bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] border-[1.5px] border-[#fca5a5] shadow-[0_2px_10px_rgba(230,57,70,.22)]"
              : "bg-white border-[1.5px] border-[#e5e7eb] shadow-[0_1px_6px_rgba(0,0,0,.07)]",
            heartAnim ? "pc-heart-pop" : "",
          ].join(" ")}
        >
          {loading ? <IcoSpinner /> : <IcoHeart filled={wished} />}
        </button>

        {/* ─── IMAGE ZONE ───────────────────────────────────────────
            FIX: đổi background từ trắng thuần sang #fafafa
            để tách vùng ảnh khỏi body card bên dưới
        ──────────────────────────────────────────────────────────── */}
        <Link to={`/product/${item.id}`} state={{ item }} tabIndex={-1} className="block">
          <div
            className="relative flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              height: 210,
              padding: "22px 18px 16px",
              background: "#fafafa",
            }}
          >
            {!imgLoaded && (
              <div className="pc-skeleton absolute w-[72px] h-[72px] rounded-xl" />
            )}

            <img
              src={item.img}
              alt={item.title}
              onLoad={() => setImgLoaded(true)}
              className="pc-prod-img relative z-[1] object-contain max-w-[90%]"
              style={{
                maxHeight: 152,
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity .3s, transform .36s cubic-bezier(.22,1,.36,1)",
              }}
            />

            {isOutOfStock && imgLoaded && (
              <div className="absolute inset-0 z-[2] bg-white/40" />
            )}

            {isLowStock && (
              <div
                className="absolute bottom-[10px] left-[10px] z-20 flex items-center gap-[4px] text-white px-[8px] py-[3px] rounded-full text-[9px] font-black"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                  boxShadow: "0 2px 6px rgba(245,158,11,.35)",
                }}
              >
                <IcoWarning />
                Còn {item.stock}
              </div>
            )}
          </div>
        </Link>

        {/* ─── DIVIDER ──────────────────────────────────────────── */}
        {/* FIX: bỏ gradient vàng, dùng line xám đơn giản */}
        <div style={{ height: 1, background: "#f0f0f0" }} />

        {/* ─── BODY ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 gap-[6px] px-[12px] pt-[10px] pb-[12px]">

          {/* Spec pills — FIX: đổi từ vàng sang xám trung tính */}
          {[item.display, item.ram, item.rom].filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-[3px]">
              {[item.display, item.ram, item.rom].filter(Boolean).map((s, i) => (
                <span key={i}
                  className="text-[9px] font-bold px-[6px] py-[2px] rounded-[4px] tracking-[.01em] leading-none"
                  style={{ color: "#52525b", background: "#f4f4f5", border: "1px solid #e4e4e7" }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <Link
            to={`/product/${item.id}`}
            state={{ item }}
            className="pc-title block font-extrabold text-[#1a1a1a] leading-[1.4] line-clamp-2 no-underline"
            style={{ fontSize: 13, minHeight: 36 }}
          >
            {item.title}
          </Link>

          {/* Stars + sold */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-[3px] min-w-0">
              <StarRating rating={item.avgRating || 0} />
              {item.avgRating > 0 && (
                <>
                  <span className="text-[9.5px] font-black text-amber-500 ml-[1px] shrink-0">{item.avgRating}</span>
                  <span className="text-[9px] text-slate-400 shrink-0">({item.totalReviews})</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-[3px] shrink-0 ml-1">
              <IcoFire />
              <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">
                {toSoldLabel(item.sold)} đã bán
              </span>
            </div>
          </div>

          {/* Price row */}
          <div className="flex flex-wrap items-baseline gap-x-[6px] gap-y-[2px] min-w-0">
            <span
              className="font-black leading-none shrink-0"
              style={{
                fontSize: 17,
                letterSpacing: "-.4px",
                color: isOutOfStock ? "#9ca3af" : "#dc2626",
              }}
            >
              {formatVND(item.price)}
            </span>
            {item.oldPrice && (
              <span
                className="text-slate-300 line-through font-medium shrink-0"
                style={{ fontSize: 10 }}
              >
                {formatVND(item.oldPrice)}
              </span>
            )}
          </div>

          {/* Tiết kiệm — giữ xanh lá, có semantic riêng */}
          {savedAmount && (
            <div
              className="inline-flex items-center gap-[4px] self-start px-[7px] py-[2.5px] rounded-full text-[9px] font-bold"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
            >
              <IcoCheckCircle />
              Tiết kiệm {formatVND(savedAmount)}
            </div>
          )}

          {/* ── BADGES — FIX: cả 3 về cùng màu xám, không loè loẹt */}
          {!isOutOfStock && (
            <div className="hidden sm:flex flex-wrap gap-[4px] mt-[1px]">
              <span
                className="inline-flex items-center gap-[3px] text-[9px] font-bold px-[7px] py-[3px] rounded-[6px]"
                style={{ background: "#f4f4f5", border: "1px solid #e4e4e7", color: "#52525b" }}
              >
                <IcoTruck />Giao nhanh
              </span>
              <span
                className="inline-flex items-center gap-[3px] text-[9px] font-bold px-[7px] py-[3px] rounded-[6px]"
                style={{ background: "#f4f4f5", border: "1px solid #e4e4e7", color: "#52525b" }}
              >
                <IcoReturn />Đổi trả 30 ngày
              </span>
              <span
                className="inline-flex items-center gap-[3px] text-[9px] font-bold px-[7px] py-[3px] rounded-[6px]"
                style={{ background: "#f4f4f5", border: "1px solid #e4e4e7", color: "#52525b" }}
              >
                <IcoVerified />Chính hãng
              </span>
            </div>
          )}

          {/* Warranty */}
          {item.warranty && (
            <div className="hidden sm:flex items-center gap-[4px]">
              <IcoShield />
              <span className="text-[9px] text-slate-500">{item.warranty}</span>
            </div>
          )}

          {/* Promo tag */}
          {item.promoText && (
            <div
              className="hidden sm:flex items-center gap-[4px] px-[8px] py-[4px] rounded-[6px] text-[9px] font-black"
              style={{ background: "#fff7ed", border: "1px dashed #fdba74", color: "#c2410c" }}
            >
              <IcoGift /><span>{item.promoText}</span>
            </div>
          )}

          {/* Flash sale bar */}
          {item.flashSalePercent != null && !isOutOfStock && (
            <div className="hidden sm:block">
              <div className="flex items-center justify-between mb-[3px]">
                <span className="inline-flex items-center gap-[3px] text-[9px] font-black" style={{ color: "#dc2626" }}>
                  <IcoBolt />Flash sale
                </span>
                <span className="text-[9px] font-bold text-slate-400">Đã bán {item.flashSalePercent}%</span>
              </div>
              <div className="w-full h-[5px] rounded-full overflow-hidden" style={{ background: "#fee2e2" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(item.flashSalePercent, 100)}%`,
                    background: "linear-gradient(90deg,#dc2626,#f97316)",
                    transition: "width .6s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-h-[2px]" />

          {/* Footer */}
          {/* FIX: nation bỏ box border, chỉ text xám / brand đổi sang đỏ nhạt */}
          <div className="flex items-center justify-between pt-[8px]" style={{ borderTop: "1px solid #f3f4f6" }}>
            <span className="flex items-center gap-[4px] text-[9px] text-slate-400">
              <IcoGlobe />
              <span className="truncate max-w-[60px]">{item.nation}</span>
            </span>
            <span
              className="text-[9px] font-black px-[8px] py-[2.5px] rounded-[5px] tracking-[.06em] uppercase"
              style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              {item.brand}
            </span>
          </div>
        </div>

        {/* ─── CTA HOVER OVERLAY — chỉ desktop ─────────────────── */}
        {!isOutOfStock && (
          <div
            className="pc-cta absolute bottom-0 left-0 right-0 px-[11px] pb-[12px] pt-10 hidden sm:block"
            style={{ background: "linear-gradient(to top,rgba(255,255,255,1) 50%,transparent)" }}
          >
            <Link
              to={`/product/${item.id}`}
              state={{ item }}
              className="pc-cta-btn flex items-center justify-center gap-[6px] w-full py-[10px] rounded-[11px] text-white text-[11px] font-black tracking-[.04em] no-underline"
              style={{
                background: "linear-gradient(135deg,#b91c1c 0%,#e63946 55%,#f97316 100%)",
                boxShadow: "0 4px 14px rgba(185,28,28,.36)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Xem chi tiết <IcoArrow />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

/*
  ════════════════════════════════════════════════
  ITEM SHAPE
  ════════════════════════════════════════════════
  {
    id, title, img,
    price, oldPrice?,
    discount?,           // số %: 11
    stock,               // 0 = hết hàng; 1-5 = sắp hết
    sold?,
    avgRating?,          // 0–5
    totalReviews?,
    display?, ram?, rom?,
    nation?, brand?,
    warranty?,           // "Bảo hành 24 tháng"
    promoText?,          // "Tặng tai nghe 500k"
    flashSalePercent?,   // 0–100
  }

  ════════════════════════════════════════════════
  RESPONSIVE GRID (dùng ngoài component)
  ════════════════════════════════════════════════
  <div className="
    grid gap-3
    grid-cols-2
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    xl:grid-cols-5
  ">
    {products.map(item => (
      <ProductCard key={item.id} item={item}
        wishlistIds={wishlistIds}
        onWishlistChange={fetchWishlist}
      />
    ))}
  </div>
*/