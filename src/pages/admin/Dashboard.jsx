import { useEffect, useMemo, useRef, useState, useId, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axios";

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const ORDER_STATUS = Object.freeze({
  PENDING:   "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const STATUS_CFG = {
  [ORDER_STATUS.PENDING]:   { label: "Chờ duyệt",  tw: "bg-amber-50 text-amber-800 border-amber-200",       color: "#f59e0b" },
  [ORDER_STATUS.CONFIRMED]: { label: "Xác nhận",   tw: "bg-blue-50 text-blue-800 border-blue-200",          color: "#3b82f6" },
  [ORDER_STATUS.COMPLETED]: { label: "Hoàn thành", tw: "bg-emerald-50 text-emerald-800 border-emerald-200", color: "#22c55e" },
  [ORDER_STATUS.CANCELLED]: { label: "Đã hủy",     tw: "bg-red-50 text-red-800 border-red-200",             color: "#ef4444" },
};

const ACTIVITY_TEXT = {
  [ORDER_STATUS.PENDING]:   (id) => `Đơn #${id} vừa được tạo`,
  [ORDER_STATUS.CONFIRMED]: (id) => `Đơn #${id} được xác nhận`,
  [ORDER_STATUS.COMPLETED]: (id) => `Đơn #${id} giao thành công`,
  [ORDER_STATUS.CANCELLED]: (id) => `Đơn #${id} đã bị hủy`,
};

/* ════════════════════════════════════════════════════════════
   ICONS
════════════════════════════════════════════════════════════ */
const Icon = (path, vb = "0 0 24 24") => ({ cls = "" }) => (
  <svg className={cls} viewBox={vb} fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);

const IUsers    = Icon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>);
const IBox      = Icon(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>);
const IOrder    = Icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>);
const IDollar   = Icon(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>);
const IClock    = Icon(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>);
const IXCircle  = Icon(<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>);
const IRefresh  = ({ cls = "" }) => <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IArrow    = Icon(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>);
const IActivity = Icon(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>);
const IGrid     = Icon(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>);
const IEmpty    = Icon(<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>);
const IAlert    = Icon(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>);

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
const safe = (n) => {
  const v = Number(n);
  return isNaN(v) || !isFinite(v) ? 0 : v;
};

const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.data)) return v.data;
  return [];
};

const fmtCurrency = (n) => {
  const v = safe(n);
  if (v === 0) return "0₫";
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B₫";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M₫";
  if (v >= 1_000)         return (v / 1_000).toFixed(0) + "K₫";
  return v.toLocaleString("vi-VN") + "₫";
};

const RTF = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
const timeAgo = (d) => {
  if (!d) return "";
  const diff = (new Date(d).getTime() - Date.now()) / 1000;
  const abs  = Math.abs(diff);
  if (abs < 60)    return RTF.format(Math.round(diff), "second");
  if (abs < 3600)  return RTF.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diff / 3600), "hour");
  if (abs < 2592000) return RTF.format(Math.round(diff / 86400), "day");
  return new Date(d).toLocaleDateString("vi-VN");
};

