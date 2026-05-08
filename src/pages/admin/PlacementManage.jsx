import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { adminPlacementApi } from "../../api/placementApi";
import axiosClient from "../../api/axios";

import {
  Home, Smartphone, Laptop, Zap, GripVertical, Plus, Trash2, Edit3, X, Check,
  Save, Search, AlertTriangle, Calendar, CalendarClock, Percent, Package,
  Clock, PlayCircle, XCircle, CheckCircle, Hash, ArrowRight, Layers,
  RefreshCw, Loader2, ShoppingBag, Store, Info, AlertCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   1. CONSTANTS
═══════════════════════════════════════════════════════════════ */
const PLACEMENTS = [
  { key: "homepage",  label: "Trang chủ",  icon: Home,       hex: "#6366f1", bg: "#eef2ff", ring: "ring-indigo-500/20" },
  { key: "phones",    label: "Điện thoại", icon: Smartphone, hex: "#0ea5e9", bg: "#f0f9ff", ring: "ring-sky-500/20" },
  { key: "laptops",   label: "Laptop",     icon: Laptop,     hex: "#10b981", bg: "#ecfdf5", ring: "ring-emerald-500/20" },
  { key: "flashsale", label: "Flash Sale", icon: Zap,        hex: "#f59e0b", bg: "#fffbeb", ring: "ring-amber-500/20" },
];

const SALE_STATUS_META = {
  live:     { label: "Đang diễn ra", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: PlayCircle },
  soon:     { label: "Sắp diễn ra",  classes: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500",   icon: Clock },
  upcoming: { label: "Sắp tới",      classes: "bg-sky-50 text-sky-700 border-sky-200",             dot: "bg-sky-500",     icon: Calendar },
  ended:    { label: "Đã kết thúc",  classes: "bg-slate-100 text-slate-500 border-slate-200",      dot: "bg-slate-400",   icon: CheckCircle },
  notime:   { label: "Chưa đặt giờ", classes: "bg-red-50 text-red-600 border-red-200",             dot: "bg-red-500",     icon: XCircle },
};

const Z = { dropdown: 500, modal: 1000, drawer: 1100, toast: 9999 };

/* ═══════════════════════════════════════════════════════════════
   2. HELPERS
═══════════════════════════════════════════════════════════════ */
const fmtVND  = (v) => (v == null || v === "") ? "—" : Number(v).toLocaleString("vi-VN") + "₫";
const toInput = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
const calcSalePrice   = (op, pct)  => (!op || !pct)  ? 0 : Math.round(Number(op) * (1 - Number(pct) / 100));
const calcDiscountPct = (op, sale) => (!op || !sale) ? 0 : Math.round((1 - Number(sale) / Number(op)) * 100);

const getSaleStatus = (entry) => {
  const now = Date.now();
  if (!entry.saleStartAt) return "notime";
  const start = new Date(entry.saleStartAt).getTime();
  const end   = entry.saleEndAt ? new Date(entry.saleEndAt).getTime() : null;
  if (end && now > end)    return "ended";
  if (now >= start)        return "live";
  return ((start - now) / 36e5) <= 24 ? "soon" : "upcoming";
};

const sessionKey = (entry) => !entry.saleStartAt
  ? "__notime__"
  : `${entry.saleStartAt}|${entry.saleEndAt || "open"}`;

const fmtShort = (iso) => iso
  ? new Date(iso).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })
  : "";

