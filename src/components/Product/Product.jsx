import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../api/axios";

/* ══════════════════════════════════════════
   UTILS
══════════════════════════════════════════ */
const fmt = (val) => {
  if (!val && val !== 0) return "";
  if (typeof val === "string" && /[^\d.,\s]/.test(val)) return val;
  const n = typeof val === "string" ? parseFloat(val.replace(/[^\d]/g, "")) : val;
  return isNaN(n) ? String(val) : n.toLocaleString("vi-VN") + "đ";
};

const fmtDiscount = (val) => {
  if (!val && val !== 0) return "";
  if (typeof val === "number") return `-${val}%`;
  const s = String(val).trim();
  if (s.includes("%") || s.includes("đ")) return s;
  if (/^\d+$/.test(s)) return `-${s}%`;
  return s;
};

const timeAgo = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(d).toLocaleDateString("vi-VN");
};

const getCartKey = () => {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  return u?.id ? `cart_${u.id}` : "cart_guest";
};

const getCurrentUser = () => JSON.parse(localStorage.getItem("user") || "{}");

/* ══════════════════════════════════════════
   LUCIDE-STYLE SVG ICONS (Inline, crisp)
══════════════════════════════════════════ */
const Icon = ({ d, size = 16, className = "", fill = "none", strokeWidth = 1.75, children, viewBox = "0 0 24 24" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  ShoppingCart: ({ size = 16 }) => (
    <Icon size={size}>
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" />
    </Icon>
  ),
  Zap: ({ size = 16, filled = false }) => (
    <Icon size={size} fill={filled ? "currentColor" : "none"}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Icon>
  ),
  Heart: ({ size = 20, filled = false }) => (
    <Icon size={size} fill={filled ? "currentColor" : "none"}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Icon>
  ),
  Star: ({ size = 14, filled = false }) => (
    <Icon size={size} fill={filled ? "#F59E0B" : "none"} stroke={filled ? "#F59E0B" : "#D1D5DB"} strokeWidth={1.5}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Icon>
  ),
  Check: ({ size = 16 }) => (
    <Icon size={size} strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </Icon>
  ),
  ChevronLeft: ({ size = 16 }) => (
    <Icon size={size} strokeWidth={2}>
      <polyline points="15 18 9 12 15 6" />
    </Icon>
  ),
  ChevronRight: ({ size = 16 }) => (
    <Icon size={size} strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </Icon>
  ),
  Shield: ({ size = 16 }) => (
    <Icon size={size}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </Icon>
  ),
  Truck: ({ size = 16 }) => (
    <Icon size={size}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </Icon>
  ),
  RefreshCw: ({ size = 16 }) => (
    <Icon size={size}>
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Icon>
  ),
  Lock: ({ size = 16 }) => (
    <Icon size={size}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  ),
  Send: ({ size = 16 }) => (
    <Icon size={size}>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </Icon>
  ),
  Trash2: ({ size = 16 }) => (
    <Icon size={size}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </Icon>
  ),
  Tag: ({ size = 14 }) => (
    <Icon size={size}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </Icon>
  ),
  Cpu: ({ size = 14 }) => (
    <Icon size={size}>
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </Icon>
  ),
  Camera: ({ size = 14 }) => (
    <Icon size={size}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </Icon>
  ),
  Battery: ({ size = 14 }) => (
    <Icon size={size}>
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
      <line x1="23" y1="13" x2="23" y2="11" strokeWidth={3} />
    </Icon>
  ),
  Globe: ({ size = 14 }) => (
    <Icon size={size}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Icon>
  ),
  Database: ({ size = 14 }) => (
    <Icon size={size}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </Icon>
  ),
  Monitor: ({ size = 14 }) => (
    <Icon size={size}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </Icon>
  ),
  CreditCard: ({ size = 16 }) => (
    <Icon size={size}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </Icon>
  ),
  Home: ({ size = 14 }) => (
    <Icon size={size}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  ),
  CornerDownLeft: ({ size = 14 }) => (
    <Icon size={size}>
      <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </Icon>
  ),
  Edit3: ({ size = 14 }) => (
    <Icon size={size}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </Icon>
  ),
  MessageSquare: ({ size = 16 }) => (
    <Icon size={size}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Icon>
  ),
  Package: ({ size = 40 }) => (
    <Icon size={size} strokeWidth={1.25}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </Icon>
  ),
  X: ({ size = 16 }) => (
    <Icon size={size} strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  ),
  TrendingUp: ({ size = 14 }) => (
    <Icon size={size}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </Icon>
  ),
  Award: ({ size = 16 }) => (
    <Icon size={size}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </Icon>
  ),
  Wrench: ({ size = 20 }) => (
    <Icon size={size}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </Icon>
  ),
  CheckCircle: ({ size = 20 }) => (
    <Icon size={size}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11" />
    </Icon>
  ),
  Loader: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  ShoppingBag: ({ size = 16 }) => (
    <Icon size={size}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Icon>
  ),
};

/* ══════════════════════════════════════════
   STAR RATING DISPLAY
══════════════════════════════════════════ */
const Stars = ({ rating = 0, size = 14 }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Icons.Star key={i} filled={i <= Math.round(rating)} size={size} />
    ))}
  </span>
);

