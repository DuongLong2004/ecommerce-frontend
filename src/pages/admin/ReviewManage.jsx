import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axiosClient from "../../api/axios";
import {
  Search, Trash2, Send, Check, AlertCircle, Menu, X,
  ChevronRight, Edit3, MessageSquare, Download, RefreshCw,
  ArrowUpDown, CheckCircle2, Bell, Star, Package,
  Clock, Zap
} from "lucide-react";

/* ══════════════════════════════════════════
   UTILS
══════════════════════════════════════════ */
const timeAgo = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(d).toLocaleDateString("vi-VN");
};

/* ══════════════════════════════════════════
   STARS
══════════════════════════════════════════ */
const Stars = ({ rating, size = "sm" }) => {
  const sz = size === "sm" ? 12 : 14;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={sz} height={sz} viewBox="0 0 24 24"
          fill={i <= rating ? "#F59E0B" : "none"}
          stroke={i <= rating ? "#F59E0B" : "#D1D5DB"}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
};

/* ══════════════════════════════════════════
   AVATAR
══════════════════════════════════════════ */
const PALETTES = [
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-rose-100",   text: "text-rose-700" },
  { bg: "bg-emerald-100",text: "text-emerald-700" },
  { bg: "bg-amber-100",  text: "text-amber-700" },
  { bg: "bg-sky-100",    text: "text-sky-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
];
const Avatar = ({ name, size = "md" }) => {
  const pal = PALETTES[(name?.charCodeAt(0) || 0) % PALETTES.length];
  const sizeClass = size === "md" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  return (
    <div className={`${sizeClass} ${pal.bg} ${pal.text} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none`}>
      {name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
};

/* ══════════════════════════════════════════
   RATING BADGE
══════════════════════════════════════════ */
const ratingConfig = {
  1: { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400",    border: "border-red-200" },
  2: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", border: "border-orange-200" },
  3: { bg: "bg-yellow-50", text: "text-yellow-600", dot: "bg-yellow-400", border: "border-yellow-200" },
  4: { bg: "bg-green-50",  text: "text-green-600",  dot: "bg-green-400",  border: "border-green-200" },
  5: { bg: "bg-emerald-50",text: "text-emerald-600",dot: "bg-emerald-400",border: "border-emerald-200" },
};
const RatingBadge = ({ rating }) => {
  const c = ratingConfig[rating] || ratingConfig[3];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {rating}/5
    </span>
  );
};

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
const Toast = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id}
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold
          animate-[slideIn_0.25s_ease] backdrop-blur-sm
          ${t.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"}`}>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
          ${t.type === "success" ? "bg-emerald-200" : "bg-red-200"}`}>
          {t.type === "success"
            ? <Check size={11} strokeWidth={2.5} />
            : <AlertCircle size={11} strokeWidth={2.5} />}
        </span>
        {t.msg}
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════ */
const ConfirmDialog = ({ open, msg, onOk, onCancel }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl animate-[scaleIn_0.2s_ease]">
        <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 text-red-500">
          <Trash2 size={18} />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{msg}</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={onOk}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors flex items-center gap-1.5">
            <Trash2 size={13} /> Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════ */
const StatCard = ({ label, value, sub, icon: Icon, accent = "indigo", urgent }) => {
  const accents = {
    indigo:  { icon: "bg-indigo-50 text-indigo-500",  value: "text-indigo-600" },
    amber:   { icon: "bg-amber-50 text-amber-500",    value: "text-amber-600" },
    emerald: { icon: "bg-emerald-50 text-emerald-500",value: "text-emerald-600" },
    red:     { icon: "bg-red-50 text-red-500",        value: "text-red-600" },
    gray:    { icon: "bg-gray-100 text-gray-400",     value: "text-gray-400" },
  };
  const a = accents[urgent ? "red" : accent] || accents.indigo;
  return (
    <div className={`bg-white rounded-2xl border p-5 flex flex-col gap-1 flex-1 min-w-[130px] transition-all duration-200 hover:shadow-md
      ${urgent ? "border-red-200 shadow-red-50 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.icon}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <span className={`text-3xl font-black tracking-tight leading-none ${a.value}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  );
};

/* ══════════════════════════════════════════
   REVIEW CARD
══════════════════════════════════════════ */
const ReviewCard = ({ rv, onReply, onDelete, idx }) => {
  const [open,  setOpen]  = useState(false);
  const [text,  setText]  = useState("");
  const [busy,  setBusy]  = useState(false);
  const taRef = useRef(null);
  const hasReply = !!rv.reply;

  const openBox = () => {
    setText(rv.reply || "");
    setOpen(true);
    setTimeout(() => taRef.current?.focus(), 60);
  };

  const send = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    const ok = await onReply(rv.id, text.trim());
    setBusy(false);
    if (ok) setOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar name={rv.User?.name} size="md" />
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{rv.User?.name || "Ẩn danh"}</p>
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={rv.rating} />
              <RatingBadge rating={rv.rating} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">{timeAgo(rv.createdAt)}</span>
          {hasReply ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check size={9} strokeWidth={3} /> Đã phản hồi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
              <Clock size={9} strokeWidth={2.5} /> Chờ phản hồi
            </span>
          )}
          <button onClick={() => onDelete(rv.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
            title="Xóa đánh giá">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Comment */}
      {rv.comment && (
        <div className="mx-5 mb-4 px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100 border-l-4 border-l-gray-300">
          <p className="italic">"{rv.comment}"</p>
        </div>
      )}

      {/* Shop Reply (rv.reply) */}
      {hasReply && (
        <div className="mx-5 mb-4 px-4 py-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 border-l-4 border-l-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              Phản hồi shop
            </span>
            <span className="text-[10px] text-blue-300">{timeAgo(rv.replyAt ?? rv.updatedAt)}</span>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">{rv.reply}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 pb-4">
        {!open ? (
          <button onClick={openBox}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150
              border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
            {hasReply ? <><Edit3 size={12} /> Chỉnh sửa phản hồi</> : <><MessageSquare size={12} /> Phản hồi khách hàng</>}
          </button>
        ) : (
          <div className="animate-[slideUp_0.2s_ease]">
            <textarea
              ref={taRef}
              rows={3}
              placeholder={hasReply ? "Cập nhật phản hồi..." : "Viết phản hồi cho khách hàng..."}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
                if (e.key === "Escape") { setOpen(false); setText(""); }
              }}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400
                focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                resize-none transition-all duration-150 mb-2.5 leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Ctrl+Enter gửi · Esc hủy</span>
              <div className="flex gap-2">
                <button onClick={() => { setOpen(false); setText(""); }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button onClick={send} disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white transition-colors">
                  {busy
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send size={11} />}
                  {hasReply ? "Cập nhật" : "Gửi"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function ReviewManage() {
  const [products,        setProducts]        = useState([]);
  const [searchProd,      setSearchProd]      = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews,         setReviews]         = useState([]);
  const [filterRating,    setFilterRating]    = useState(0);
  const [filterReply,     setFilterReply]     = useState("all");
  const [sortBy,          setSortBy]          = useState("newest");
  const [loading,         setLoading]         = useState(false);
  const [toasts,          setToasts]          = useState([]);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [selectedIds,     setSelectedIds]     = useState(new Set());
  const [confirm,         setConfirm]         = useState({ open: false, id: null, bulk: false });
  const [prodLoading,     setProdLoading]     = useState(true);
  const [pendingMap,      setPendingMap]      = useState({});
  const [filterHasReview, setFilterHasReview] = useState(false);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  /* Load products + pending counts */
  useEffect(() => {
    setProdLoading(true);
    axiosClient.get("/products?limit=200")
      .then(async res => {
        const list = res.data.data.data || [];
        setProducts(list);
        const settled = await Promise.allSettled(
          list.map(p => axiosClient.get(`/products/${p.id}/reviews?limit=100`))
        );
        const map = {};
        settled.forEach((r, i) => {
          if (r.status === "fulfilled") {
            const rvs = r.value.data.data?.reviews || [];
            const cnt = rvs.filter(rv => !rv.reply).length;
            if (cnt > 0) map[list[i].id] = cnt;
          }
        });
        setPendingMap(map);
      })
      .catch(() => toast("Không thể tải sản phẩm", "error"))
      .finally(() => setProdLoading(false));
  }, []);

  const filteredProds = useMemo(() => {
    let list = products;
    if (filterHasReview) list = list.filter(p => pendingMap[p.id] > 0);
    const q = searchProd.toLowerCase();
    if (q) list = list.filter(p => p.title?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    return [...list].sort((a, b) => (pendingMap[b.id] || 0) - (pendingMap[a.id] || 0));
  }, [searchProd, products, filterHasReview, pendingMap]);

  const loadReviews = useCallback(async (product, { silent = false, resetFilters = false } = {}) => {
    setSelectedProduct(product);
    setSidebarOpen(false);
    if (resetFilters) { setFilterRating(0); setFilterReply("all"); setSortBy("newest"); setSelectedIds(new Set()); }
    if (!silent) setLoading(true);
    try {
      const res = await axiosClient.get(`/products/${product.id}/reviews?limit=100`);
      const list = res.data.data?.reviews || [];
      setReviews(list);
      const cnt = list.filter(rv => !rv.reply).length;
      setPendingMap(prev => ({ ...prev, [product.id]: cnt || undefined }));
    } catch {
      if (!silent) toast("Không thể tải đánh giá", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  /* Reply — optimistic update */
  const handleReply = useCallback(async (reviewId, text) => {
    if (!text?.trim()) { toast("Vui lòng nhập nội dung!", "error"); return false; }
    const productId = selectedProduct?.id;
    if (!productId) return false;
    const now = new Date().toISOString();
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: text, replyAt: now } : r));
    try {
      await axiosClient.patch(`/products/${productId}/reviews/${reviewId}/reply`, { reply: text });
      toast("Phản hồi đã được gửi!");
      setPendingMap(prev => {
        const n = Math.max(0, (prev[productId] || 0) - 1);
        return { ...prev, [productId]: n || undefined };
      });
      return true;
    } catch (err) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: undefined, replyAt: undefined } : r));
      toast(err.response?.data?.message || "Gửi thất bại!", "error");
      return false;
    }
  }, [selectedProduct, toast]);

  /* Delete */
  const handleDelete = useCallback((reviewId) => setConfirm({ open: true, id: reviewId, bulk: false }), []);
  const confirmDelete = useCallback(async () => {
    const { id, bulk } = confirm;
    const ids = bulk ? [...selectedIds] : [id];
    setConfirm({ open: false, id: null, bulk: false });
    try {
      await Promise.all(ids.map(rid => axiosClient.delete(`/products/${selectedProduct.id}/reviews/${rid}`)));
      setReviews(prev => prev.filter(r => !ids.includes(r.id)));
      setSelectedIds(new Set());
      toast(bulk ? `Đã xóa ${ids.length} đánh giá!` : "Đã xóa đánh giá!");
    } catch {
      toast("Xóa thất bại!", "error");
      if (selectedProduct) loadReviews(selectedProduct);
    }
  }, [confirm, selectedIds, selectedProduct, loadReviews, toast]);

  const handleBulkDelete = () => selectedIds.size > 0 && setConfirm({ open: true, id: null, bulk: true });

  const toggleSelect = id => setSelectedIds(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleAll = () => {
    if (selectedIds.size === displayedReviews.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(displayedReviews.map(r => r.id)));
  };

  /* Export CSV */
  const handleExport = () => {
    if (!reviews.length) return;
    const headers = ["ID","Người dùng","Điểm","Bình luận","Phản hồi shop","Ngày tạo"];
    const rows = reviews.map(r => [
      r.id, r.User?.name || "Ẩn danh", r.rating,
      `"${(r.comment || "").replace(/"/g, '""')}"`,
      `"${(r.reply || "").replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleDateString("vi-VN"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `reviews-${selectedProduct?.title || "export"}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast("Đã xuất CSV!");
  };

  /* Stats */
  const avgRating    = useMemo(() => reviews.length ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0, [reviews]);
  const replied      = useMemo(() => reviews.filter(r => r.reply).length, [reviews]);
  const pending      = reviews.length - replied;
  const replyRate    = reviews.length ? Math.round(replied / reviews.length * 100) : 0;
  const totalPending = useMemo(() => Object.values(pendingMap).reduce((s, v) => s + (v || 0), 0), [pendingMap]);

  const dist = useMemo(() => [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length ? Math.round(reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0,
  })), [reviews]);

  /* Filter + sort reviews */
  const displayedReviews = useMemo(() => {
    let list = reviews;
    if (filterRating) list = list.filter(r => r.rating === filterRating);
    if (filterReply === "replied") list = list.filter(r =>  r.reply);
    if (filterReply === "pending") list = list.filter(r => !r.reply);
    switch (sortBy) {
      case "newest":  list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case "oldest":  list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case "highest": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "lowest":  list = [...list].sort((a, b) => a.rating - b.rating); break;
    }
    return list;
  }, [reviews, filterRating, filterReply, sortBy]);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes cardIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .rv-card-in { animation: cardIn 0.3s ease both; }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 99px; }
        .bl-3 { border-left-width: 3px; }
        .bl-4 { border-left-width: 4px; }
      `}</style>

      <Toast toasts={toasts} />
      <ConfirmDialog
        open={confirm.open}
        msg={confirm.bulk
          ? `Bạn chắc chắn muốn xóa ${selectedIds.size} đánh giá? Thao tác này không thể hoàn tác.`
          : "Bạn chắc chắn muốn xóa đánh giá này? Thao tác này không thể hoàn tác."}
        onOk={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null, bulk: false })}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen bg-[#F8F9FB]">

        {/* ══ SIDEBAR ══ */}
        <aside className={`
          w-72 bg-white border-r border-gray-100 flex flex-col
          fixed lg:sticky top-0 h-screen z-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          shadow-xl lg:shadow-none
        `}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Sản phẩm</span>
                {totalPending > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                    {totalPending}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{filteredProds.length}/{products.length} sản phẩm</p>
            </div>
            <button onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Search + Filter */}
          <div className="px-4 py-3 border-b border-gray-50 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                placeholder="Tìm sản phẩm..."
                value={searchProd}
                onChange={e => setSearchProd(e.target.value)}
                className="flex-1 text-[13px] bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {searchProd && (
                <button onClick={() => setSearchProd("")} className="text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilterHasReview(v => !v)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all
                ${filterHasReview
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-white border-gray-200 text-gray-500 hover:border-amber-200 hover:text-amber-600"}`}>
              <Bell size={12} />
              {filterHasReview ? "Tất cả sản phẩm" : "Chỉ chờ phản hồi"}
            </button>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto sidebar-scroll py-2">
            {prodLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : filteredProds.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 px-6 text-gray-400">
                <Package size={32} strokeWidth={1} />
                <p className="text-xs text-center">
                  {filterHasReview ? "Không có sản phẩm chờ phản hồi" : "Không tìm thấy sản phẩm"}
                </p>
              </div>
            ) : filteredProds.map(p => {
              const active = selectedProduct?.id === p.id;
              const pend   = pendingMap[p.id] || 0;
              return (
                <div key={p.id}
                  onClick={() => loadReviews(p, { resetFilters: true })}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-l-2 transition-all duration-150
                    ${active
                      ? "bg-indigo-50 border-l-indigo-500"
                      : "border-l-transparent hover:bg-gray-50"}`}>
                  <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {p.img
                      ? <img src={p.img} alt="" className="w-full h-full object-contain p-1" onError={e => { e.target.style.display = "none"; }} />
                      : <Package size={14} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12.5px] font-semibold truncate ${active ? "text-indigo-700" : "text-gray-800"}`}>{p.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{p.brand}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {pend > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {pend}
                      </span>
                    )}
                    {active && <ChevronRight size={12} className="text-indigo-400" strokeWidth={2.5} />}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main className="flex-1 min-w-0 flex flex-col gap-5 p-6 lg:p-8 overflow-x-hidden">

          {/* Topbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <Menu size={16} />
              </button>
              <div>
                <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mb-1">
                  <span>Quản trị</span>
                  <ChevronRight size={11} />
                  <span>Đánh giá</span>
                  {selectedProduct && (
                    <>
                      <ChevronRight size={11} />
                      <span className="text-gray-700 font-semibold truncate max-w-[200px]">{selectedProduct.title}</span>
                    </>
                  )}
                </nav>
                <h1 className="text-xl font-black text-gray-900 tracking-tight truncate max-w-[55vw]">
                  {selectedProduct ? selectedProduct.title : "Quản lý đánh giá"}
                </h1>
              </div>
            </div>
            {selectedProduct && (
              <div className="flex items-center gap-2">
                <button onClick={() => loadReviews(selectedProduct)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all shadow-sm"
                  title="Làm mới">
                  <RefreshCw size={14} />
                </button>
                <button onClick={handleExport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-all shadow-sm">
                  <Download size={14} /> Xuất CSV
                </button>
              </div>
            )}
          </div>

          {/* States */}
          {!selectedProduct ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                  <Star size={36} className="text-indigo-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Chọn sản phẩm để xem đánh giá</h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">
                  {totalPending > 0
                    ? `⚡ ${totalPending} đánh giá đang chờ phản hồi trên ${Object.keys(pendingMap).length} sản phẩm`
                    : "Danh sách sản phẩm ở thanh bên trái"}
                </p>
                <button onClick={() => setSidebarOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
                  <Menu size={15} /> Xem sản phẩm
                </button>
              </div>
            </div>

          ) : loading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4">
              <div className="w-10 h-10 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Đang tải đánh giá...</p>
            </div>

          ) : (
            <>
              {/* Stats */}
              <div className="flex gap-3 flex-wrap">
                <StatCard label="Tổng đánh giá"  value={reviews.length}       icon={MessageSquare} accent="indigo" />
                <StatCard label="Điểm TB"         value={avgRating || "—"}     sub={reviews.length ? `${reviews.length} lượt đánh giá` : undefined} icon={Star} accent="amber" />
                <StatCard label="Đã phản hồi"     value={replied}              sub={`Tỷ lệ ${replyRate}%`} icon={CheckCircle2} accent="emerald" />
                <StatCard label="Chờ phản hồi"    value={pending}              sub={pending > 0 ? "Cần xử lý ngay" : "Hoàn thành 🎉"} icon={Zap} accent={pending > 0 ? "red" : "gray"} urgent={pending > 0} />
              </div>

              {/* Rating Overview */}
              {reviews.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{avgRating}</span>
                    <div>
                      <Stars rating={Math.round(avgRating)} size="lg" />
                      <p className="text-xs text-gray-400 mt-1.5">{reviews.length} đánh giá</p>
                    </div>
                  </div>
                  <div className="w-px h-14 bg-gray-100 flex-shrink-0 hidden sm:block" />
                  <div className="flex-1 min-w-[160px] flex flex-col gap-1.5">
                    {dist.map(d => (
                      <button key={d.star}
                        onClick={() => setFilterRating(filterRating === d.star ? 0 : d.star)}
                        className={`flex items-center gap-2.5 py-1 px-2 rounded-lg transition-colors ${filterRating === d.star ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                        <span className="text-[11px] font-bold text-gray-500 w-5 text-left">{d.star}★</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${d.star >= 4 ? "bg-emerald-400" : d.star === 3 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${d.pct}%`, minWidth: d.count ? 4 : 0 }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 w-5 text-right">{d.count}</span>
                      </button>
                    ))}
                  </div>
                  {filterRating > 0 && (
                    <button onClick={() => setFilterRating(0)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                      <X size={11} /> {filterRating}★
                    </button>
                  )}
                </div>
              )}

              {/* Toolbar */}
              {reviews.length > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer text-[12.5px] font-medium text-gray-500 select-none">
                      <input type="checkbox"
                        checked={selectedIds.size === displayedReviews.length && displayedReviews.length > 0}
                        onChange={toggleAll}
                        className="w-3.5 h-3.5 accent-gray-800 cursor-pointer"
                      />
                      {selectedIds.size > 0 ? `${selectedIds.size} đã chọn` : "Chọn tất cả"}
                    </label>
                    {selectedIds.size > 0 && (
                      <button onClick={handleBulkDelete}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                        <Trash2 size={12} /> Xóa {selectedIds.size}
                      </button>
                    )}
                    {/* Segmented Filter */}
                    <div className="flex bg-gray-100 p-1 rounded-xl gap-0.5">
                      {[["all","Tất cả"], ["pending","Chờ phản hồi"], ["replied","Đã phản hồi"]].map(([v, l]) => (
                        <button key={v}
                          onClick={() => setFilterReply(v)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${filterReply === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                          {l}
                          {v === "pending" && pending > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{pending}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <ArrowUpDown size={11} /> Sắp xếp:
                    </span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none bg-white cursor-pointer hover:border-gray-300 transition-colors">
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="highest">Điểm cao</option>
                      <option value="lowest">Điểm thấp</option>
                    </select>
                    <span className="text-xs text-gray-400">{displayedReviews.length} kết quả</span>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {displayedReviews.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <MessageSquare size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-500">
                    {filterReply === "pending" ? "Tuyệt vời! Tất cả đã được phản hồi 🎉" :
                     filterReply === "replied" ? "Chưa có đánh giá nào được phản hồi" :
                     filterRating > 0 ? `Không có đánh giá ${filterRating} sao` :
                     "Chưa có đánh giá nào"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {displayedReviews.map((rv, idx) => (
                    <div key={rv.id}
                      className="flex items-start gap-3 rv-card-in"
                      style={{ animationDelay: `${idx * 0.04}s` }}>
                      <div className="pt-[18px] flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(rv.id)}
                          onChange={() => toggleSelect(rv.id)}
                          className="w-3.5 h-3.5 accent-gray-800 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <ReviewCard rv={rv} onReply={handleReply} onDelete={handleDelete} idx={idx} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}