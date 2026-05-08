import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import axiosClient from "../../api/axios";

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const fmtVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const fmtDate = (d) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const padId = (id) => `#${String(id).padStart(4, "0")}`;

const GRID_COLS = "84px minmax(0,1fr) 140px 150px 175px 44px";

const STATUS_FLOW = {
  pending:   ["pending", "confirmed", "cancelled"],
  confirmed: ["confirmed", "completed", "cancelled"],
  completed: ["completed"],
  cancelled: ["cancelled"],
};

const STATUS = {
  pending:   { label: "Chờ xác nhận", color: "#b45309", bg: "#fef9ee", border: "#fcd34d", dot: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  confirmed: { label: "Đã xác nhận",  color: "#1d4ed8", bg: "#f0f5ff", border: "#93c5fd", dot: "#3b82f6", glow: "rgba(59,130,246,0.15)" },
  completed: { label: "Hoàn thành",   color: "#065f46", bg: "#f0fdf8", border: "#6ee7b7", dot: "#10b981", glow: "rgba(16,185,129,0.15)" },
  cancelled: { label: "Đã hủy",       color: "#991b1b", bg: "#fff5f5", border: "#fca5a5", dot: "#ef4444", glow: "rgba(239,68,68,0.15)" },
};

const PAY = {
  cod:    { label: "Tiền mặt",     icon: "💵" },
  bank:   { label: "Chuyển khoản", icon: "🏦" },
  momo:   { label: "Ví MoMo",      icon: "💜" },
  credit: { label: "Thẻ tín dụng", icon: "💳" },
};

const FILTERS = [
  { key: "all",       label: "Tất cả"       },
  { key: "pending",   label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận"  },
  { key: "completed", label: "Hoàn thành"   },
  { key: "cancelled", label: "Đã hủy"       },
];

const SORT_OPTIONS = [
  { key: "newest",  label: "Mới nhất"   },
  { key: "oldest",  label: "Cũ nhất"    },
  { key: "highest", label: "Tiền cao"   },
  { key: "lowest",  label: "Tiền thấp"  },
];

const AVATAR_PALETTE = [
  ["#f97316","#fb923c"], ["#8b5cf6","#a78bfa"], ["#06b6d4","#67e8f9"],
  ["#10b981","#34d399"], ["#f43f5e","#fb7185"], ["#3b82f6","#60a5fa"],
  ["#84cc16","#a3e635"], ["#ec4899","#f472b6"],
];

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const extractOrders = (res) => {
  const d = res?.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d)) return d;
  return [];
};