/* ═══════════════════════════════════════════════════════════════
   3. HOOKS
═══════════════════════════════════════════════════════════════ */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  const push = useCallback((msg, type = "success", duration = 3500) => {
    const id = ++idRef.current;
    setToasts(p => [...p, { id, msg, type }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);
  return { toasts, push, dismiss };
}

/* ═══════════════════════════════════════════════════════════════
   4. PRIMITIVE COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* ─── ToastViewport ─── */
function ToastViewport({ toasts, onDismiss }) {
  const ICONS = { success: CheckCircle, error: AlertTriangle, info: Info };
  const STYLES = {
    success: "border-emerald-200 text-emerald-700 [&_svg]:text-emerald-500",
    error:   "border-red-200 text-red-600 [&_svg]:text-red-500",
    info:    "border-sky-200 text-sky-700 [&_svg]:text-sky-500",
  };
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 pointer-events-none" style={{ zIndex: Z.toast }}>
      {toasts.map(t => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2.5 pl-4 pr-2 py-3 rounded-xl text-sm font-medium shadow-lg border bg-white min-w-[260px] max-w-[380px] animate-[toast-in_.25s_cubic-bezier(.32,1,.25,1)] ${STYLES[t.type] || STYLES.info}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{t.msg}</span>
            <button
              onClick={() => onDismiss(t.id)}
              className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              aria-label="Đóng thông báo"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── ConfirmDialog (focus-trapped, ESC-closable) ─── */
function ConfirmDialog({ title, message, confirmText = "Xác nhận", cancelText = "Hủy", danger, loading, onConfirm, onCancel }) {
  const dialogRef = useRef();
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !loading) onCancel(); };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector("[data-autofocus]")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, loading]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fade-in_.15s_ease]"
      style={{ zIndex: Z.modal }}
      onClick={() => !loading && onCancel()}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby="confirm-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4 animate-[modal-in_.2s_cubic-bezier(.32,1,.25,1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${danger ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
          {danger ? <Trash2 size={26} /> : <AlertCircle size={26} />}
        </div>
        <div>
          <div id="confirm-title" className="text-base font-bold text-slate-900">{title}</div>
          {message && <div className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</div>}
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            data-autofocus
            className={`flex-1 h-10 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-slate-900 hover:bg-slate-700"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : danger ? <Trash2 size={14} /> : <Check size={14} />}
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Field error helper ─── */
const FieldError = ({ children }) => children
  ? <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1"><AlertCircle size={11} /> {children}</p>
  : null;

/* ─── Sale status pill ─── */
function SaleStatusBadge({ entry }) {
  const meta = SALE_STATUS_META[getSaleStatus(entry)];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.classes}`}>
      <Icon size={11} /> {meta.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. STOCK LIMIT FIELD
═══════════════════════════════════════════════════════════════ */
function StockLimitField({ value, onChange }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-white p-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
        <Package size={13} />
        <span>Giới hạn số lượng sale</span>
        <span className="ml-auto text-[11px] text-slate-400 font-normal">tuỳ chọn</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[120px] max-w-[160px]">
          <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
          <input
            type="number"
            min="1"
            inputMode="numeric"
            className="w-full h-10 pl-8 pr-12 border border-amber-200 rounded-lg text-sm font-semibold bg-amber-50/50 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:bg-white placeholder:font-normal placeholder:text-amber-300 transition-all"
            placeholder="VD: 50"
            value={value || ""}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : "")}
            aria-label="Giới hạn số lượng"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-500 pointer-events-none">cái</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
          value ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
        }`}>
          {value ? <><Check size={11} /> {value} cái</> : "Không giới hạn"}
        </span>
      </div>
      {value && Number(value) < 10 && (
        <FieldError>Số lượng rất thấp, dễ hết sớm!</FieldError>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. FLASH SALE FORM PANEL
═══════════════════════════════════════════════════════════════ */
function FlashSaleFormPanel({ products = [], singleMode = false, value, onChange, errors = {} }) {
  const origPrice = singleMode && products[0] ? Number(products[0].price) : null;

  const handlePctSingle = (pct) => {
    onChange("discountPct", pct);
    if (origPrice && pct) onChange("salePrice", calcSalePrice(origPrice, pct));
    else if (!pct) onChange("salePrice", "");
  };
  const handlePriceSingle = (price) => {
    onChange("salePrice", price);
    if (origPrice && price) onChange("discountPct", calcDiscountPct(origPrice, price));
    else if (!price) onChange("discountPct", "");
  };

  const computedSingle  = (!value.salePrice && origPrice && value.discountPct) ? calcSalePrice(origPrice, value.discountPct) : null;
  const effectiveSingle = value.salePrice || computedSingle;

  const overrides = value.overrides || {};
  const getProductPct  = (p) => overrides[p.id] ?? value.discountPct ?? "";
  const getProductSale = (p) => {
    const pct = getProductPct(p);
    return pct ? calcSalePrice(p.price, pct) : 0;
  };
  const handleOverridePct = (pid, pct) => {
    const next = { ...overrides };
    if (pct === "" || pct == null) delete next[pid];
    else next[pid] = pct;
    onChange("overrides", next);
  };

  const overrideCount = Object.keys(overrides).length;
  const allReady = !singleMode && products.length > 0 && products.every(p => getProductSale(p) > 0);
  const timeOk = value.saleStartAt && value.saleEndAt && value.saleEndAt > value.saleStartAt;

  return (
    <div className="p-4 bg-gradient-to-b from-amber-50/80 to-orange-50/30 min-h-full space-y-5">
      {/* Heading */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-200">
          <Zap size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-amber-900">Thông tin Flash Sale</span>
        {!singleMode && products.length > 0 && (
          <span className="ml-auto bg-amber-200/70 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {products.length} SP
          </span>
        )}
      </div>

      {/* SINGLE MODE */}
      {singleMode && (
        <div className="space-y-3">
          {origPrice > 0 && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-amber-200">
              <span className="text-xs font-semibold text-amber-700">Giá gốc</span>
              <span className="text-sm font-bold text-slate-900">{fmtVND(origPrice)}</span>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-amber-800 mb-2">Giá bán</div>
            <div className="flex items-start gap-3">
              {/* Discount % */}
              <div className="flex-1 space-y-1.5">
                <label htmlFor="single-pct" className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                  <Percent size={10} /> Giảm %
                </label>
                <div className="relative">
                  <input
                    id="single-pct"
                    type="number" min="1" max="99"
                    inputMode="numeric"
                    className="w-full h-10 px-3 pr-8 border border-amber-200 rounded-lg text-sm font-semibold bg-white text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 placeholder:font-normal placeholder:text-slate-300 transition-all"
                    placeholder="30"
                    value={value.discountPct || ""}
                    onChange={e => handlePctSingle(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-500 font-bold">%</span>
                </div>
                {value.discountPct
                  ? <span className="inline-block text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">-{value.discountPct}%</span>
                  : <span className="text-[11px] text-slate-400">Nhập để tự tính</span>}
              </div>

              <div className="flex items-center pt-7 text-amber-400"><ArrowRight size={14} /></div>

              {/* Sale price */}
              <div className="flex-[1.5] space-y-1.5">
                <label htmlFor="single-price" className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                  <Zap size={10} /> Giá bán {!value.discountPct && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    id="single-price"
                    type="number" min="0"
                    inputMode="numeric"
                    className={`w-full h-10 px-3 pr-7 border rounded-lg text-sm font-semibold outline-none transition-all placeholder:font-normal focus:ring-2 ${
                      computedSingle && !value.salePrice
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-100"
                        : "border-amber-200 bg-white text-slate-900 focus:border-amber-400 focus:ring-amber-100"
                    }`}
                    placeholder={computedSingle ? String(computedSingle) : "VD: 25990000"}
                    value={value.salePrice || ""}
                    onChange={e => handlePriceSingle(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-500 font-bold">₫</span>
                </div>
                {effectiveSingle
                  ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      {computedSingle && !value.salePrice && <Check size={10} />} {fmtVND(effectiveSingle)}
                    </span>
                  : <FieldError>Nhập % hoặc giá bán</FieldError>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI MODE */}
      {!singleMode && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-white border border-orange-200 rounded-xl text-xs text-orange-800">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            <span>Nhập <b>% chung</b> cho tất cả, hoặc đặt <b>% riêng</b> cho từng sản phẩm bên dưới.</span>
          </div>

          <div>
            <div className="text-xs font-semibold text-amber-800 mb-2">% Giảm chung <span className="text-red-500">*</span></div>
            <div className="flex items-center gap-3">
              <div className="relative w-32">
                <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
                <input
                  type="number" min="1" max="99"
                  inputMode="numeric"
                  className="w-full h-12 pl-8 pr-9 border-2 border-amber-300 rounded-xl text-xl font-bold text-amber-900 bg-amber-50 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-center transition-all placeholder:text-base placeholder:font-normal placeholder:text-amber-300"
                  placeholder="10"
                  value={value.discountPct || ""}
                  onChange={e => onChange("discountPct", e.target.value)}
                  aria-label="% giảm giá chung"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-amber-600 font-bold">%</span>
              </div>
              <div className="space-y-1">
                {value.discountPct
                  ? <div className="text-xs font-semibold text-amber-700">Giảm {value.discountPct}% · {products.length} SP</div>
                  : <FieldError>Bắt buộc nhập</FieldError>}
                {overrideCount > 0 && (
                  <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                    <Edit3 size={10} /> {overrideCount} SP có % riêng
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {products.map(p => {
              const rowSale  = getProductSale(p);
              const isOverride = overrides[p.id] !== undefined;
              const saving   = rowSale > 0 ? Number(p.price) - rowSale : 0;
              return (
                <div key={p.id} className={`bg-white rounded-xl border p-3 transition-all ${
                  isOverride ? "border-orange-300 bg-orange-50/30"
                  : rowSale > 0 ? "border-emerald-200" : "border-amber-100"
                }`}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <ProductImage src={p.img} alt={p.title} className="w-9 h-9" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.brand}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {rowSale > 0 && <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">-{fmtVND(saving)}</span>}
                      {isOverride && <span className="text-[11px] font-bold bg-orange-100 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Edit3 size={9} /> riêng</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50/60 rounded-lg px-3 py-2 border border-amber-100">
                    <span className="text-xs font-semibold text-amber-800 flex-shrink-0">Giảm</span>
                    <div className="relative w-16">
                      <input
                        type="number" min="1" max="99"
                        inputMode="numeric"
                        className={`w-full h-9 pr-5 pl-2 border rounded-lg text-sm font-bold text-center outline-none transition-all focus:ring-2 ${
                          isOverride
                            ? "border-orange-300 bg-orange-50 text-orange-700 focus:ring-orange-100"
                            : "border-amber-200 bg-white text-amber-800 focus:ring-amber-100"
                        }`}
                        placeholder={value.discountPct || "—"}
                        value={overrides[p.id] ?? ""}
                        onChange={e => handleOverridePct(p.id, e.target.value || null)}
                        aria-label={`% giảm cho ${p.title}`}
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-amber-500">%</span>
                    </div>
                    {isOverride && (
                      <button
                        onClick={() => handleOverridePct(p.id, null)}
                        className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-200 transition-all flex-shrink-0"
                        title="Dùng lại % chung"
                        aria-label="Bỏ % riêng"
                      >
                        <RefreshCw size={11} />
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[11px] text-slate-400 line-through">{fmtVND(p.price)}</span>
                      <span className="text-[11px] text-amber-600">→</span>
                      {rowSale > 0
                        ? <span className="text-sm font-bold text-red-500">{fmtVND(rowSale)}</span>
                        : <span className="text-[11px] text-slate-300 italic">—</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {allReady && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <Check size={13} /> Mỗi sản phẩm đều có giá sale
                {overrideCount > 0 && <span className="text-amber-700">· {overrideCount} SP tuỳ chỉnh</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIME */}
      <div>
        <div className="text-xs font-semibold text-amber-800 mb-2">Thời gian</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-medium text-amber-700"><Calendar size={11} /> Bắt đầu</label>
            <input
              type="datetime-local"
              className="w-full h-10 px-3 border border-amber-200 rounded-lg text-xs font-medium bg-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              value={value.saleStartAt || ""}
              onChange={e => onChange("saleStartAt", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-medium text-amber-700"><CalendarClock size={11} /> Kết thúc</label>
            <input
              type="datetime-local"
              className="w-full h-10 px-3 border border-amber-200 rounded-lg text-xs font-medium bg-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              value={value.saleEndAt || ""}
              min={value.saleStartAt || ""}
              onChange={e => onChange("saleEndAt", e.target.value)}
            />
            {value.saleStartAt && value.saleEndAt && value.saleEndAt <= value.saleStartAt && (
              <FieldError>Phải sau giờ bắt đầu</FieldError>
            )}
          </div>
        </div>
      </div>

      {/* STOCK */}
      <div>
        <div className="text-xs font-semibold text-amber-800 mb-2">Số lượng / sản phẩm</div>
        <StockLimitField value={value.stockLimit} onChange={v => onChange("stockLimit", v)} />
      </div>

      {/* SUMMARY */}
      {(singleMode ? effectiveSingle : allReady) && (
        <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-300 rounded-xl p-3 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-red-500">
            <Zap size={14} className="text-amber-500" />
            {singleMode ? (
              <>
                {fmtVND(effectiveSingle)}
                {value.discountPct && <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full ml-1">-{value.discountPct}%</span>}
              </>
            ) : (
              <>Giảm {value.discountPct}%{overrideCount > 0 && ` (+${overrideCount} riêng)`} · {products.length} SP</>
            )}
          </div>
          {timeOk && <div className="text-xs text-amber-800 font-medium">{fmtShort(value.saleStartAt)} → {fmtShort(value.saleEndAt)}</div>}
          {value.stockLimit && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Package size={12} /> {value.stockLimit} cái / SP
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. PRODUCT IMAGE (with fallback)
═══════════════════════════════════════════════════════════════ */
function ProductImage({ src, alt, className = "w-11 h-11" }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className={`${className} rounded-xl border border-slate-100 bg-slate-100 flex items-center justify-center flex-shrink-0`}>
        <ShoppingBag size={14} className="text-slate-300" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ""}
      className={`${className} object-contain rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0`}
      onError={() => setError(true)}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. PRODUCT PICKER (dùng trong AddPanel — tách ra ngoài để fix focus)
═══════════════════════════════════════════════════════════════ */
function ProductPicker({
  search, onSearchChange, onClearSearch,
  tab, onTabChange,
  recent, results, loading,
  selected, onToggleSelect, onSelectAll,
  isFlash, autoFocus,
}) {
  const displayList = tab === "search" ? results : recent;
  const allSelectedInList = displayList.length > 0 && displayList.every(p => selected.has(p.id));

  return (
    <>
      <div className="px-3 py-2.5 border-b border-slate-100">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="w-full h-10 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
            value={search}
            onChange={onSearchChange}
            placeholder="Tìm sản phẩm theo tên, brand..."
            autoFocus={autoFocus}
            aria-label="Tìm sản phẩm"
          />
          {search && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
              onClick={onClearSearch}
              aria-label="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-100 px-3">
        <button
          className={`text-xs font-semibold py-2.5 px-2 border-b-2 transition-all ${
            tab === "recent" ? "border-slate-800 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
          onClick={() => onTabChange("recent")}
        >
          Mới nhất
          {recent.length > 0 && <span className="ml-1.5 bg-slate-100 text-slate-600 text-[11px] px-1.5 py-0.5 rounded-full font-bold">{recent.length}</span>}
        </button>
        {results.length > 0 && (
          <button
            className={`text-xs font-semibold py-2.5 px-2 border-b-2 transition-all ${
              tab === "search" ? "border-slate-800 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            onClick={() => onTabChange("search")}
          >
            Kết quả <span className="ml-1.5 bg-blue-50 text-blue-600 text-[11px] px-1.5 py-0.5 rounded-full font-bold">{results.length}</span>
          </button>
        )}
      </div>

      {displayList.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
          <button
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            onClick={onSelectAll}
          >
            {allSelectedInList ? "Bỏ chọn" : `Chọn tất cả (${displayList.length})`}
          </button>
          {selected.size > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Check size={11} /> {selected.size} đã chọn
            </span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 min-h-0 space-y-1">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Đang tải...
          </div>
        )}
        {!loading && displayList.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-slate-400 text-sm">
            <ShoppingBag size={28} className="text-slate-300" />
            <span>{tab === "search" && search ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm"}</span>
          </div>
        )}
        {displayList.map(p => {
          const isSel = selected.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                isSel ? "bg-indigo-50 border-indigo-200" : "border-transparent hover:bg-slate-50"
              }`}
              onClick={() => onToggleSelect(p.id)}
              aria-pressed={isSel}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isSel ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
              }`}>
                {isSel && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <ProductImage src={p.img} alt={p.title} className="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{p.title}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <span>{p.brand}</span><span>·</span>
                  <span className="font-semibold text-slate-600">{fmtVND(p.price)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isFlash && selected.size === 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border-t border-amber-200 text-xs font-medium text-amber-700">
          <Zap size={13} /> Chọn sản phẩm để nhập thông tin Flash Sale
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. ADD PANEL (cross-tab selection, fixed focus, Promise.allSettled tracking)
═══════════════════════════════════════════════════════════════ */
function AddPanel({ placement, onClose, anchorRef, onResult }) {
  const [tab, setTab] = useState("recent");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [productCache, setProductCache] = useState(new Map()); // ✅ giữ products đã chọn ngay cả khi đổi tab
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState({ salePrice:"", discountPct:"", saleStartAt:"", saleEndAt:"", stockLimit:"" });
  const [mobileTab, setMobileTab] = useState("products");
  const panelRef = useRef();
  const debounceRef = useRef();
  const isMobile = useIsMobile();
  const pl = PLACEMENTS.find(p => p.key === placement);
  const isFlash = placement === "flashsale";

  // Fetch recent
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get("/products", { params: { limit: 20, status: "active", sort: "createdAt_desc" } });
        if (!cancelled) setRecent(res.data?.data?.data || []);
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Outside click
  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef, isMobile]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Cleanup debounce
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await axiosClient.get("/products", { params: { search: q, limit: 30, status: "active" } });
      setResults(res.data?.data?.data || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleSearch = useCallback((e) => {
    const q = e.target.value;
    setSearch(q);
    setTab(q.trim() ? "search" : "recent");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 350);
  }, [doSearch]);

  const handleClearSearch = useCallback(() => {
    setSearch(""); setTab("recent"); setResults([]);
  }, []);

  // ✅ Cache products khi toggle để giữ được dù chuyển tab
  const toggleSelect = useCallback((id) => {
    const product = [...recent, ...results].find(p => p.id === id);
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    if (product) {
      setProductCache(prev => {
        const next = new Map(prev);
        next.set(id, product);
        return next;
      });
    }
  }, [recent, results]);

  const displayList = tab === "search" ? results : recent;

  const handleSelectAll = useCallback(() => {
    const allSelected = displayList.every(p => selected.has(p.id));
    setSelected(prev => {
      const n = new Set(prev);
      if (allSelected) displayList.forEach(p => n.delete(p.id));
      else displayList.forEach(p => n.add(p.id));
      return n;
    });
    setProductCache(prev => {
      const next = new Map(prev);
      displayList.forEach(p => next.set(p.id, p));
      return next;
    });
  }, [displayList, selected]);

  // ✅ Lấy products từ cache (cross-tab)
  const selectedProducts = useMemo(
    () => [...selected].map(id => productCache.get(id)).filter(Boolean),
    [selected, productCache]
  );

  const getEffectiveSalePrice = (prod) => {
    const ov = flash.overrides || {};
    const pct = ov[prod.id] ?? flash.discountPct;
    if (pct && prod?.price) return calcSalePrice(prod.price, pct);
    if (flash.salePrice)    return Number(flash.salePrice);
    return 0;
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;

    if (isFlash) {
      const allReady = selectedProducts.every(prod => getEffectiveSalePrice(prod) > 0);
      if (!allReady) {
        onResult({ ok: false, msg: "Vui lòng nhập giá sale hoặc % giảm giá cho TẤT CẢ sản phẩm!" });
        if (isMobile) setMobileTab("flash");
        return;
      }
      if (flash.saleStartAt && flash.saleEndAt && flash.saleEndAt <= flash.saleStartAt) {
        onResult({ ok: false, msg: "Thời gian kết thúc phải sau thời gian bắt đầu!" });
        return;
      }
    }

    setSaving(true);
    try {
      const settled = await Promise.allSettled(selectedProducts.map(prod => {
        const payload = { productId: prod.id, placement };
        if (isFlash) {
          payload.salePrice = getEffectiveSalePrice(prod);
          if (flash.saleStartAt) payload.saleStartAt = flash.saleStartAt;
          if (flash.saleEndAt)   payload.saleEndAt   = flash.saleEndAt;
          if (flash.stockLimit)  payload.stockLimit  = Number(flash.stockLimit);
        }
        return adminPlacementApi.add(payload);
      }));

      const success = settled.filter(s => s.status === "fulfilled").length;
      const failed  = settled.length - success;

      onResult({ ok: failed === 0, success, failed, total: settled.length });
      if (failed === 0) onClose();
    } finally { setSaving(false); }
  };

  const showFlashPane = isFlash && selected.size > 0;

  /* ───── MOBILE LAYOUT ───── */
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 flex items-end bg-slate-900/60 backdrop-blur-sm animate-[fade-in_.18s_ease]"
        style={{ zIndex: Z.drawer }}
        onClick={onClose}
      >
        <div
          ref={panelRef}
          className="w-full max-h-[92dvh] bg-white rounded-t-2xl flex flex-col overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
          style={{ animation: "slide-up .28s cubic-bezier(.32,1,.25,1)" }}
        >
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:pl?.bg, color:pl?.hex}}>
                {pl && <pl.icon size={15} />}
              </div>
              <span className="text-sm font-bold text-slate-900">
                Thêm vào <span style={{color:pl?.hex}}>{pl?.label}</span>
              </span>
            </div>
            <button
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={15} />
            </button>
          </div>

          {showFlashPane && (
            <div className="flex border-b border-slate-100 flex-shrink-0">
              <button
                className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                  mobileTab === "products" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400"
                }`}
                onClick={() => setMobileTab("products")}
              >
                Chọn SP
                {selected.size > 0 && <span className="bg-slate-100 text-slate-600 text-[11px] px-1.5 rounded-full font-bold">{selected.size}</span>}
              </button>
              <button
                className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                  mobileTab === "flash" ? "border-amber-500 text-amber-700" : "border-transparent text-slate-400"
                }`}
                onClick={() => setMobileTab("flash")}
              >
                <Zap size={13} /> Flash Sale
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
            {(!showFlashPane || mobileTab === "products") && (
              <ProductPicker
                search={search} onSearchChange={handleSearch} onClearSearch={handleClearSearch}
                tab={tab} onTabChange={setTab}
                recent={recent} results={results} loading={loading}
                selected={selected} onToggleSelect={toggleSelect} onSelectAll={handleSelectAll}
                isFlash={isFlash}
              />
            )}
            {showFlashPane && mobileTab === "flash" && (
              <FlashSaleFormPanel
                products={selectedProducts}
                singleMode={selected.size === 1}
                value={flash}
                onChange={(field, val) => setFlash(prev => ({ ...prev, [field]: val }))}
              />
            )}
          </div>

          <FooterBar
            onClose={onClose}
            onAdd={handleAdd}
            saving={saving}
            count={selected.size}
          />
        </div>
      </div>
    );
  }

  /* ───── DESKTOP LAYOUT ───── */
  return (
    <>
      {showFlashPane && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm animate-[fade-in_.15s_ease]"
          style={{ zIndex: Z.dropdown - 1 }}
          onClick={onClose}
        />
      )}
      <div
        ref={panelRef}
        style={{ zIndex: Z.dropdown, animation: showFlashPane ? "modal-in .2s ease" : "panel-in .18s ease" }}
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex overflow-hidden ${
          showFlashPane
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "absolute top-[calc(100%+10px)] right-0"
        }`}
      >
        {!showFlashPane && (
          <div className="absolute -top-1.5 right-5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45 rounded-tl-sm" />
        )}

        {/* LEFT — picker */}
        <div className={`flex flex-col overflow-hidden ${
          showFlashPane ? "w-[380px] max-h-[80vh] rounded-l-2xl border-r border-slate-100" : "w-[380px] max-h-[640px] rounded-2xl"
        }`}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:pl?.bg, color:pl?.hex}}>
                {pl && <pl.icon size={14} />}
              </div>
              <span className="text-sm font-bold text-slate-900">
                Thêm vào <span style={{color:pl?.hex}}>{pl?.label}</span>
              </span>
            </div>
            <button
              className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={14} />
            </button>
          </div>

          <ProductPicker
            search={search} onSearchChange={handleSearch} onClearSearch={handleClearSearch}
            tab={tab} onTabChange={setTab}
            recent={recent} results={results} loading={loading}
            selected={selected} onToggleSelect={toggleSelect} onSelectAll={handleSelectAll}
            isFlash={isFlash}
            autoFocus
          />

          <FooterBar
            onClose={onClose}
            onAdd={handleAdd}
            saving={saving}
            count={selected.size}
          />
        </div>

        {/* RIGHT — flash sale form */}
        {showFlashPane && (
          <div className="w-[440px] max-h-[80vh] overflow-y-auto rounded-r-2xl animate-[slide-in-right_.2s_ease]">
            <FlashSaleFormPanel
              products={selectedProducts}
              singleMode={selected.size === 1}
              value={flash}
              onChange={(field, val) => setFlash(prev => ({ ...prev, [field]: val }))}
            />
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Footer bar (tách thành component nhỏ) ─── */
function FooterBar({ onClose, onAdd, saving, count }) {
  return (
    <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 bg-white">
      <div className="flex-1" />
      <button
        className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        onClick={onClose}
      >
        <X size={14} /> Hủy
      </button>
      <button
        className={`h-10 px-4 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 transition-all ${
          count === 0 || saving
            ? "bg-slate-300 cursor-not-allowed"
            : "bg-slate-900 hover:bg-slate-700 shadow-sm"
        }`}
        onClick={onAdd}
        disabled={count === 0 || saving}
      >
        {saving
          ? <><Loader2 size={14} className="animate-spin" /> Đang thêm...</>
          : <><Plus size={14} /> Thêm {count > 0 ? `${count} SP` : "sản phẩm"}</>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. EDIT FLASH MODAL
═══════════════════════════════════════════════════════════════ */
function EditFlashModal({ entry, onSave, onClose, onResult }) {
  const origPrice = entry.product?.price ? Number(entry.product.price) : null;
  const initPct   = origPrice && entry.salePrice ? calcDiscountPct(origPrice, entry.salePrice) : "";
  const [flash, setFlash] = useState({
    salePrice:   entry.salePrice   || "",
    discountPct: initPct           || "",
    saleStartAt: toInput(entry.saleStartAt),
    saleEndAt:   toInput(entry.saleEndAt),
    stockLimit:  entry.stockLimit  || "",
    stockSold:   entry.stockSold   || 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !saving) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const handleSave = async () => {
    if (!flash.salePrice) { onResult({ ok: false, msg: "Vui lòng nhập giá sale!" }); return; }
    if (flash.saleStartAt && flash.saleEndAt && flash.saleEndAt <= flash.saleStartAt) {
      onResult({ ok: false, msg: "Thời gian kết thúc phải sau giờ bắt đầu!" }); return;
    }
    setSaving(true);
    try {
      await onSave(entry.id, {
        salePrice:   Number(flash.salePrice),
        saleStartAt: flash.saleStartAt || null,
        saleEndAt:   flash.saleEndAt   || null,
        stockLimit:  flash.stockLimit  ? Number(flash.stockLimit) : null,
      });
      onClose();
    } catch (err) {
      onResult({ ok: false, msg: "Cập nhật thất bại!" });
    } finally { setSaving(false); }
  };

  const pctSold = flash.stockLimit && flash.stockSold ? Math.round((flash.stockSold / flash.stockLimit) * 100) : 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fade-in_.15s_ease]"
      style={{ zIndex: Z.modal }}
      onClick={() => !saving && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[460px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-[modal-in_.2s_cubic-bezier(.32,1,.25,1)]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="edit-flash-title"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chỉnh sửa Flash Sale</div>
              <div id="edit-flash-title" className="text-sm font-bold text-slate-900 truncate max-w-[240px]">
                {entry.product?.title || "Flash Sale"}
              </div>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={15} />
          </button>
        </div>

        {flash.stockLimit > 0 && (
          <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <Package size={12} />
                Đã bán <b className="text-amber-900">{flash.stockSold}</b> / <b className="text-amber-900">{flash.stockLimit}</b> cái
              </span>
              <span className={`text-xs font-bold ${pctSold >= 80 ? "text-red-500" : "text-amber-600"}`}>{pctSold}%</span>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(pctSold, 100)}%`, background: pctSold >= 80 ? "#ef4444" : "#f59e0b" }}
              />
            </div>
            {pctSold >= 80 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                <AlertTriangle size={12} /> Sắp hết hàng!
              </div>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          <FlashSaleFormPanel
            products={entry.product ? [entry.product] : []}
            singleMode={true}
            value={flash}
            onChange={(field, val) => setFlash(prev => ({ ...prev, [field]: val }))}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50">
          <button
            className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
            onClick={onClose}
            disabled={saving}
          >
            <X size={14} /> Hủy
          </button>
          <button
            className={`h-10 px-4 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 transition-all ${
              saving ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-700 shadow-sm"
            }`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</> : <><Save size={14} /> Lưu thay đổi</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. DRAG LIST (touch + keyboard support, optimistic w/ rollback)
═══════════════════════════════════════════════════════════════ */
function DragList({ items, onReorder, onRemoveMulti, onEditFlash, placement }) {
  const [list, setList] = useState(items);
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ Sync with parent BUT preserve selection of items that still exist
  useEffect(() => {
    setList(items);
    setSelected(prev => new Set([...prev].filter(id => items.some(e => e.id === id))));
  }, [items]);

  const pl = PLACEMENTS.find(p => p.key === placement);
  const isFlash = placement === "flashsale";

  /* ───── Drag handlers ───── */
  const handleDragStart = (e, idx) => {
    setDragging(idx);
    e.dataTransfer.effectAllowed = "move";
    // Empty drag image avoids browser ghost
    try { e.dataTransfer.setData("text/plain", String(idx)); } catch {}
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (over !== idx) setOver(idx);
  };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) {
      setDragging(null); setOver(null); return;
    }
    const next = [...list];
    const [moved] = next.splice(dragging, 1);
    next.splice(idx, 0, moved);
    const reordered = next.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    const prev = list;
    setList(reordered);
    setDragging(null); setOver(null);
    onReorder(reordered, () => setList(prev)); // ✅ rollback callback
  };
  const handleDragEnd = () => { setDragging(null); setOver(null); };

  /* ───── Keyboard reorder (a11y) ───── */
  const handleKeyReorder = (e, idx) => {
    if (!(e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown"))) return;
    e.preventDefault();
    const newIdx = e.key === "ArrowUp" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= list.length) return;
    const next = [...list];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    const reordered = next.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    const prev = list;
    setList(reordered);
    onReorder(reordered, () => setList(prev));
  };

  /* ───── Selection ───── */
  const toggleSelect = (id) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const selectAll = () => setSelected(
    selected.size === list.length ? new Set() : new Set(list.map(e => e.id))
  );
  const selectSession = (ids) => {
    const allIn = ids.every(id => selected.has(id));
    setSelected(prev => {
      const n = new Set(prev);
      if (allIn) ids.forEach(id => n.delete(id));
      else ids.forEach(id => n.add(id));
      return n;
    });
  };

  const handleDeleteSelected = async () => {
    setDeleting(true);
    try { await onRemoveMulti([...selected]); }
    finally { setDeleting(false); setConfirmDelete(false); }
  };

  /* ───── Group sessions for flashsale ───── */
  const grouped = useMemo(() => {
    if (!isFlash) return [{ key: "__all__", entries: list, sessionLabel: null }];
    const map = new Map();
    list.forEach(entry => {
      const k = sessionKey(entry);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(entry);
    });
    return [...map.entries()].map(([key, entries]) => {
      const first = entries[0];
      const status = getSaleStatus(first);
      const meta = SALE_STATUS_META[status];
      const text = key === "__notime__"
        ? "Chưa đặt thời gian"
        : `${fmtShort(first.saleStartAt)} → ${first.saleEndAt ? fmtShort(first.saleEndAt) : "không kết thúc"}`;
      return { key, entries, sessionLabel: { text, status, meta } };
    });
  }, [list, isFlash]);

  /* ───── Empty state ───── */
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Store size={28} className="text-slate-300" />
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-slate-700">Chưa có sản phẩm nào</div>
          <div className="text-sm text-slate-400 mt-1">Bấm <b>"Thêm sản phẩm"</b> ở góc phải để bắt đầu</div>
        </div>
      </div>
    );
  }

  const indeterminate = selected.size > 0 && selected.size < list.length;
  const allSelected = selected.size === list.length;

  return (
    <>
      {/* Bulk action bar */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 border transition-all ${
        selected.size > 0 ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-slate-200"
      }`}>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = indeterminate; }}
            onChange={selectAll}
          />
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            allSelected ? "bg-indigo-600 border-indigo-600" :
            indeterminate ? "bg-indigo-600 border-indigo-600" :
            "border-slate-300 hover:border-slate-400 bg-white"
          }`}>
            {allSelected && <Check size={12} className="text-white" strokeWidth={3} />}
            {indeterminate && !allSelected && <span className="w-2.5 h-0.5 bg-white rounded-full" />}
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {selected.size > 0
              ? <><span className="font-bold text-indigo-700">{selected.size}</span> / {list.length} đã chọn</>
              : `${list.length} sản phẩm`}
          </span>
        </label>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              onClick={() => setSelected(new Set())}
            >
              <X size={13} /> Bỏ chọn
            </button>
            <button
              className="h-9 px-3 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={13} /> Xóa {selected.size}
            </button>
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="space-y-5">
        {grouped.map(({ key, entries, sessionLabel }) => (
          <div key={key}>
            {isFlash && sessionLabel && (
              <SessionHeader
                meta={sessionLabel.meta}
                text={sessionLabel.text}
                count={entries.length}
                allSelected={entries.every(e => selected.has(e.id))}
                onToggleAll={() => selectSession(entries.map(e => e.id))}
              />
            )}

            <div className={`${
              isFlash && sessionLabel
                ? "border border-slate-200 border-t-0 rounded-b-xl divide-y divide-slate-100 overflow-hidden bg-white"
                : "space-y-2"
            }`}>
              {entries.map((entry) => {
                const idx = list.indexOf(entry); // ⚠️ vẫn O(n) nhưng tránh được index lệch sau drag
                const p = entry.product;
                const isSel = selected.has(entry.id);
                const isDraggingThis = dragging === idx;
                const isOver = over === idx && !isDraggingThis;
                const hasStock = isFlash && entry.stockLimit > 0;
                const pctSold = hasStock ? Math.min(Math.round((entry.stockSold || 0) / entry.stockLimit * 100), 100) : 0;

                return (
                  <div
                    key={entry.id}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={e => handleKeyReorder(e, idx)}
                    aria-label={`${entry.sortOrder}. ${p?.title}. Alt+Mũi tên để sắp xếp.`}
                    className={`flex items-center gap-3 px-4 py-3 bg-white transition-all select-none focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      !isFlash ? "rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm" : ""
                    } ${isSel ? "!bg-indigo-50/60" : "hover:bg-slate-50"}
                    ${isDraggingThis ? "opacity-40 !bg-indigo-100" : ""}
                    ${isOver ? "!bg-emerald-50 ring-2 ring-emerald-300 ring-inset" : ""}`}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                  >
                    {/* Checkbox */}
                    <label
                      className="flex-shrink-0 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleSelect(entry.id)}
                        className="sr-only peer"
                        aria-label={`Chọn ${p?.title}`}
                      />
                      <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSel ? "bg-indigo-600 border-indigo-600" : "border-slate-300 hover:border-slate-400 bg-white"
                      }`}>
                        {isSel && <Check size={12} className="text-white" strokeWidth={3} />}
                      </span>
                    </label>

                    {/* Order number */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: pl?.bg, color: pl?.hex }}
                    >
                      {entry.sortOrder}
                    </div>

                    {/* Drag handle (only this is draggable) */}
                    <div
                      draggable
                      onDragStart={e => handleDragStart(e, idx)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing flex-shrink-0 p-1 -m-1 text-slate-300 hover:text-indigo-500 transition-colors rounded hover:bg-slate-100"
                      aria-label="Kéo để sắp xếp"
                      title="Kéo để sắp xếp"
                    >
                      <GripVertical size={16} />
                    </div>

                    <ProductImage src={p?.img} alt={p?.title} className="w-12 h-12" />

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{p?.title}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span>{p?.brand}</span><span>·</span>
                        <span className="font-medium text-slate-700">{fmtVND(p?.price)}</span>
                      </div>

                      {isFlash && entry.salePrice && (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                            <Zap size={11} /> {fmtVND(entry.salePrice)}
                            {p?.price && <span className="opacity-60">(-{calcDiscountPct(p.price, entry.salePrice)}%)</span>}
                          </span>
                          <SaleStatusBadge entry={entry} />
                          {hasStock && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-600">
                                {entry.stockSold || 0}/{entry.stockLimit}
                                {pctSold >= 80 && <span className="ml-0.5">🔥</span>}
                              </span>
                              <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pctSold}%`,
                                    background: pctSold >= 80 ? "#ef4444" : pctSold >= 50 ? "#f59e0b" : "#10b981"
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {!entry.stockLimit && (
                            <span className="text-xs text-slate-400 font-medium">∞ Không giới hạn</span>
                          )}
                        </div>
                      )}
                    </div>

                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${
                      p?.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      p?.status === "draft"  ? "bg-slate-100 text-slate-500 border-slate-200" :
                      "bg-red-50 text-red-500 border-red-200"
                    }`}>
                      {p?.status === "active" ? "Đang bán" : p?.status === "draft" ? "Nháp" : "Hết hàng"}
                    </span>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isFlash && (
                        <button
                          className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all"
                          onClick={() => onEditFlash(entry)}
                          aria-label="Sửa Flash Sale"
                          title="Sửa Flash Sale"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                      <button
                        className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
                        onClick={() => { setSelected(new Set([entry.id])); setConfirmDelete(true); }}
                        aria-label="Xóa"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          danger
          title={`Xóa ${selected.size} sản phẩm?`}
          message="Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa khỏi danh sách hiển thị."
          confirmText={`Xóa ${selected.size} SP`}
          loading={deleting}
          onConfirm={handleDeleteSelected}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

/* ─── Session header (cho Flash Sale) ─── */
function SessionHeader({ meta, text, count, allSelected, onToggleAll }) {
  const Icon = meta.icon;
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 rounded-t-xl border ${meta.classes}`}
      style={{ borderLeftWidth: 3 }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center flex-shrink-0">
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">{meta.label}</div>
          <div className="text-xs font-semibold truncate">{text}</div>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold bg-white/80 border border-current/20 px-2 py-0.5 rounded-full flex-shrink-0">
          <Layers size={11} /> {count}
        </span>
      </div>
      <button
        className="text-xs font-semibold underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
        onClick={onToggleAll}
      >
        {allSelected ? "Bỏ chọn nhóm" : "Chọn nhóm"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function PlacementManage() {
  const [activePlacement, setActivePlacement] = useState("homepage");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const { toasts, push: pushToast, dismiss: dismissToast } = useToast();
  const addBtnRef = useRef();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminPlacementApi.getByPlacement(activePlacement);
      setEntries(data || []);
    } catch {
      pushToast("Không thể tải danh sách!", "error");
    } finally { setLoading(false); }
  }, [activePlacement, pushToast]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { setShowAdd(false); }, [activePlacement]);

  const handleAddResult = useCallback(({ ok, msg, success, failed, total }) => {
    if (msg) { pushToast(msg, "error"); return; }
    if (ok) {
      pushToast(`Đã thêm ${success} sản phẩm thành công!`, "success");
      fetchEntries();
    } else if (success > 0) {
      pushToast(`Thêm ${success}/${total} thành công, ${failed} thất bại!`, "error");
      fetchEntries();
    } else {
      pushToast("Thêm sản phẩm thất bại!", "error");
    }
  }, [pushToast, fetchEntries]);

  const handleRemoveMulti = useCallback(async (ids) => {
    const prev = entries;
    setEntries(p => p.filter(e => !ids.includes(e.id))); // optimistic
    try {
      const settled = await Promise.allSettled(ids.map(id => adminPlacementApi.remove(id)));
      const failed = settled.filter(s => s.status === "rejected").length;
      if (failed === 0) {
        pushToast(`Đã xóa ${ids.length} sản phẩm!`, "success");
      } else {
        pushToast(`Xóa ${ids.length - failed}/${ids.length} thành công, ${failed} thất bại!`, "error");
        setEntries(prev); // rollback
        fetchEntries();
      }
    } catch {
      pushToast("Xóa thất bại!", "error");
      setEntries(prev);
    }
  }, [entries, pushToast, fetchEntries]);

  const handleReorder = useCallback(async (reordered, rollback) => {
    setEntries(reordered);
    try {
      await adminPlacementApi.reorder(
        activePlacement,
        reordered.map(e => ({ id: e.id, sortOrder: e.sortOrder }))
      );
      pushToast("Đã lưu thứ tự mới!", "success");
    } catch (err) {
      pushToast("Lưu thứ tự thất bại!", "error");
      rollback?.();
      fetchEntries();
    }
  }, [activePlacement, pushToast, fetchEntries]);

  const handleEditFlash = useCallback(async (id, data) => {
    await adminPlacementApi.update(id, data); // throw lên modal để nó set saving=false
    pushToast("Cập nhật Flash Sale thành công!", "success");
    fetchEntries();
  }, [pushToast, fetchEntries]);

  const activePl = PLACEMENTS.find(p => p.key === activePlacement);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes panel-in { from { opacity: 0; transform: translateY(-8px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes modal-in { from { opacity: 0; transform: scale(.96) translateY(8px) } to { opacity: 1; transform: none } }
        @keyframes slide-up { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(12px) } to { opacity: 1; transform: none } }
        @keyframes toast-in { from { opacity: 0; transform: translateX(20px) scale(.95) } to { opacity: 1; transform: none } }
      `}</style>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* ─── Header ─── */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 transition-all"
              style={{ background: activePl?.bg, color: activePl?.hex }}
            >
              {activePl && <activePl.icon size={22} />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Sắp xếp vị trí hiển thị
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <GripVertical size={13} /> Kéo thả để sắp xếp · Chọn nhiều để xóa hàng loạt
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              ref={addBtnRef}
              className={`flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                showAdd ? "bg-slate-700" : "bg-slate-900 hover:bg-slate-700 hover:shadow-md hover:-translate-y-0.5"
              }`}
              onClick={() => setShowAdd(v => !v)}
              aria-expanded={showAdd}
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>
            {showAdd && (
              <AddPanel
                placement={activePlacement}
                onClose={() => setShowAdd(false)}
                anchorRef={addBtnRef}
                onResult={handleAddResult}
              />
            )}
          </div>
        </header>

        {/* ─── Placement Tabs ─── */}
        <div role="tablist" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PLACEMENTS.map(pl => {
            const active = activePlacement === pl.key;
            const Icon = pl.icon;
            return (
              <button
                key={pl.key}
                role="tab"
                aria-selected={active}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
                  active
                    ? "shadow-sm ring-2"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={active
                  ? { background: pl.bg, borderColor: pl.hex, color: pl.hex, "--tw-ring-color": `${pl.hex}33` }
                  : {}}
                onClick={() => setActivePlacement(pl.key)}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span className="font-semibold truncate">{pl.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Info Bar ─── */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm gap-2 flex-wrap"
          style={{ borderLeftWidth: 3, borderLeftColor: activePl?.hex }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Layers size={15} style={{ color: activePl?.hex }} />
            {loading ? "Đang tải..." : (
              <span>
                <b className="text-slate-900">{entries.length}</b> sản phẩm trong{" "}
                <span style={{ color: activePl?.hex }}>{activePl?.label}</span>
              </span>
            )}
          </div>
          {activePlacement === "flashsale" && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <Zap size={13} /> Nhấn ✏ để chỉnh · Tick để xóa nhiều
            </div>
          )}
        </div>

        {/* ─── Content ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <Loader2 size={32} className="animate-spin" style={{ color: activePl?.hex }} />
              <span className="text-sm font-medium">Đang tải danh sách...</span>
            </div>
          ) : (
            <DragList
              items={entries}
              placement={activePlacement}
              onReorder={handleReorder}
              onRemoveMulti={handleRemoveMulti}
              onEditFlash={setEditEntry}
            />
          )}
        </div>

        {/* Keyboard help */}
        {entries.length > 0 && (
          <div className="text-center text-xs text-slate-400">
            💡 <b>Mẹo:</b> Bấm <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">Alt</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">↑↓</kbd> để sắp xếp bằng bàn phím
          </div>
        )}
      </div>

      {editEntry && (
        <EditFlashModal
          entry={editEntry}
          onSave={handleEditFlash}
          onClose={() => setEditEntry(null)}
          onResult={({ msg }) => msg && pushToast(msg, "error")}
        />
      )}
    </div>
  );
}