const getGreeting = (hour) => {
  if (hour < 5)  return "Chúc ngủ ngon";
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

const formatDate = (d) => {
  const DAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return `${DAYS[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

/* ════════════════════════════════════════════════════════════
   HOOKS
════════════════════════════════════════════════════════════ */
function useCount(target, ms = 900) {
  const [v, setV] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const t = safe(target);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!t) { setV(0); return; }

    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(e * t));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, ms]);

  return v;
}

function useCurrentUser() {
  return useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════ */

/* —————— Stat Card —————— */
function StatCard({ icon, label, sub, value, color, bgColor, delay, to }) {
  const counted = useCount(safe(value));
  return (
    <Link
      to={to}
      className="block no-underline group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-2xl"
    >
      <div
        className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full"
        style={{ animationDelay: delay, animation: "fadeUp 0.5s ease both" }}
      >
        <div className="flex justify-between items-start mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: bgColor, color }}
          >
            {icon}
          </div>
          <IArrow cls="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>

        <div className="text-4xl font-extrabold text-stone-900 tracking-tight leading-none mb-2 font-display tabular-nums">
          {counted.toLocaleString("vi-VN")}
        </div>
        <div className="text-sm font-semibold text-gray-700 mb-0.5">{label}</div>
        <div className="text-xs text-gray-400">{sub}</div>

        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"
          style={{ background: color }}
        />
      </div>
    </Link>
  );
}

/* —————— Revenue Card —————— */
function RevenueCard({ value, target, delay }) {
  const pct = target > 0 ? Math.min(Math.round((value / target) * 100), 999) : null;
  const showPct = pct !== null;

  return (
    <Link
      to="/admin/analytics"
      className="block no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-2xl"
    >
      <div
        className="relative rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer h-full"
        style={{
          background: "linear-gradient(145deg,#0c0a09 0%,#1c1917 60%,#292524 100%)",
          boxShadow: "0 8px 36px rgba(12,10,9,0.24)",
          animation: `fadeUp 0.5s ${delay} ease both`,
        }}
      >
        <div
          className="absolute -top-16 -right-10 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(220,38,38,0.22) 0%,transparent 70%)" }}
        />
        <div
          className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(239,68,68,0.1) 0%,transparent 70%)" }}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}
            >
              <IDollar cls="w-4 h-4" />
            </div>
            <span
              className="text-[10px] font-bold tracking-widest rounded-lg px-2.5 py-1 uppercase"
              style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5", border: "1px solid rgba(252,165,165,0.18)" }}
            >
              Doanh thu
            </span>
          </div>

          <div className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            Tổng doanh thu
          </div>
          <div
            className="font-extrabold text-white leading-tight mb-5 font-display tabular-nums"
            style={{ fontSize: "clamp(20px,2.4vw,28px)", letterSpacing: "-0.02em" }}
          >
            {fmtCurrency(value)}
          </div>

          {showPct ? (
            <>
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-out"
                    style={{
                      background: "linear-gradient(90deg,#ef4444,#fb923c)",
                      width: `${Math.min(pct, 100)}%`,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold flex-shrink-0 font-display tabular-nums"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {pct}%
                </span>
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                so với mục tiêu tháng
              </div>
            </>
          ) : (
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Chưa thiết lập mục tiêu tháng
            </div>
          )}
        </div>

        <div
          className="absolute -bottom-6 right-2 text-9xl font-black select-none pointer-events-none z-0"
          style={{ color: "rgba(255,255,255,0.025)", lineHeight: 1 }}
          aria-hidden="true"
        >₫</div>
      </div>
    </Link>
  );
}

/* —————— Activity Row —————— */
function ActRow({ color, text, time, status }) {
  const cfg = status ? STATUS_CFG[status] : null;
  return (
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors min-h-12">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-sm text-gray-700 flex-1 truncate leading-relaxed">{text}</span>
      {cfg && (
        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 border ${cfg.tw}`}>
          {cfg.label}
        </span>
      )}
      <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">{time}</span>
    </div>
  );
}