/* ══════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════ */
const Icons = {
  refresh: (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  chevD:   (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  chevU:   (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>,
  orders:  (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6M9 16h4"/></svg>,
  money:   (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  check:   (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  clock:   (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  user:    (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone:   (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>,
  pin:     (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  cal:     (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  wallet:  (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>,
  box:     (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
  search:  (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  close:   (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  warn:    (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4M12 17h.01"/></svg>,
  filter:  (c) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>,
};

/* ══════════════════════════════════════════════
   TOAST HOOK (with proper cleanup)
══════════════════════════════════════════════ */
function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type, id: Date.now() });
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setToast(null);
    }, 3500);
  }, []);

  return [toast, showToast];
}

/* ══════════════════════════════════════════════
   ATOMIC COMPONENTS
══════════════════════════════════════════════ */
const Avatar = memo(function Avatar({ name, size = 40 }) {
  const ch = (name || "?").charCodeAt(0) || 0;
  const [a, b] = AVATAR_PALETTE[ch % AVATAR_PALETTE.length];
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-white select-none"
      style={{
        width: size, height: size,
        background: `linear-gradient(145deg,${a},${b})`,
        fontSize: size * 0.4,
        boxShadow: `0 4px 12px ${a}55`,
        fontFamily: "'Outfit',sans-serif",
      }}
      aria-hidden="true"
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
});

const StatusBadge = memo(function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap tracking-wider border"
      style={{ color: s.color, background: s.bg, borderColor: s.border, boxShadow: `0 0 0 3px ${s.glow}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot, animation: "pulse 2s infinite" }} />
      {s.label}
    </span>
  );
});

function ProductThumb({ img, title, size = 44 }) {
  const [err, setErr] = useState(false);
  if (!img || err) return (
    <div className="flex-shrink-0 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300"
      style={{ width: size, height: size, background: "#f8fafc" }}>
      {Icons.box("w-5 h-5")}
    </div>
  );
  return (
    <img src={img} alt={title || ""} onError={() => setErr(true)} loading="lazy"
      className="flex-shrink-0 rounded-xl border border-slate-100 object-contain bg-white"
      style={{ width: size, height: size, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    />
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div role="alert" aria-live="polite"
      className="fixed top-4 left-4 right-4 sm:top-5 sm:right-5 sm:left-auto z-[9999] flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-2xl text-[13px] font-semibold toast-slide"
      style={{
        background: "#fff",
        border: `1px solid #e8edf5`,
        borderLeft: `4px solid ${ok ? "#10b981" : "#ef4444"}`,
        color: ok ? "#065f46" : "#991b1b",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        maxWidth: "min(420px, 100%)",
      }}
    >
      <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: ok ? "#f0fdf8" : "#fff5f5" }}>
        {ok ? Icons.check("w-4 h-4") : <span className="text-base font-black">✕</span>}
      </span>
      <span className="flex-1 min-w-0">{toast.msg}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CONFIRM MODAL (for destructive cancel action)
══════════════════════════════════════════════ */
function ConfirmModal({ open, onClose, onConfirm, order }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !order) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay"
      onClick={onClose}
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby="confirm-title"
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 modal-content"
        style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
            {Icons.warn("w-6 h-6")}
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-title" className="text-[17px] font-black text-slate-900 mb-1.5"
              style={{ fontFamily: "'Outfit',sans-serif" }}>
              Hủy đơn hàng này?
            </h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Đơn <strong className="text-slate-700">{padId(order.id)}</strong> của khách <strong className="text-slate-700">{order.shippingName}</strong> sẽ bị hủy. Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            Quay lại
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 16px rgba(239,68,68,0.35)" }}>
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STAT CARDS
══════════════════════════════════════════════ */
const StatCards = memo(function StatCards({ totalOrders, stats }) {
  const cards = [
    { label: "Tổng đơn hàng", value: totalOrders,            sub: "tất cả trạng thái",                   icon: Icons.orders, accent: "#6366f1", light: "#eef2ff", mid: "#c7d2fe" },
    { label: "Doanh thu",     value: fmtVND(stats.revenue),  sub: "theo bộ lọc hiện tại",                icon: Icons.money,  accent: "#059669", light: "#ecfdf5", mid: "#a7f3d0", big: true },
    { label: "Hoàn thành",    value: stats.completed,        sub: `trên ${stats.filteredCount} đơn lọc`, icon: Icons.check,  accent: "#2563eb", light: "#eff6ff", mid: "#bfdbfe" },
    { label: "Chờ xử lý",     value: stats.pending,          sub: "cần duyệt ngay",                      icon: Icons.clock,  accent: "#d97706", light: "#fffbeb", mid: "#fde68a" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 relative overflow-hidden group cursor-default"
          style={{ animationDelay: `${i*70}ms`, animation: "fadeUp 0.5s ease both", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" }}>
          <div className="absolute -top-8 -right-8 w-24 h-24 sm:w-28 sm:h-28 rounded-full opacity-50 transition-transform duration-500 group-hover:scale-110"
            style={{ background: `radial-gradient(circle,${c.mid},${c.light})` }} />
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
            style={{ background: `linear-gradient(135deg,${c.light},${c.mid})`, color: c.accent }}>
            {c.icon("w-4 h-4 sm:w-5 sm:h-5")}
          </div>
          <div className={`relative font-black leading-none mb-1.5 break-words ${c.big ? "text-[14px] sm:text-[16px]" : "text-[22px] sm:text-[30px]"}`}
            style={{ color: c.accent, fontFamily: "'Outfit',sans-serif" }}>
            {c.value}
          </div>
          <div className="relative text-[11px] sm:text-[12px] font-semibold text-slate-600 mb-0.5">{c.label}</div>
          <div className="relative text-[10px] sm:text-[11px] text-slate-400">{c.sub}</div>
          <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
            style={{ background: `linear-gradient(90deg,transparent,${c.accent},transparent)` }} />
        </div>
      ))}
    </div>
  );
});

/* ══════════════════════════════════════════════
   DETAIL PANEL
══════════════════════════════════════════════ */
function DetailPanel({ order }) {
  const items = order.OrderItems || [];
  const pay = PAY[order.payMethod] || { label: order.payMethod || "—", icon: "💳" };

  const infoRows = [
    { label: "Khách hàng", val: order.shippingName,    icon: Icons.user   },
    { label: "Điện thoại", val: order.shippingPhone,   icon: Icons.phone  },
    { label: "Địa chỉ",    val: order.shippingAddress, icon: Icons.pin    },
    { label: "Thanh toán", val: `${pay.icon} ${pay.label}`, icon: Icons.wallet },
    { label: "Ngày đặt",   val: fmtDate(order.createdAt), icon: Icons.cal },
  ].filter(r => r.val);

  return (
    <div className="expand-panel border-t border-slate-100 bg-slate-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-5">

        {/* Shipping info */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">
              {Icons.user("w-4 h-4")}
            </div>
            <span className="text-[10.5px] font-black tracking-[0.15em] uppercase text-slate-400">Thông tin giao hàng</span>
          </div>
          <div className="flex flex-col gap-3.5">
            {infoRows.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                  {r.icon("w-3.5 h-3.5")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{r.label}</div>
                  <div className="text-[12.5px] sm:text-[13px] font-semibold text-slate-700 break-words leading-snug">{r.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-orange-50 flex items-center justify-center text-orange-400">
              {Icons.box("w-4 h-4")}
            </div>
            <span className="text-[10.5px] font-black tracking-[0.15em] uppercase text-slate-400">
              Sản phẩm ({items.length})
            </span>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
              {Icons.box("w-10 h-10")}
              <span className="text-[13px]">Không có sản phẩm</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {items.map((item, i) => (
                <div key={item.id ?? `${item.productId ?? "p"}-${i}`}
                  className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                  <ProductThumb img={item.Product?.img} title={item.Product?.title} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] sm:text-[13px] font-semibold text-slate-800 truncate">{item.Product?.title || "—"}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.quantity} × {fmtVND(item.price)}</div>
                  </div>
                  <div className="text-[12.5px] sm:text-[13px] font-black text-indigo-600 flex-shrink-0"
                    style={{ fontFamily: "'Outfit',sans-serif" }}>
                    {fmtVND(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Tổng cộng</span>
            <span className="text-[17px] sm:text-[19px] font-black text-indigo-600" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {fmtVND(order.totalAmount)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ORDER ROW
══════════════════════════════════════════════ */
const OrderRow = memo(function OrderRow({ order, index, expanded, onExpand, onUpdate, updating }) {
  const isExp      = expanded === order.id;
  const isUpd      = updating === order.id;
  const allowed    = STATUS_FLOW[order.status] || [order.status];
  const isTerminal = allowed.length === 1;
  const firstItem  = order.OrderItems?.[0];
  const moreCount  = (order.OrderItems?.length || 0) - 1;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onExpand(isExp ? null : order.id);
    }
  };

  return (
    <div className="border-b border-slate-50 last:border-b-0"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms`, animation: "fadeUp 0.4s ease both" }}>

      {/* Desktop row (md and up) */}
      <div
        role="button" tabIndex={0}
        aria-expanded={isExp}
        aria-label={`Đơn hàng ${padId(order.id)} của ${order.shippingName}`}
        className={`hidden md:grid items-center px-4 lg:px-6 py-4 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-inset
          ${isExp ? "bg-indigo-50/25" : "hover:bg-slate-50/70"}`}
        style={{ gridTemplateColumns: GRID_COLS, gap: "12px" }}
        onClick={() => onExpand(isExp ? null : order.id)}
        onKeyDown={handleKeyDown}
      >
        {/* ID */}
        <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl border w-fit"
          style={{ color: "#6366f1", background: "#eef2ff", borderColor: "#c7d2fe" }}>
          {padId(order.id)}
        </span>

        {/* Customer */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={order.shippingName} size={38} />
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-bold text-slate-800 truncate">{order.shippingName}</div>
            <div className="text-[12.5px] text-slate-500 truncate mt-0.5">{firstItem?.Product?.title || "—"}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {moreCount > 0 && (
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
                  +{moreCount} sản phẩm
                </span>
              )}
              <span className="text-[10.5px] text-slate-300">{fmtDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <span className="text-[14px] font-black text-slate-800 truncate" style={{ fontFamily: "'Outfit',sans-serif" }}>
          {fmtVND(order.totalAmount)}
        </span>

        {/* Status */}
        <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
          <StatusBadge status={order.status} />
        </div>

        {/* Select */}
        <div className="flex justify-center" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
          {isUpd ? (
            <div className="w-5 h-5 border-2 border-indigo-100 border-t-indigo-500 rounded-full spinner" />
          ) : isTerminal ? (
            <span className="text-[11px] text-slate-300 italic bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              Không đổi
            </span>
          ) : (
            <select
              value={order.status}
              onChange={e => onUpdate(order.id, e.target.value)}
              aria-label={`Cập nhật trạng thái đơn ${padId(order.id)}`}
              className="text-[12px] border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 cursor-pointer outline-none transition-all hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 max-w-full w-full"
              style={{ fontFamily: "inherit" }}
            >
              {allowed.map(s => <option key={s} value={s}>{STATUS[s]?.label}</option>)}
            </select>
          )}
        </div>

        {/* Expand */}
        <div className="flex justify-center">
          <span aria-hidden="true"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 border
              ${isExp ? "bg-indigo-100 text-indigo-500 border-indigo-200" : "bg-transparent text-slate-300 border-transparent"}`}>
            {isExp ? Icons.chevU("w-4 h-4") : Icons.chevD("w-4 h-4")}
          </span>
        </div>
      </div>

      {/* Mobile card */}
      <div
        role="button" tabIndex={0}
        aria-expanded={isExp}
        aria-label={`Đơn hàng ${padId(order.id)}`}
        className={`md:hidden p-4 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-inset ${isExp ? "bg-indigo-50/20" : "active:bg-slate-50"}`}
        onClick={() => onExpand(isExp ? null : order.id)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar name={order.shippingName} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {padId(order.id)}
                </span>
                {moreCount > 0 && (
                  <span className="text-[9.5px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100">
                    +{moreCount}
                  </span>
                )}
              </div>
              <div className="text-[13.5px] font-bold text-slate-800 truncate">{order.shippingName}</div>
              <div className="text-[12px] text-slate-500 truncate">{firstItem?.Product?.title || "—"}</div>
              <div className="text-[10px] text-slate-300 mt-0.5">{fmtDate(order.createdAt)}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={order.status} />
            <span className="text-[14px] font-black text-slate-800" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {fmtVND(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-dashed border-slate-100">
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
            {!isTerminal && !isUpd && (
              <select
                value={order.status}
                onChange={e => onUpdate(order.id, e.target.value)}
                aria-label={`Cập nhật trạng thái đơn ${padId(order.id)}`}
                className="text-[12.5px] border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 cursor-pointer outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 flex-1 min-w-0"
                style={{ fontFamily: "inherit", minHeight: "40px" }}
              >
                {allowed.map(s => <option key={s} value={s}>{STATUS[s]?.label}</option>)}
              </select>
            )}
            {isTerminal && (
              <span className="text-[11px] text-slate-400 italic bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                Không thể thay đổi
              </span>
            )}
            {isUpd && (
              <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
                <div className="w-4 h-4 border-2 border-indigo-100 border-t-indigo-500 rounded-full spinner" />
                Đang cập nhật...
              </div>
            )}
          </div>
          <span className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isExp ? "rotate-180" : ""}`} aria-hidden="true">
            {Icons.chevD("w-4 h-4")}
          </span>
        </div>
      </div>

      {isExp && <DetailPanel order={order} />}
    </div>
  );
});

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
export default function OrderManage() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [sortBy,   setSortBy]   = useState("newest");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [confirm,  setConfirm]  = useState(null); // { order, newStatus }

  const [toast, showToast] = useToast();

  // Fetch
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/orders");
      setOrders(extractOrders(res));
    } catch (err) {
      console.error("Fetch orders error:", err);
      showToast("Không thể tải đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Update logic (race-condition safe)
  const performUpdate = useCallback(async (id, newStatus) => {
    setOrders(currentOrders => {
      const target = currentOrders.find(o => o.id === id);
      if (!target) return currentOrders;
      const prevStatus = target.status; // captured per-call

      setUpdating(id);

      (async () => {
        try {
          if (newStatus === "cancelled") {
            await axiosClient.patch(`/orders/${id}/cancel`);
          } else {
            await axiosClient.patch(`/orders/${id}/status`, { status: newStatus });
          }
          showToast(`Đã cập nhật → ${STATUS[newStatus]?.label}`);
        } catch (err) {
          console.error("Update status error:", err);
          // Rollback using captured prevStatus
          setOrders(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
          showToast("Lỗi cập nhật, đã hoàn tác", "error");
        } finally {
          setUpdating(curr => curr === id ? null : curr);
        }
      })();

      // Optimistic update
      return currentOrders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    });
  }, [showToast]);

  const updateStatus = useCallback((id, newStatus) => {
    const order = orders.find(o => o.id === id);
    if (!order || newStatus === order.status) return;

    const allowed = STATUS_FLOW[order.status] || [];
    if (!allowed.includes(newStatus)) {
      showToast(`Không thể chuyển từ "${STATUS[order.status]?.label}" sang "${STATUS[newStatus]?.label}"`, "error");
      return;
    }

    // Confirm before destructive cancel
    if (newStatus === "cancelled") {
      setConfirm({ order, newStatus });
      return;
    }

    performUpdate(id, newStatus);
  }, [orders, performUpdate, showToast]);

  // Memoized filtered + sorted list
  const filtered = useMemo(() => {
    let list = filter === "all" ? orders : orders.filter(o => o.status === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(o =>
        String(o.id).includes(q) ||
        (o.shippingName || "").toLowerCase().includes(q) ||
        (o.shippingPhone || "").toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sortBy) {
      case "oldest":  sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case "highest": sorted.sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0)); break;
      case "lowest":  sorted.sort((a, b) => Number(a.totalAmount || 0) - Number(b.totalAmount || 0)); break;
      default:        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [orders, filter, sortBy, search]);

  // Memoized stats
  const stats = useMemo(() => ({
    revenue:       filtered.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
    completed:     filtered.filter(o => o.status === "completed").length,
    pending:       orders.filter(o => o.status === "pending").length,
    filteredCount: filtered.length,
  }), [orders, filtered]);

  // Counts per filter (for badge)
  const filterCounts = useMemo(() => {
    const counts = { all: orders.length };
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    return counts;
  }, [orders]);

  const hasActiveFilter = filter !== "all" || search.trim() !== "";
  const clearFilters = () => { setFilter("all"); setSearch(""); };

  return (
    <div className="min-h-screen py-5 sm:py-8 px-3 sm:px-6" style={{ background: "#f8fafc", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <Toast toast={toast} />
      <ConfirmModal
        open={!!confirm}
        order={confirm?.order}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) performUpdate(confirm.order.id, confirm.newStatus);
          setConfirm(null);
        }}
      />

      <div className="max-w-[1180px] mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-black tracking-[0.2em] uppercase text-indigo-500 mb-3 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" style={{ animation: "pulse 2s infinite" }} />
                Quản trị hệ thống
              </div>
              <h1 className="text-[24px] sm:text-[34px] font-black text-slate-900 m-0 leading-none"
                style={{ fontFamily: "'Outfit',sans-serif", letterSpacing: "-0.03em" }}>
                Quản lý đơn hàng
              </h1>
              <p className="text-[12px] sm:text-[13px] text-slate-400 mt-2 m-0">
                Xem và cập nhật trạng thái đơn hàng theo thời gian thực
              </p>
            </div>

            <button
              onClick={fetchOrders} disabled={loading}
              aria-label="Làm mới danh sách"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-white text-[12.5px] sm:text-[13px] font-bold border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)", fontFamily: "inherit", minHeight: "40px" }}
            >
              <span className={loading ? "spinner" : ""} style={{ display:"inline-flex" }}>
                {Icons.refresh("w-4 h-4")}
              </span>
              <span className="hidden xs:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatCards totalOrders={orders.length} stats={stats} />

        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-3 sm:mb-4" style={{ animation: "fadeUp 0.5s 0.05s ease both" }}>
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {Icons.search("w-4 h-4")}
            </span>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              aria-label="Tìm kiếm đơn hàng"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 outline-none transition-all hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              style={{ fontFamily: "inherit", minHeight: "42px" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                {Icons.close("w-4 h-4")}
              </button>
            )}
          </div>

          <select
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            aria-label="Sắp xếp"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 cursor-pointer outline-none transition-all hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-44"
            style={{ fontFamily: "inherit", minHeight: "42px" }}
          >
            {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>Sắp xếp: {s.label}</option>)}
          </select>
        </div>

        {/* Filter chips - horizontal scroll on mobile */}
        <div className="filter-scroll flex items-center gap-2 mb-4 sm:mb-5 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap"
          style={{ animation: "fadeUp 0.5s 0.1s ease both" }}>
          {FILTERS.map(f => {
            const count    = filterCounts[f.key] || 0;
            const st       = STATUS[f.key];
            const isActive = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                aria-pressed={isActive}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[12.5px] transition-all duration-200 border cursor-pointer hover:-translate-y-px whitespace-nowrap flex-shrink-0"
                style={{
                  border: isActive ? `1.5px solid ${st ? st.border : "#c7d2fe"}` : "1.5px solid #e8edf5",
                  background: isActive ? (st ? st.bg : "#eef2ff") : "#fff",
                  color: isActive ? (st ? st.color : "#6366f1") : "#64748b",
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive ? `0 0 0 3px ${st ? st.glow : "rgba(99,102,241,0.12)"}` : "none",
                  minHeight: "36px",
                }}
              >
                {f.label}
                {count > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{ background: isActive ? (st ? st.dot : "#6366f1") : "#f1f5f9", color: isActive ? "#fff" : "#94a3b8" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ animation: "fadeUp 0.5s 0.15s ease both", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.05)" }}>

          {/* Desktop header */}
          <div className="hidden md:grid px-4 lg:px-6 py-3.5 border-b border-slate-50 text-[10px] font-black tracking-[0.15em] uppercase text-slate-400"
            style={{ gridTemplateColumns: GRID_COLS, gap: "12px", background: "linear-gradient(135deg,#fafbff,#f8f7ff)" }}>
            <span>Mã đơn</span>
            <span>Khách hàng &amp; Sản phẩm</span>
            <span>Tổng tiền</span>
            <span>Trạng thái</span>
            <span className="text-center">Cập nhật</span>
            <span />
          </div>

          {/* Body */}
          {loading ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <EmptyState hasActiveFilter={hasActiveFilter} onClear={clearFilters} />
          ) : (
            filtered.map((order, i) => (
              <OrderRow key={order.id} order={order} index={i}
                expanded={expanded} onExpand={setExpanded}
                onUpdate={updateStatus} updating={updating} />
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="text-center mt-4 text-[12px] text-slate-400">
            Hiển thị{" "}
            <strong className="text-slate-600 font-bold">{filtered.length}</strong>
            {" "}/{" "}
            <strong className="text-slate-600 font-bold">{orders.length}</strong>
            {" "}đơn hàng
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SKELETON & EMPTY STATE
══════════════════════════════════════════════ */
function SkeletonRows() {
  return (
    <div>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="px-4 sm:px-6 py-4 border-b border-slate-50 last:border-b-0">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-2xl flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="skeleton h-3 rounded-md" style={{ width: `${50 + (i*7)%30}%` }} />
              <div className="skeleton h-2.5 rounded-md" style={{ width: `${30 + (i*11)%25}%` }} />
            </div>
            <div className="skeleton h-6 w-16 rounded-full hidden sm:block" />
            <div className="skeleton h-7 w-20 rounded-xl hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasActiveFilter, onClear }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 sm:py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
        {Icons.box("w-8 h-8")}
      </div>
      <div className="text-[14px] font-bold text-slate-500">Không có đơn hàng nào</div>
      <div className="text-[12px] text-slate-400 max-w-xs">
        {hasActiveFilter ? "Không tìm thấy đơn phù hợp với bộ lọc hiện tại" : "Hệ thống chưa có đơn hàng nào"}
      </div>
      {hasActiveFilter && (
        <button onClick={onClear}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors">
          {Icons.close("w-3.5 h-3.5")}
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   CSS
══════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes toast-slide {
    from { opacity: 0; transform: translateY(-12px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes expandPanel {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes modalFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .spinner       { animation: spin 0.75s linear infinite; }
  .toast-slide   { animation: toast-slide 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .expand-panel  { animation: expandPanel 0.22s cubic-bezier(0.34,1.2,0.64,1); }
  .modal-overlay { animation: modalFadeIn 0.2s ease; }
  .modal-content { animation: modalSlideUp 0.3s cubic-bezier(0.34,1.4,0.64,1); }

  .skeleton {
    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  /* Custom XS breakpoint helper */
  @media (min-width: 400px) {
    .xs\\:inline { display: inline; }
  }

  /* Hide scrollbar on horizontal filter scroll, mobile only */
  .filter-scroll::-webkit-scrollbar { height: 0; display: none; }
  .filter-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* Native select styling */
  select {
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px !important;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;