/* ══════════════════════════════════════════
   AVATAR
══════════════════════════════════════════ */
const PALETTES = [
  { bg: "bg-red-100", text: "text-red-600" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

const Avatar = ({ name, size = 38 }) => {
  const p = PALETTES[(name?.charCodeAt(0) || 0) % PALETTES.length];
  return (
    <div
      className={`${p.bg} ${p.text} rounded-full font-bold flex items-center justify-center flex-shrink-0 select-none`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
};

/* ══════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════ */
const ConfirmDialog = ({ open, message, onOk, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]">
      <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl animate-[scaleIn_0.2s_ease]">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 text-red-500">
          <Icons.Trash2 size={20} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">Xác nhận xóa</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onOk}
            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
          >
            Xóa đánh giá
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   RATING CHIP
══════════════════════════════════════════ */
const CHIP = {
  1: { cls: "bg-rose-50 text-rose-700", dot: "bg-rose-500", label: "Rất tệ" },
  2: { cls: "bg-orange-50 text-orange-700", dot: "bg-orange-500", label: "Không hài lòng" },
  3: { cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", label: "Bình thường" },
  4: { cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", label: "Hài lòng" },
  5: { cls: "bg-teal-50 text-teal-700", dot: "bg-teal-500", label: "Tuyệt vời!" },
};
const RatingChip = ({ r }) => {
  const c = CHIP[r] || CHIP[3];
  return (
    <span className={`inline-flex items-center gap-1 ${c.cls} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

/* ══════════════════════════════════════════
   REVIEW ITEM
══════════════════════════════════════════ */
const ReviewItem = ({ rv, currentUserId, currentUserRole, onDelete, onReply, idx }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const replyRef = useRef(null);
  const LIMIT = 200;
  const comment = rv.comment || "";
  const isLong = comment.length > LIMIT;
  const isAdmin = currentUserRole === "admin";

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    const ok = await onReply(rv.id, replyText.trim());
    setReplying(false);
    if (ok) { setReplyText(""); setReplyOpen(false); }
  };

  const openReplyBox = () => {
    setReplyOpen(true);
    setTimeout(() => replyRef.current?.focus(), 60);
  };

  return (
    <div
      className="px-5 py-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
      style={{ animation: `slideUp 0.3s ease ${idx * 0.05}s both` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={rv.User?.name} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 truncate">{rv.User?.name || "Người dùng"}</span>
              <Stars rating={rv.rating} />
              <RatingChip r={rv.rating} />
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{timeAgo(rv.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && !replyOpen && (
            <button
              onClick={openReplyBox}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              <Icons.CornerDownLeft size={12} /> {rv.reply ? "Sửa" : "Phản hồi"}
            </button>
          )}
          {(rv.userId === currentUserId || isAdmin) && (
            <button
              onClick={() => onDelete(rv.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
            >
              <Icons.Trash2 size={12} /> Xóa
            </button>
          )}
        </div>
      </div>

      {comment && (
        <div className="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border-l-3 border-l-slate-200 border border-slate-100">
          {isLong && !expanded ? comment.slice(0, LIMIT) + "…" : comment}
          {isLong && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="ml-1 text-rose-500 font-bold text-xs hover:text-rose-700 transition-colors"
            >
              {expanded ? " Thu gọn" : " Xem thêm"}
            </button>
          )}
        </div>
      )}

      {rv.reply && (
        <div className="mt-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-3.5 border border-blue-100 border-l-4 border-l-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              <Icons.Award size={10} /> Phản hồi từ Shop
            </span>
            {(rv.replyAt ?? rv.updatedAt) && (
              <span className="text-[10px] text-blue-400">{timeAgo(rv.replyAt ?? rv.updatedAt)}</span>
            )}
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">{rv.reply}</p>
        </div>
      )}

      {replyOpen && isAdmin && (
        <div className="mt-3 bg-blue-50/60 rounded-xl p-4 border border-blue-200 animate-[slideUp_0.2s_ease]">
          <textarea
            ref={replyRef}
            placeholder={rv.reply ? "Cập nhật nội dung phản hồi..." : "Viết phản hồi cho khách hàng..."}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendReply();
              if (e.key === "Escape") { setReplyOpen(false); setReplyText(""); }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-sm text-slate-800 resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed"
          />
          <div className="flex justify-between items-center mt-2.5">
            <span className="text-[11px] text-slate-400">Ctrl+Enter để gửi · Esc để hủy</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setReplyOpen(false); setReplyText(""); }}
                className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSendReply}
                disabled={replying}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {replying ? <><Icons.Loader size={12} /> Đang gửi...</> : <><Icons.Send size={12} /> {rv.reply ? "Cập nhật" : "Gửi"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   FLASH SALE BANNER
══════════════════════════════════════════ */
const FlashSaleBanner = ({ flashInfo }) => {
  const { salePrice, originalPrice, stockLeft, stockLimit, stockSold, saleEndAt } = flashInfo;
  const discount = originalPrice && salePrice
    ? Math.round((1 - Number(salePrice) / Number(originalPrice)) * 100)
    : 0;

  const [secsLeft, setSecsLeft] = useState(0);
  useEffect(() => {
    if (!saleEndAt) return;
    const calc = () => Math.max(0, Math.floor((new Date(saleEndAt) - Date.now()) / 1000));
    setSecsLeft(calc());
    const t = setInterval(() => setSecsLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [saleEndAt]);

  const pad = (n) => String(n).padStart(2, "0");
  const h = Math.floor(secsLeft / 3600);
  const m = Math.floor((secsLeft % 3600) / 60);
  const s = secsLeft % 60;

  const soldPct = stockLimit > 0 ? Math.min(100, Math.round((stockSold / stockLimit) * 100)) : 0;
  const isSoldOut = stockLeft !== null && stockLeft <= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_4px_24px_rgba(245,158,11,0.15)]">
      {/* Decorative glow */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-3 py-1.5 rounded-lg tracking-wider shadow-sm">
            <Icons.Zap size={12} filled />
            FLASH SALE
          </div>
          {discount > 0 && (
            <span className="bg-red-50 text-red-600 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-red-200">
              -{discount}%
            </span>
          )}
        </div>
        {saleEndAt && secsLeft > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-amber-800">Kết thúc sau:</span>
            {[pad(h), pad(m), pad(s)].map((v, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="font-black text-amber-600 text-sm leading-none">:</span>}
                <span className="bg-amber-900 text-white font-black text-[13px] px-1.5 py-0.5 rounded-md min-w-[26px] text-center tabular-nums">{v}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3 flex-wrap mb-3">
        <span className="text-3xl font-black text-red-600 tabular-nums leading-none">
          {Number(salePrice).toLocaleString("vi-VN")}đ
        </span>
        {originalPrice && (
          <span className="text-sm text-slate-400 line-through tabular-nums">
            {Number(originalPrice).toLocaleString("vi-VN")}đ
          </span>
        )}
      </div>

      {stockLimit !== null && stockLimit > 0 && (
        <div>
          <div className="h-2 bg-amber-200 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${soldPct >= 80 ? "bg-red-500" : "bg-gradient-to-r from-amber-400 to-orange-400"}`}
              style={{ width: `${Math.max(2, soldPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className={`font-semibold ${isSoldOut ? "text-red-600" : "text-amber-800"}`}>
              {isSoldOut ? "🔴 Hết suất" : `Còn ${stockLeft} suất`}
            </span>
            <span className="text-amber-700">Đã bán {soldPct}%</span>
          </div>
        </div>
      )}
      {stockLimit === null && (
        <span className="text-xs font-semibold text-amber-700">⚡ Không giới hạn số lượng</span>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   TRUST BADGE
══════════════════════════════════════════ */
const TrustBadge = ({ icon, label, sub, color }) => (
  <div className={`flex items-center gap-2.5 bg-white rounded-2xl p-3 border border-slate-100 hover:border-[${color}]/30 transition-colors group`}>
    <div className={`w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`} style={{ color }}>
      {icon}
    </div>
    <div>
      <div className="text-[11.5px] font-bold text-slate-800 leading-tight">{label}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const flashState = location.state?.item;
  const flashInfo = (flashState?.salePrice && flashState?.placementId)
    ? {
      salePrice: flashState.salePrice,
      originalPrice: flashState.price,
      placementId: flashState.placementId,
      stockLeft: flashState.stockLeft ?? null,
      stockLimit: flashState.stockLimit ?? null,
      stockSold: flashState.stockSold ?? 0,
      saleStartAt: flashState.saleStartAt ?? null,
      saleEndAt: flashState.saleEndAt ?? null,
    }
    : null;

  const isFlashActive = flashInfo && (() => {
    if (!flashInfo.salePrice || !flashInfo.placementId) return false;
    const now = Date.now();
    const start = flashInfo.saleStartAt ? new Date(flashInfo.saleStartAt).getTime() : 0;
    const end = flashInfo.saleEndAt ? new Date(flashInfo.saleEndAt).getTime() : Infinity;
    if (now < start) return false;
    if (now >= end) return false;
    if (flashInfo.stockLeft !== null && flashInfo.stockLeft <= 0) return false;
    return true;
  })();

  const [product, setProduct] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgZoom, setImgZoom] = useState(false);
  const [activeTab, setActiveTab] = useState("specs");
  const [wished, setWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [revLoading, setRevLoading] = useState(true);
  const [filterStar, setFilterStar] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [myRating, setMyRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);
  const [confirmDel, setConfirmDel] = useState({ open: false, id: null });

  useEffect(() => {
    axiosClient.get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => setProduct(location.state?.item || null))
      .finally(() => setLoading(false));
  }, [id]);

  const loadReviews = useCallback(async () => {
    setRevLoading(true);
    try {
      const res = await axiosClient.get(`/products/${id}/reviews`);
      const d = res.data;
      const list = d?.data?.reviews ?? d?.data ?? d?.reviews ?? d ?? [];
      setReviews(Array.isArray(list) ? list : []);
    } catch { setReviews([]); }
    finally { setRevLoading(false); }
  }, [id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    axiosClient.get("/wishlist")
      .then((res) => {
        const list = res.data.data ?? res.data ?? [];
        setWished(Array.isArray(list)
          ? list.some((it) => String(it.productId ?? it.id ?? it.ProductId) === String(id))
          : false
        );
      })
      .catch(() => { });
  }, [id]);

  const avgRating = reviews.length ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const totalReviews = reviews.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? Math.round(reviews.filter((r) => r.rating === star).length / reviews.length * 100) : 0,
  }));
  const displayedReviews = [...reviews]
    .filter((r) => filterStar === 0 || r.rating === filterStar)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
      <style>{KEYFRAMES}</style>
      <div className="w-10 h-10 border-2 border-slate-200 border-t-rose-500 rounded-full animate-spin" />
      <p className="text-sm font-medium">Đang tải sản phẩm...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-5">
      <style>{KEYFRAMES}</style>
      <div className="text-slate-200"><Icons.Package size={64} /></div>
      <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
      <p className="text-sm text-slate-500">Sản phẩm có thể đã bị xoá hoặc không tồn tại.</p>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-500 transition-all"
      >
        <Icons.ChevronLeft size={15} /> Quay lại
      </button>
    </div>
  );

  const isOOS = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discLabel = fmtDiscount(product.discount);
  const curUser = getCurrentUser();
  const displayPrice = isFlashActive ? flashInfo.salePrice : product.price;

  const addToCart = () => {
    const key = getCartKey();
    const cart = JSON.parse(localStorage.getItem(key) || "[]");
    const cartItemId = isFlashActive
      ? `flash_${product.id}_${flashInfo.placementId}`
      : `normal_${product.id}`;
    const ex = cart.find((i) => i.cartItemId === cartItemId);
    if (ex) { ex.quantity += qty; }
    else {
      cart.push({
        ...product,
        cartItemId,
        quantity: qty,
        isFlashSale: !!isFlashActive,
        salePrice: isFlashActive ? Number(flashInfo.salePrice) : null,
        placementId: isFlashActive ? flashInfo.placementId : null,
        finalPrice: isFlashActive ? Number(flashInfo.salePrice) : Number(product.price),
      });
    }
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2400);
  };

  const buyNow = () => {
    const item = {
      ...product,
      quantity: qty,
      isFlashSale: !!isFlashActive,
      salePrice: isFlashActive ? Number(flashInfo.salePrice) : null,
      placementId: isFlashActive ? flashInfo.placementId : null,
      finalPrice: isFlashActive ? Number(flashInfo.salePrice) : Number(product.price),
    };
    sessionStorage.setItem("buynow", JSON.stringify([item]));
    navigate("/checkout");
  };

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!localStorage.getItem("token")) { alert("Vui lòng đăng nhập để lưu yêu thích!"); return; }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 600);
    setWishLoading(true);
    try {
      if (wished) { await axiosClient.delete(`/wishlist/${product.id}`); setWished(false); }
      else { await axiosClient.post(`/wishlist/${product.id}`); setWished(true); }
    } catch (err) { alert("Lỗi: " + (err.response?.data?.message || err.message)); }
    finally { setWishLoading(false); }
  };

  const handleAdminReply = useCallback(async (reviewId, text) => {
    if (!product?.id || !text.trim()) return false;
    const now = new Date().toISOString();
    try {
      await axiosClient.patch(`/products/${product.id}/reviews/${reviewId}/reply`, { reply: text });
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, reply: text, replyAt: now } : r));
      return true;
    } catch { return false; }
  }, [product]);

  const handleSubmitReview = async () => {
    if (!localStorage.getItem("token")) { setReviewMsg({ type: "error", text: "Vui lòng đăng nhập để đánh giá!" }); return; }
    if (!myRating) { setReviewMsg({ type: "error", text: "Vui lòng chọn số sao!" }); return; }
    if (!myComment.trim()) { setReviewMsg({ type: "error", text: "Vui lòng nhập nội dung nhận xét!" }); return; }
    setSubmitting(true); setReviewMsg(null);
    try {
      await axiosClient.post(`/products/${id}/reviews`, { rating: myRating, comment: myComment.trim() });
      setMyComment(""); setMyRating(0); setHoverStar(0);
      setReviewMsg({ type: "success", text: "Đánh giá của bạn đã được gửi thành công!" });
      await loadReviews();
      setTimeout(() => setReviewMsg(null), 4000);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("đã đánh giá"))
        setReviewMsg({ type: "error", text: "Bạn đã đánh giá sản phẩm này rồi!" });
      else if (status === 401) setReviewMsg({ type: "error", text: "Phiên đăng nhập hết hạn!" });
      else if (status === 403) setReviewMsg({ type: "error", text: "Bạn cần mua sản phẩm này mới được đánh giá!" });
      else setReviewMsg({ type: "error", text: msg || "Gửi thất bại, vui lòng thử lại!" });
    } finally { setSubmitting(false); }
  };

  const handleDeleteReview = (reviewId) => setConfirmDel({ open: true, id: reviewId });
  const confirmDelete = async () => {
    const { id: rid } = confirmDel;
    setConfirmDel({ open: false, id: null });
    setReviews((prev) => prev.filter((r) => r.id !== rid));
    try { await axiosClient.delete(`/products/${id}/reviews/${rid}`); }
    catch { await loadReviews(); }
  };

  const specs = [
    { icon: <Icons.Shield size={14} />, label: "Hãng", val: product.brand },
    { icon: <Icons.Globe size={14} />, label: "Quốc gia", val: product.nation },
    { icon: <Icons.Monitor size={14} />, label: "Màn hình", val: product.display },
    { icon: <Icons.Database size={14} />, label: "RAM", val: product.ram },
    { icon: <Icons.Database size={14} />, label: "Bộ nhớ", val: product.rom },
    { icon: <Icons.Cpu size={14} />, label: "Chip", val: product.chip },
    { icon: <Icons.Camera size={14} />, label: "Camera", val: product.camera },
    { icon: <Icons.Battery size={14} />, label: "Pin", val: product.battery },
  ].filter((s) => s.val);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <ConfirmDialog
        open={confirmDel.open}
        message="Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        onOk={confirmDelete}
        onCancel={() => setConfirmDel({ open: false, id: null })}
      />

      <div className="min-h-screen bg-[#F5F5F3] pb-20 font-[system-ui]">

        {/* ── BREADCRUMB ── */}
        <nav className="max-w-[1320px] mx-auto px-6 lg:px-8 py-4 flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-1 hover:text-rose-500 transition-colors font-medium">
            <Icons.Home size={12} /> Trang chủ
          </button>
          <Icons.ChevronRight size={12} />
          <button onClick={() => navigate(-1)} className="hover:text-rose-500 transition-colors font-medium">
            {product.brand || "Sản phẩm"}
          </button>
          <Icons.ChevronRight size={12} />
          <span className="text-slate-700 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </nav>

        {/* ── HERO GRID ── */}
        <div className="max-w-[1320px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr] gap-6 mb-8">

            {/* ── IMAGE PANEL ── */}
            <div className="flex flex-col gap-4">
              {/* Main image card */}
              <div className="relative rounded-3xl aspect-square flex items-center justify-center p-8 group" style={{ background: "rgb(255,255,255)" }}>
                {/* Badges */}
                {!isFlashActive && product.discount && !isOOS && (
                  <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 bg-rose-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm shadow-rose-200">
                    <Icons.Tag size={11} /> {discLabel}
                  </div>
                )}
                {isFlashActive && (
                  <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm">
                    <Icons.Zap size={11} filled /> FLASH SALE
                  </div>
                )}
                {isOOS && (
                  <div className="absolute top-4 left-4 z-10 bg-slate-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                    Hết hàng
                  </div>
                )}
                {isLowStock && !isOOS && (
                  <div className="absolute top-12 left-4 z-10 bg-amber-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Còn {product.stock}
                  </div>
                )}

                {/* Wishlist button */}
                <button
                  onClick={handleWishlist}
                  disabled={wishLoading}
                  className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full border flex items-center justify-center shadow-sm transition-all duration-200 active:scale-90
                    ${wished
                      ? "bg-rose-50 border-rose-300 text-rose-500 shadow-rose-100"
                      : "bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400"
                    }
                    ${heartAnim ? "animate-[heartPop_0.5s_ease]" : ""}
                  `}
                >
                  {wishLoading
                    ? <Icons.Loader size={16} />
                    : <Icons.Heart size={18} filled={wished} />
                  }
                </button>

                {/* Product image */}
                <div
                  className={`w-full h-full flex items-center justify-center transition-all duration-500 ${isOOS ? "grayscale opacity-50" : ""}`}
                  onMouseEnter={() => setImgZoom(true)}
                  onMouseLeave={() => setImgZoom(false)}
                >
                  <img
                    src={product.img}
                    alt={product.title}
                    loading="lazy"
                    className={`max-w-full max-h-[320px] object-contain transition-transform duration-500 ${imgZoom ? "scale-105" : "scale-100"}`}
                  />
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2.5">
                <TrustBadge icon={<Icons.Shield size={16} />} label="BH 12 tháng" sub="Chính hãng" color="#3B82F6" />
                <TrustBadge icon={<Icons.Truck size={16} />} label="Giao 2 giờ" sub="Toàn quốc" color="#10B981" />
                <TrustBadge icon={<Icons.RefreshCw size={16} />} label="30 ngày" sub="Đổi trả dễ dàng" color="#F59E0B" />
                <TrustBadge icon={<Icons.Lock size={16} />} label="Bảo mật" sub="Tuyệt đối" color="#8B5CF6" />
              </div>
            </div>

            {/* ── INFO PANEL ── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-8 flex flex-col gap-5">

              {/* Tags row */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand && (
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-600 uppercase tracking-wider">
                    {product.brand}
                  </span>
                )}
                {product.nation && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                    <Icons.Globe size={10} /> {product.nation}
                  </span>
                )}
                {isFlashActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Icons.Zap size={10} /> Flash Sale
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl xl:text-[1.65rem] font-bold text-slate-900 leading-snug tracking-tight">
                {product.title}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-3 flex-wrap bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Stars rating={avgRating} size={15} />
                  {avgRating > 0 && (
                    <span className="text-sm font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {avgRating}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 pl-2 border-l border-slate-200">
                    {totalReviews > 0 ? `${totalReviews} đánh giá` : "Chưa có đánh giá"}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icons.TrendingUp size={13} />
                  <span><strong className="text-slate-800 font-bold">
                    {product.sold > 999 ? (product.sold / 1000).toFixed(1) + "k" : product.sold || 0}
                  </strong> đã bán</span>
                </div>
              </div>

              {/* Price */}
              {isFlashActive ? (
                <FlashSaleBanner flashInfo={flashInfo} />
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-3xl sm:text-4xl font-black text-rose-600 tabular-nums leading-none">
                    {fmt(product.price)}
                  </div>
                  {(product.oldPrice || discLabel) && (
                    <div className="flex items-center gap-3 flex-wrap">
                      {product.oldPrice && (
                        <span className="text-sm text-slate-400 line-through tabular-nums">{fmt(product.oldPrice)}</span>
                      )}
                      {discLabel && (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">
                          <Icons.Tag size={11} /> Tiết kiệm {discLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Specs highlights */}
              {specs.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {specs.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="text-slate-400 flex-shrink-0">{s.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider">{s.label}</div>
                        <div className="text-[12.5px] font-bold text-slate-800 mt-0.5 truncate">{s.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-[13.5px] text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {product.description}
                </p>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-slate-600">Số lượng</span>
                <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1 || isOOS}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-light"
                  >−</button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={isOOS || qty >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-light"
                  >+</button>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  isOOS ? "bg-slate-100 text-slate-500"
                  : isLowStock ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOOS ? "bg-slate-400" : isLowStock ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {isOOS ? "Hết hàng" : `Còn ${product.stock} sản phẩm`}
                </span>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3">
                <button
                  onClick={addToCart}
                  disabled={isOOS}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
                    ${addedToCart
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                      : isFlashActive
                        ? "border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100"
                        : "border-rose-500 text-rose-600 bg-white hover:bg-rose-50"
                    }`}
                >
                  {addedToCart
                    ? <><Icons.Check size={15} /> Đã thêm!</>
                    : <><Icons.ShoppingCart size={15} /> Giỏ hàng</>
                  }
                </button>
                <button
                  onClick={buyNow}
                  disabled={isOOS}
                  className={`flex-[1.4] inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
                    ${isFlashActive
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200 hover:from-amber-600 hover:to-orange-600"
                      : "bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-200 hover:from-rose-600 hover:to-rose-700"
                    }`}
                >
                  {isFlashActive
                    ? <><Icons.Zap size={14} filled /> Mua Flash Sale</>
                    : <><Icons.ShoppingBag size={14} /> {isOOS ? "Hết hàng" : "Mua ngay"}</>
                  }
                </button>
              </div>

              {/* Installment banner */}
              <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl p-3.5 border border-indigo-100 cursor-pointer hover:border-indigo-300 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Icons.CreditCard size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">Trả góp 0% lãi suất</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Duyệt trong 5 phút · Mọi thẻ tín dụng</div>
                </div>
                <Icons.ChevronRight size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* ── BOTTOM SECTION ── */}
          <div className="flex flex-col gap-6">

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 p-1.5 gap-1">
                {[
                  { key: "specs", label: "Thông số kỹ thuật" },
                  { key: "warranty", label: "Bảo hành & Đổi trả" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      activeTab === t.key
                        ? "bg-rose-50 text-rose-600 font-bold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "specs" && (
                  <div className="rounded-xl overflow-hidden border border-slate-100">
                    {specs.map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 px-5 py-3.5 text-sm border-b border-slate-50 last:border-b-0 ${i % 2 === 0 ? "bg-slate-50/60" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-2.5 w-36 flex-shrink-0 text-slate-400 font-semibold text-[12.5px]">
                          <span>{s.icon}</span> {s.label}
                        </div>
                        <div className="text-slate-800 font-semibold">{s.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "warranty" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: <Icons.Shield size={22} />, color: "text-blue-600 bg-blue-50 border-blue-200", accent: "#3B82F6", title: "Bảo hành chính hãng 12 tháng", desc: "Bảo hành tại tất cả trung tâm bảo hành chính hãng toàn quốc." },
                      { icon: <Icons.RefreshCw size={22} />, color: "text-emerald-600 bg-emerald-50 border-emerald-200", accent: "#10B981", title: "Đổi trả trong 30 ngày", desc: "Đổi trả không cần lý do trong 30 ngày từ ngày mua." },
                      { icon: <Icons.Wrench size={20} />, color: "text-amber-600 bg-amber-50 border-amber-200", accent: "#F59E0B", title: "Hỗ trợ kỹ thuật 24/7", desc: "Đội ngũ kỹ thuật hỗ trợ qua hotline 1800.2097 mọi lúc." },
                      { icon: <Icons.CheckCircle size={22} />, color: "text-violet-600 bg-violet-50 border-violet-200", accent: "#8B5CF6", title: "Hàng chính hãng 100%", desc: "Nguyên seal, có hóa đơn VAT, cam kết chính hãng." },
                    ].map((w, i) => (
                      <div
                        key={i}
                        className={`flex gap-4 p-5 rounded-2xl border ${w.color} hover:shadow-sm transition-shadow`}
                      >
                        <div className={`flex-shrink-0 mt-0.5 ${w.color.split(" ")[0]}`}>{w.icon}</div>
                        <div>
                          <div className={`text-sm font-bold mb-1 ${w.color.split(" ")[0]}`}>{w.title}</div>
                          <div className="text-xs text-slate-600 leading-relaxed">{w.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── REVIEWS SECTION ── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Icons.Star size={20} filled />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Đánh giá sản phẩm</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{totalReviews} đánh giá từ khách hàng thực tế</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row min-h-[420px]">
                {/* Left sidebar */}
                <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col">

                  {/* Rating overview */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="text-6xl font-black text-slate-900 leading-none tracking-tighter">
                        {avgRating || "—"}
                      </div>
                      <div>
                        <Stars rating={avgRating} size={18} />
                        <p className="text-xs text-slate-400 mt-1.5">{totalReviews} đánh giá</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {dist.map((d) => (
                        <button
                          key={d.star}
                          onClick={() => setFilterStar(filterStar === d.star ? 0 : d.star)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                            filterStar === d.star ? "bg-rose-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className={`text-xs font-bold w-6 flex-shrink-0 ${filterStar === d.star ? "text-rose-600" : "text-slate-500"}`}>
                            {d.star}★
                          </span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                d.star >= 4 ? "bg-emerald-400" : d.star === 3 ? "bg-amber-400" : "bg-red-400"
                              }`}
                              style={{ width: `${d.pct}%`, minWidth: d.count > 0 ? "4px" : "0" }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 font-semibold w-5 text-right flex-shrink-0">{d.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Write review */}
                  <div className="p-5 flex-1">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                      <Icons.Edit3 size={14} /> Viết đánh giá
                    </h4>
                    <div className="mb-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseEnter={() => setHoverStar(i)}
                            onMouseLeave={() => setHoverStar(0)}
                            onClick={() => { setMyRating(i); setReviewMsg(null); }}
                            className="p-0.5 transition-transform duration-150"
                            style={{
                              transform: (hoverStar || myRating) >= i ? "scale(1.3)" : "scale(1)",
                              transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                            }}
                          >
                            <svg width={28} height={28} viewBox="0 0 24 24"
                              fill={(hoverStar || myRating) >= i ? "#F59E0B" : "none"}
                              stroke={(hoverStar || myRating) >= i ? "#F59E0B" : "#D1D5DB"} strokeWidth="1.5">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-500 min-h-[16px] block">
                        {(hoverStar || myRating) > 0
                          ? ["", "Rất tệ", "Không hài lòng", "Bình thường", "Hài lòng", "Tuyệt vời!"][hoverStar || myRating]
                          : <span className="text-slate-400 font-normal">Chọn số sao để đánh giá</span>
                        }
                      </span>
                    </div>
                    <textarea
                      placeholder="Chia sẻ trải nghiệm thực tế của bạn..."
                      value={myComment}
                      onChange={(e) => { setMyComment(e.target.value); setReviewMsg(null); }}
                      rows={4}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 resize-none outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all leading-relaxed placeholder-slate-400"
                    />
                    <div className="flex justify-end mb-3">
                      <span className="text-[11px] text-slate-300">{myComment.length}/500</span>
                    </div>
                    {reviewMsg && (
                      <div className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl mb-3 ${
                        reviewMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {reviewMsg.type === "success" ? <Icons.Check size={13} /> : <Icons.X size={13} />}
                        {reviewMsg.text}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white text-sm font-bold shadow-md shadow-rose-200 hover:from-rose-600 hover:to-rose-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
                    >
                      {submitting ? <><Icons.Loader size={14} /> Đang gửi...</> : <><Icons.Send size={14} /> Gửi đánh giá</>}
                    </button>
                  </div>
                </div>

                {/* Reviews list */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {filterStar > 0 ? `Lọc ${filterStar}★ — ${displayedReviews.length} kết quả` : `${displayedReviews.length} đánh giá`}
                    </span>
                    <div className="flex items-center gap-2">
                      {filterStar > 0 && (
                        <button
                          onClick={() => setFilterStar(0)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
                        >
                          <Icons.X size={10} /> Bỏ lọc
                        </button>
                      )}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-slate-300 transition-colors"
                      >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="highest">Điểm cao</option>
                        <option value="lowest">Điểm thấp</option>
                      </select>
                    </div>
                  </div>

                  {/* Review list body */}
                  <div className="flex-1 overflow-y-auto max-h-[640px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {revLoading ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
                        <div className="w-7 h-7 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin" />
                        <span className="text-sm">Đang tải đánh giá...</span>
                      </div>
                    ) : displayedReviews.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
                        <div className="text-slate-200"><Icons.MessageSquare size={48} /></div>
                        <span className="text-sm font-bold text-slate-600">
                          {filterStar > 0 ? `Không có đánh giá ${filterStar}★` : "Chưa có đánh giá nào"}
                        </span>
                        {filterStar === 0 && (
                          <span className="text-xs text-slate-400">Hãy là người đầu tiên đánh giá sản phẩm này!</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        {displayedReviews.map((rv, idx) => (
                          <ReviewItem
                            key={rv.id}
                            rv={rv}
                            idx={idx}
                            currentUserId={curUser.id}
                            currentUserRole={curUser.role}
                            onDelete={handleDeleteReview}
                            onReply={handleAdminReply}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Product;

/* ══════════════════════════════════════════
   KEYFRAME ANIMATIONS (injected as <style>)
══════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes fadeIn    { from { opacity: 0 } to { opacity: 1 } }
  @keyframes scaleIn   { from { opacity: 0; transform: scale(0.95) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
  @keyframes slideUp   { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes heartPop  { 0% { transform: scale(1) } 35% { transform: scale(1.6) } 65% { transform: scale(0.88) } 100% { transform: scale(1) } }

  .scrollbar-thin::-webkit-scrollbar { width: 4px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 99px; }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }

  .border-l-3 { border-left-width: 3px; }
`;