/* —————— Metric Cell —————— */
function MetricCell({ icon, label, value, color, bg, isCurrency, borderRight, borderBottom, to }) {
  const counted = useCount(isCurrency ? 0 : safe(value));
  const Wrapper = to ? Link : "div";
  const wrapperProps = to ? { to } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`block no-underline p-5 hover:bg-gray-50/60 transition-colors
        ${borderRight ? "md:border-r border-gray-100" : ""}
        ${borderBottom ? "border-b border-gray-100" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
      </div>
      <div
        className="text-2xl sm:text-3xl font-extrabold leading-none tracking-tight font-display tabular-nums"
        style={{ color }}
      >
        {isCurrency ? fmtCurrency(value) : counted.toLocaleString("vi-VN")}
      </div>
    </Wrapper>
  );
}

/* —————— Alert Pill —————— */
function AlertPill({ count, label, activeColor, activeBg, activeBorder, to }) {
  const on = count > 0;
  const className = `flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap text-decoration-none
    ${on ? "hover:scale-105 cursor-pointer" : "bg-gray-50 border-gray-200 cursor-default"}`;
  const style = on ? { background: activeBg, borderColor: activeBorder } : {};

  const content = (
    <>
      <span
        className={`text-sm font-extrabold font-display tabular-nums ${on ? "" : "text-gray-400"}`}
        style={on ? { color: activeColor } : {}}
      >
        {count}
      </span>
      <span className={`text-xs font-medium ${on ? "text-gray-700" : "text-gray-500"}`}>{label}</span>
    </>
  );

  if (on && to) {
    return <Link to={to} className={className} style={style}>{content}</Link>;
  }
  return <div className={className} style={style}>{content}</div>;
}

/* —————— Loading Screen —————— */
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4" role="status" aria-live="polite">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="spin-ring absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: "#dc2626" }} />
        <div className="spin-ring-inner absolute inset-[9px] rounded-full border-2 border-transparent" style={{ borderTopColor: "#fca5a5" }} />
        <div className="w-2.5 h-2.5 rounded-full bg-red-600 absolute" style={{ animation: "corePulse 1.4s ease infinite" }} />
      </div>
      <p className="text-sm text-gray-500 tracking-wider">Đang tải dữ liệu...</p>
    </div>
  );
}

/* —————— Error Screen —————— */
function ErrorScreen({ onRetry, message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 p-8" role="alert">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 text-red-600">
        <IAlert cls="w-6 h-6" />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-lg font-bold text-stone-900 mb-1 font-display">Không thể tải dữ liệu</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {message || "Đã có lỗi xảy ra khi kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại."}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold
          transition-all duration-200 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30"
      >
        <IRefresh cls="w-3.5 h-3.5" />
        Thử lại
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DATA LAYER
════════════════════════════════════════════════════════════ */
async function fetchDashboardData(signal) {
  // ─── Ưu tiên endpoint thống kê tổng hợp (nếu backend có) ───
  // Nếu backend cung cấp /admin/dashboard/stats, dùng cái đó để tránh fetch toàn bộ orders.
  try {
    const { data } = await axiosClient.get("/admin/dashboard/stats", { signal });
    const d = data?.data ?? data;
    if (d && typeof d === "object" && "totalRevenue" in d) {
      return { source: "aggregated", payload: d };
    }
  } catch (err) {
    // Endpoint chưa có → fallback. Bỏ qua lỗi 404, chỉ throw khi bị abort.
    if (err.name === "CanceledError" || err.name === "AbortError") throw err;
  }

  // ─── Fallback: gọi từng endpoint, gộp client-side ───
  const [uR, oR, pR] = await Promise.all([
    axiosClient.get("/users",                   { signal }),
    axiosClient.get("/orders?limit=1000",       { signal }), // ⚠️ giới hạn để tránh quá tải
    axiosClient.get("/products?limit=500",      { signal }),
  ]);

  const users    = toArray(uR.data?.data ?? uR.data);
  const orders   = toArray(oR.data?.data ?? oR.data);
  const products = toArray(pR.data?.data?.data ?? pR.data?.data ?? pR.data);

  const totalProducts = safe(
    pR.data?.data?.meta?.total ??
    pR.data?.data?.total ??
    pR.data?.meta?.total ??
    products.length
  );

  return {
    source: "computed",
    payload: {
      totalUsers:    users.length,
      totalProducts,
      totalOrders:   orders.length,
      totalRevenue:  orders.reduce((s, o) => s + safe(o.totalAmount), 0),
      pending:       orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
      cancelled:     orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
      outOfStock:    products.filter(p => safe(p.stock) === 0).length,
      monthlyTarget: null, // backend nên trả; nếu không thì progress bar sẽ ẩn
      recentOrders:  [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
      recentUsers:   [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2),
    },
  };
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (silent) setRefreshing(true); else setLoading(true);
    setError(null);

    try {
      const result = await fetchDashboardData(ctrl.signal);
      const p = result.payload;

      // Build activities
      const activities = [
        ...(p.recentOrders || []).map(o => ({
          color:  STATUS_CFG[o.status]?.color ?? "#94a3b8",
          text:   (ACTIVITY_TEXT[o.status] ?? ((id) => `Đơn #${id}`))(o.id),
          time:   timeAgo(o.updatedAt || o.createdAt),
          status: o.status,
          key:    `o-${o.id}-${o.status}`,
        })),
        ...(p.recentUsers || []).map(u => ({
          color:  "#8b5cf6",
          text:   `${u.name || u.email || "Người dùng"} vừa đăng ký`,
          time:   timeAgo(u.createdAt),
          status: null,
          key:    `u-${u.id || u.email}`,
        })),
      ].slice(0, 6);

      setData({
        users:      safe(p.totalUsers),
        products:   safe(p.totalProducts),
        orders:     safe(p.totalOrders),
        revenue:    safe(p.totalRevenue),
        pending:    safe(p.pending),
        cancelled:  safe(p.cancelled),
        outStock:   safe(p.outOfStock),
        target:     safe(p.monthlyTarget),
        activities,
      });
    } catch (e) {
      if (e.name === "CanceledError" || e.name === "AbortError") return;
      console.error("[Dashboard] load failed:", e);
      setError(e?.response?.data?.message || e?.message || "Lỗi không xác định");
    } finally {
      if (!ctrl.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const user = useCurrentUser();
  const { greet, name, dateStr } = useMemo(() => {
    const now = new Date();
    return {
      greet:   getGreeting(now.getHours()),
      name:    user?.name || user?.email?.split("@")[0] || "Admin",
      dateStr: formatDate(now),
    };
  }, [user]);

  /* ── Render branches ─────────────────────────────── */
  if (loading) {
    return (
      <>
        <style>{ANIM_CSS}</style>
        <LoadingScreen />
      </>
    );
  }

  if (error && !data) {
    return (
      <>
        <style>{ANIM_CSS}</style>
        <ErrorScreen onRetry={() => load()} message={error} />
      </>
    );
  }

  const stats = data;
  const systemHealthy = !error;

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div className="w-full max-w-screen-xl font-sans mx-auto">

        {/* ═══════════ HERO ═══════════ */}
        <div
          className="relative bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm mb-4 overflow-hidden"
          style={{ animation: "fadeUp 0.4s ease both" }}
        >
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
            style={{
              backgroundImage: "radial-gradient(circle,rgba(220,38,38,0.04) 1px,transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            {/* LEFT */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${systemHealthy ? "bg-emerald-400" : "bg-red-400"}`}
                  style={{
                    boxShadow: systemHealthy
                      ? "0 0 0 3px rgba(34,197,94,0.2)"
                      : "0 0 0 3px rgba(239,68,68,0.2)",
                    animation: "livePulse 2s ease infinite",
                  }}
                />
                <span className="text-[11px] text-gray-500 font-medium tracking-wide">{dateStr}</span>
                <span className="text-gray-300">·</span>
                {systemHealthy ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full tracking-wide">
                    Hệ thống đang hoạt động
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full tracking-wide">
                    Có lỗi xảy ra
                  </span>
                )}
              </div>

              <h1 className="m-0 mb-2 leading-tight font-display">
                <span className="block text-sm font-normal text-gray-500 mb-0.5">{greet},</span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight italic leading-none">
                  {name}
                </span>
                <span className="text-2xl sm:text-3xl ml-2 align-middle">👋</span>
              </h1>
              <p className="text-sm text-gray-500 m-0 leading-relaxed">
                Tổng quan hệ thống admin — cập nhật theo thời gian thực
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-stretch lg:items-end gap-3 flex-shrink-0">
              <div className="flex flex-wrap lg:justify-end gap-2">
                <AlertPill
                  count={stats.pending} label="chờ duyệt"
                  activeColor="#b45309" activeBg="#fffbeb" activeBorder="#fcd34d"
                  to="/admin/orders?status=pending"
                />
                <AlertPill
                  count={stats.outStock} label="hết hàng"
                  activeColor="#7c3aed" activeBg="#f5f3ff" activeBorder="#c4b5fd"
                  to="/admin/products?stock=0"
                />
                <AlertPill
                  count={stats.cancelled} label="đã hủy"
                  activeColor="#b91c1c" activeBg="#fef2f2" activeBorder="#fca5a5"
                  to="/admin/orders?status=cancelled"
                />
              </div>

              <button
                onClick={() => load({ silent: true })}
                disabled={refreshing}
                aria-label="Làm mới dữ liệu"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold border-none cursor-pointer
                  transition-all duration-200 tracking-wide whitespace-nowrap
                  hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                <span className={refreshing ? "spin-icon inline-flex" : "inline-flex"}>
                  <IRefresh cls="w-3.5 h-3.5" />
                </span>
                {refreshing ? "Đang tải..." : "Làm mới"}
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════ STAT CARDS ═══════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <RevenueCard value={stats.revenue} target={stats.target} delay="0s" />
          <StatCard
            icon={<IOrder cls="w-4 h-4"/>} label="Đơn hàng" sub="Tổng đơn hàng"
            value={stats.orders} color="#dc2626" bgColor="rgba(220,38,38,0.08)"
            delay="0.07s" to="/admin/orders"
          />
          <StatCard
            icon={<IUsers cls="w-4 h-4"/>} label="Người dùng" sub="Tổng tài khoản"
            value={stats.users} color="#6366f1" bgColor="rgba(99,102,241,0.1)"
            delay="0.14s" to="/admin/users"
          />
          <StatCard
            icon={<IBox cls="w-4 h-4"/>} label="Sản phẩm" sub="Đang kinh doanh"
            value={stats.products} color="#f59e0b" bgColor="rgba(245,158,11,0.1)"
            delay="0.21s" to="/admin/products"
          />
        </div>

        {/* ═══════════ PANELS ═══════════ */}
        <div className="flex flex-col lg:flex-row gap-3">

          {/* Activity */}
          <section
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-[1.6] min-w-0 hover:shadow-md transition-shadow duration-200"
            style={{ animation: "fadeUp 0.5s 0.28s ease both" }}
            aria-label="Hoạt động gần đây"
          >
            <header className="flex justify-between items-center px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-600 flex-shrink-0">
                  <IActivity cls="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-stone-900 font-display truncate">Hoạt động gần đây</div>
                  <div className="text-[11.5px] text-gray-500 mt-0.5 tabular-nums">
                    {stats.activities.length} sự kiện mới nhất
                  </div>
                </div>
              </div>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1.5 text-xs text-red-600 no-underline font-bold tracking-wide hover:gap-2.5 hover:text-red-700 transition-all flex-shrink-0"
              >
                Xem tất cả <IArrow cls="w-3 h-3" />
              </Link>
            </header>
            <div>
              {stats.activities.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-sm text-gray-400 mb-1">Chưa có hoạt động nào</div>
                  <div className="text-xs text-gray-300">Hoạt động mới sẽ xuất hiện tại đây</div>
                </div>
              ) : (
                stats.activities.map((a) => <ActRow key={a.key} {...a} />)
              )}
            </div>
          </section>

          {/* Metrics */}
          <section
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 min-w-0 hover:shadow-md transition-shadow duration-200"
            style={{ animation: "fadeUp 0.5s 0.35s ease both" }}
            aria-label="Chỉ số quan trọng"
          >
            <header className="flex justify-between items-center px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 flex-shrink-0">
                  <IGrid cls="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-stone-900 font-display truncate">Chỉ số quan trọng</div>
                  <div className="text-[11.5px] text-gray-500 mt-0.5">Cần theo dõi thường xuyên</div>
                </div>
              </div>
              <Link
                to="/admin/analytics"
                className="flex items-center gap-1.5 text-xs text-red-600 no-underline font-bold tracking-wide hover:gap-2.5 hover:text-red-700 transition-all flex-shrink-0"
              >
                Thống kê <IArrow cls="w-3 h-3" />
              </Link>
            </header>
            <div className="grid grid-cols-2">
              <MetricCell
                icon={<IDollar cls="w-3.5 h-3.5"/>} label="Doanh thu"
                value={stats.revenue} color="#dc2626" bg="#fef2f2"
                isCurrency borderRight borderBottom
                to="/admin/analytics"
              />
              <MetricCell
                icon={<IClock cls="w-3.5 h-3.5"/>} label="Chờ duyệt"
                value={stats.pending} color="#d97706" bg="#fffbeb"
                borderBottom
                to="/admin/orders?status=pending"
              />
              <MetricCell
                icon={<IEmpty cls="w-3.5 h-3.5"/>} label="Hết hàng"
                value={stats.outStock} color="#6366f1" bg="#eef2ff"
                borderRight
                to="/admin/products?stock=0"
              />
              <MetricCell
                icon={<IXCircle cls="w-3.5 h-3.5"/>} label="Đã hủy"
                value={stats.cancelled} color="#64748b" bg="#f1f5f9"
                to="/admin/orders?status=cancelled"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   ANIMATION CSS
   ⚠️ Khuyến nghị: chuyển khối này lên file CSS global (index.css)
   để tránh inject lặp và để Tailwind/PostCSS xử lý đúng cách.
════════════════════════════════════════════════════════════ */
const ANIM_CSS = `
  .font-display { font-family:'Sora','Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif; }
  .font-sans    { font-family:'DM Sans',ui-sans-serif,system-ui,sans-serif; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes livePulse { 0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,0.2)} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
  @keyframes corePulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.4)} 50%{box-shadow:0 0 0 6px rgba(220,38,38,0)} }
  @keyframes spin      { to{transform:rotate(360deg)} }

  .spin-ring       { animation:spin 0.85s linear infinite; }
  .spin-ring-inner { animation:spin 0.55s linear infinite reverse; }
  .spin-icon       { animation:spin 0.65s linear infinite; }

  @media (prefers-reduced-motion: reduce) {
    .spin-ring, .spin-ring-inner, .spin-icon { animation: none; }
    [style*="animation"] { animation: none !important; }
  }
`;