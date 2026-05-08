import { useEffect, useState, useMemo, useRef } from "react";
import axiosClient from "../../api/axios";
import PlacementManage from "./PlacementManage";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtVND  = (v) => (!v && v !== 0) ? "—" : Number(v).toLocaleString("vi-VN") + "₫";
const fmtDate = (iso) => new Date(iso).toLocaleDateString("vi-VN");

/* ─────────────────────────────────────────────
   ICONS (Lucide-style SVG)
───────────────────────────────────────────── */
const Ic = ({ d, s = 16, sw = 1.8 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IPlus     = () => <Ic d="M12 5v14M5 12h14" sw={2.5} />;
const ISearch   = () => <Ic d={["M11 11a8 8 0 1 0 0-16 8 8 0 0 0 0 16z","m21 21-4.35-4.35"]} />;
const IEdit     = () => <Ic d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"]} s={14} />;
const ITrash    = () => <Ic d={["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"]} s={14} />;
const IClose    = () => <Ic d="M18 6 6 18M6 6l12 12" sw={2.5} />;
const IUpload   = () => <Ic d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} s={15} />;
const IDownload = () => <Ic d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} s={15} />;
const IChevL    = () => <Ic d="M15 18l-6-6 6-6" s={15} />;
const IChevR    = () => <Ic d="M9 18l6-6-6-6" s={15} />;
const IFilter   = () => <Ic d={["M22 3H2l8 9.46V19l4 2v-8.54z"]} s={14} />;
const ISort     = () => <Ic d={["M4 6h16M4 12h10M4 18h4"]} s={14} />;
const IEye      = () => <Ic d={["M1 12s4-8 11-8 11 8 11 8","M1 12s4 8 11 8 11-8 11-8","M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0"]} s={14} />;
const ICheck    = () => <Ic d="M20 6 9 17l-5-5" sw={2.5} s={12} />;
const IWarn     = () => <Ic d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"]} s={12} />;
const ISave     = () => <Ic d={["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z","M17 21V13H7v8","M7 3v5h8"]} s={15} />;
const IPin      = () => <Ic d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z","M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0"]} s={14} />;
const IBox      = () => <Ic d={["M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z","M3.27 6.96 12 12.01l8.73-5.05","M12 22.08V12"]} s={14} />;
const ITag      = () => <Ic d={["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z","M7 7h.01"]} s={14} />;
const ITrend    = () => <Ic d={["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"]} s={14} />;

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const EMPTY_FORM = {
  brand:"", title:"", sku:"", img:"", price:"", oldPrice:"",
  discount:"", category:"phone", nation:"", display:"",
  screenTech:"", ram:"", rom:"", chip:"", camera:"",
  battery:"", charging:"", description:"", stock:50, sold:0, status:"active",
};

const SPEC_FIELDS = [
  { name:"display",    label:"Màn hình",      placeholder:"6.9 inches"       },
  { name:"screenTech", label:"Công nghệ màn", placeholder:"Super Retina XDR" },
  { name:"ram",        label:"RAM",           placeholder:"8 GB"             },
  { name:"rom",        label:"Bộ nhớ trong",  placeholder:"256 GB"           },
  { name:"chip",       label:"Chip",          placeholder:"A18 Pro"          },
  { name:"camera",     label:"Camera",        placeholder:"48MP + 12MP"      },
  { name:"battery",    label:"Pin",           placeholder:"4670 mAh"         },
  { name:"charging",   label:"Sạc",           placeholder:"Sạc nhanh 30W"    },
];

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function Toast({ toasts }) {
  const typeStyles = {
    success: "bg-emerald-50 border border-emerald-200 text-emerald-800",
    error:   "bg-red-50 border border-red-200 text-red-700",
    info:    "bg-blue-50 border border-blue-200 text-blue-700",
  };
  const dotStyles = {
    success: "bg-emerald-500",
    error:   "bg-red-500",
    info:    "bg-blue-500",
  };
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[220px] animate-[slideIn_0.2s_ease] pointer-events-auto ${typeStyles[t.type] || typeStyles.info}`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyles[t.type] || dotStyles.info}`} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(!active); }}
      title={active ? "Đang bán — click để ẩn" : "Đang ẩn — click để bán"}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${active ? "bg-violet-600" : "bg-slate-200"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${active ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:     { label:"Đang bán", cls:"bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
    outofstock: { label:"Hết hàng", cls:"bg-red-50 text-red-600 ring-1 ring-red-200" },
    draft:      { label:"Bản nháp", cls:"bg-slate-100 text-slate-500 ring-1 ring-slate-200" },
  };
  const { label, cls } = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

/* ── Side Drawer ── */
function Drawer({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-250 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 bottom-0 w-[480px] max-w-full z-[1001] bg-white shadow-2xl flex flex-col transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Head */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold text-violet-600 tracking-widest uppercase mb-1">{subtitle}</p>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-150"
            title="Đóng (Esc)"
          >
            <IClose />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          {children}
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex-shrink-0">
          {footer}
        </div>
      </div>
    </>
  );
}

/* ── Form helpers ── */
function FormSection({ label }) {
  return (
    <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase pt-2 pb-2 border-b border-slate-100 mt-1 mb-1">
      {label}
    </div>
  );
}

function FormField({ label, children, full }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "col-span-2" : ""}`}>
      <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{label}</label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function ProductManage() {
  /* ── State ── */
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [activeTab,   setActiveTab]   = useState("products");
  const [statusTab,   setStatusTab]   = useState("all");
  const [filterCat,   setFilterCat]   = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortBy,      setSortBy]      = useState("createdAt_desc");
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [selected,    setSelected]    = useState(new Set());
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(20);
  const [toasts,      setToasts]      = useState([]);
  const toastId = useRef(0);

  /* ── Toast helper ── */
  const showToast = (msg, type = "success") => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  };

  /* ── Fetch products ── */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/products?limit=200");
      setProducts(res.data.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể tải danh sách sản phẩm!", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchProducts(); }, []);

  /* ── Derived data ── */
  const brands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    if (statusTab !== "all") list = list.filter(p => p.status === statusTab);
    if (filterCat !== "all") list = list.filter(p => p.category === filterCat);
    if (filterBrand !== "all") list = list.filter(p => p.brand === filterBrand);
    if (filterPrice !== "all") {
      const ranges = { "0-5m":[0,5e6], "5-15m":[5e6,15e6], "15-30m":[15e6,30e6], "30m+":[30e6,Infinity] };
      const [lo, hi] = ranges[filterPrice];
      list = list.filter(p => Number(p.price) >= lo && Number(p.price) < hi);
    }
    const [field, dir] = sortBy.split("_");
    list.sort((a, b) => {
      const va = field === "createdAt" ? new Date(a[field]) : (Number(a[field]) || 0);
      const vb = field === "createdAt" ? new Date(b[field]) : (Number(b[field]) || 0);
      return dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [products, search, statusTab, filterCat, filterBrand, filterPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, statusTab, filterCat, filterBrand, filterPrice, sortBy, pageSize]);

  const counts = useMemo(() => ({
    all:        products.length,
    active:     products.filter(p => p.status === "active").length,
    outofstock: products.filter(p => p.status === "outofstock").length,
    draft:      products.filter(p => p.status === "draft").length,
  }), [products]);

  /* ── Selection ── */
  const allOnPage    = paginated.length > 0 && paginated.every(p => selected.has(p.id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allOnPage) {
      setSelected(s => { const n = new Set(s); paginated.forEach(p => n.delete(p.id)); return n; });
    } else {
      setSelected(s => { const n = new Set(s); paginated.forEach(p => n.add(p.id)); return n; });
    }
  };
  const toggleOne = (id) => setSelected(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  /* ── Toggle status (optimistic) ── */
  const toggleStatus = async (p) => {
    const next = p.status === "active" ? "draft" : "active";
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, status: next } : x));
    try {
      await axiosClient.put(`/products/${p.id}`, { ...p, status: next });
    } catch {
      setProducts(ps => ps.map(x => x.id === p.id ? { ...x, status: p.status } : x));
      showToast("Cập nhật trạng thái thất bại!", "error");
    }
  };

  /* ── Bulk delete ── */
  const bulkDelete = async () => {
    if (!window.confirm(`Xóa ${selected.size} sản phẩm đã chọn?`)) return;
    try {
      await Promise.all([...selected].map(id => axiosClient.delete(`/products/${id}`)));
      setProducts(ps => ps.filter(p => !selected.has(p.id)));
      setSelected(new Set());
      showToast(`Đã xóa ${selected.size} sản phẩm`);
    } catch {
      showToast("Xóa hàng loạt thất bại!", "error");
    }
  };

  /* ── Form helpers ── */
  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      brand: p.brand||"", title: p.title||"", sku: p.sku||"", img: p.img||"",
      price: p.price||"", oldPrice: p.oldPrice||"", discount: p.discount||"",
      category: p.category||"phone", nation: p.nation||"",
      display: p.display||"", screenTech: p.screenTech||"",
      ram: p.ram||"", rom: p.rom||"", chip: p.chip||"",
      camera: p.camera||"", battery: p.battery||"", charging: p.charging||"",
      description: p.description||"", stock: p.stock??50, sold: p.sold??0,
      status: p.status||"active",
    });
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditProduct(null); };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.brand || !form.title || !form.price || !form.category) {
      showToast("Vui lòng điền: Hãng, Tên, Giá, Danh mục!", "error"); return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await axiosClient.put(`/products/${editProduct.id}`, form);
        showToast("Cập nhật sản phẩm thành công!");
      } else {
        await axiosClient.post("/products", form);
        showToast("Thêm sản phẩm thành công!");
      }
      await fetchProducts();
      closeDrawer();
    } catch (err) {
      showToast(err.response?.data?.message || "Có lỗi xảy ra!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa sản phẩm "${title}"?`)) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      setProducts(ps => ps.filter(p => p.id !== id));
      showToast("Đã xóa sản phẩm!");
    } catch {
      showToast("Không thể xóa sản phẩm!", "error");
    }
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ["ID","SKU","Tên","Hãng","Danh mục","Giá","Tồn kho","Đã bán","Trạng thái"];
    const rows = filtered.map(p => [p.id, p.sku, `"${p.title}"`, p.brand, p.category, p.price, p.stock, p.sold, p.status]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href:url, download:"products.csv" }).click();
    showToast("Xuất file CSV thành công!");
  };

  /* ── Pagination nums ── */
  const pageNums = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  }, [page, totalPages]);

  const isPlacementTab = activeTab === "placements";

  /* ── Shared input class ── */
  const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-[450] bg-slate-50 text-slate-900 outline-none transition-all duration-150 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 placeholder:text-slate-400";
  const selectCls = `${inputCls} cursor-pointer`;

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f5f6fa] px-6 py-6 pb-16 font-sans text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        code, .mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes slideIn { from { opacity:0; transform:translateX(12px) } to { opacity:1; transform:none } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(6px)  } to { opacity:1; transform:none } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .spin-anim { animation: spin 0.7s linear infinite; }
        .row-anim  { animation: fadeUp 0.2s ease; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }
      `}</style>

      <Toast toasts={toasts} />

      {/* ── PAGE HEADER ── */}
      <header className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Quản trị / Sản phẩm</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản lý sản phẩm</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isPlacementTab && (
            <>
              {/* Search */}
              <div className="relative w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex">
                  <ISearch />
                </span>
                <input
                  className="w-full h-10 pl-9 pr-8 border border-slate-200 rounded-xl bg-white text-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100 placeholder:text-slate-400"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm tên, SKU, thương hiệu..."
                />
                {search && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors"
                    onClick={() => setSearch("")}
                  >
                    <IClose />
                  </button>
                )}
              </div>
              {/* Actions */}
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <IDownload /> Xuất CSV
              </button>
              <label className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                <IUpload /> Nhập Excel
                <input type="file" accept=".csv,.xlsx" className="hidden"
                  onChange={() => showToast("Tính năng nhập sẽ có sớm", "info")} />
              </label>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl text-sm font-bold bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-200 transition-all duration-150"
              >
                <IPlus /> Thêm sản phẩm mới
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label:"Tổng sản phẩm", value: products.length, icon:<IBox />, color:"text-violet-600", bg:"bg-violet-50" },
          { label:"Đang bán",      value: counts.active,   icon:<ITrend />, color:"text-emerald-600", bg:"bg-emerald-50" },
          { label:"Hết hàng",      value: counts.outofstock, icon:<IWarn />, color:"text-red-500",  bg:"bg-red-50" },
          { label:"Bản nháp",      value: counts.draft,    icon:<ITag />,   color:"text-slate-500", bg:"bg-slate-100" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-2xl font-extrabold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN TABS ── */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 mb-4 shadow-sm">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === "products" ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
        >
          <IBox /> Danh sách sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("placements")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === "placements" ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
        >
          <IPin /> Sắp xếp vị trí hiển thị
        </button>
      </div>

      {/* ── PLACEMENTS TAB ── */}
      {isPlacementTab && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <PlacementManage />
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {!isPlacementTab && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap bg-white border border-slate-100 rounded-2xl px-4 py-3 mb-3 shadow-sm">
            {/* Status tabs */}
            <div className="flex gap-1">
              {[
                { key:"all",        label:"Tất cả"   },
                { key:"active",     label:"Đang bán" },
                { key:"outofstock", label:"Hết hàng" },
                { key:"draft",      label:"Bản nháp" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setStatusTab(t.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${statusTab === t.key ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                >
                  {t.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusTab === t.key ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-400"}`}>
                    {counts[t.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold"><IFilter /> Lọc:</span>
              {[
                { val:filterCat,   set:setFilterCat,   opts:[["all","Danh mục"],["phone","Điện thoại"],["laptop","Laptop"]] },
                { val:filterBrand, set:setFilterBrand, opts:[["all","Thương hiệu"],...brands.map(b=>[b,b])] },
                { val:filterPrice, set:setFilterPrice, opts:[["all","Khoảng giá"],["0-5m","< 5 triệu"],["5-15m","5–15 triệu"],["15-30m","15–30 triệu"],["30m+","> 30 triệu"]] },
              ].map((f, i) => (
                <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
                  className="h-8 px-2.5 border border-slate-200 rounded-lg bg-white text-[12.5px] font-medium text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:border-violet-400 transition-colors">
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ))}
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold ml-1"><ISort /> Sắp xếp:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="h-8 px-2.5 border border-slate-200 rounded-lg bg-white text-[12.5px] font-medium text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:border-violet-400 transition-colors">
                <option value="createdAt_desc">Mới nhất</option>
                <option value="createdAt_asc">Cũ nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="stock_asc">Tồn kho ít nhất</option>
                <option value="stock_desc">Tồn kho nhiều nhất</option>
              </select>
            </div>
          </div>

          {/* Bulk bar */}
          {someSelected && (
            <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-2xl px-4 py-2.5 mb-3 animate-[fadeUp_0.2s_ease]">
              <span className="text-sm font-semibold text-violet-700">
                Đã chọn <strong>{selected.size}</strong> sản phẩm
              </span>
              <div className="flex gap-2">
                <button
                  onClick={bulkDelete}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12.5px] font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                >
                  <ITrash /> Xóa đã chọn
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12.5px] font-semibold bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                >
                  <IClose /> Bỏ chọn
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm mb-3">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="w-11 px-4 py-3">
                      <label className="flex cursor-pointer">
                        <input type="checkbox" className="hidden" checked={allOnPage} onChange={toggleAll} />
                        <span className={`w-[17px] h-[17px] rounded-[5px] border-2 flex items-center justify-center transition-all duration-150 text-white ${allOnPage ? "bg-violet-600 border-violet-600" : "bg-white border-slate-300"}`}>
                          {allOnPage && <ICheck />}
                        </span>
                      </label>
                    </th>
                    {["Sản phẩm","Giá","Tồn kho","Trạng thái","Ngày tạo","Thao tác"].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-[10.5px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${h==="Thao tác"?"text-center":""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col items-center gap-3 py-16 text-slate-400 text-sm">
                          <div className="w-6 h-6 border-[2.5px] border-slate-200 border-t-violet-500 rounded-full spin-anim" />
                          Đang tải...
                        </div>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col items-center gap-2 py-16 text-slate-400 text-sm">
                          <div className="text-4xl">📦</div>
                          <p className="text-slate-700 font-semibold text-[15px]">Không tìm thấy sản phẩm</p>
                          <span>Thử thay đổi bộ lọc hoặc từ khoá</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.map(p => (
                    <tr
                      key={p.id}
                      className={`border-b border-slate-50 last:border-0 transition-colors duration-100 row-anim ${selected.has(p.id) ? "bg-violet-50/70" : "hover:bg-slate-50/80"}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <label className="flex cursor-pointer">
                          <input type="checkbox" className="hidden" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} />
                          <span className={`w-[17px] h-[17px] rounded-[5px] border-2 flex items-center justify-center transition-all duration-150 text-white ${selected.has(p.id) ? "bg-violet-600 border-violet-600" : "bg-white border-slate-300"}`}>
                            {selected.has(p.id) && <ICheck />}
                          </span>
                        </label>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                              <img src={p.img} alt={p.title} className="w-full h-full object-contain"
                                onError={e => e.target.style.display="none"} />
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${p.category === "phone" ? "bg-violet-500" : "bg-emerald-500"}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 max-w-[220px] truncate">{p.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <code className="mono text-[10.5px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{p.sku}</code>
                              <span className="text-[11px] text-slate-400">{p.brand}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-slate-800">{fmtVND(p.price)}</span>
                          {p.oldPrice && (
                            <div className="flex items-center gap-1.5">
                              <del className="text-[11px] text-slate-400">{fmtVND(p.oldPrice)}</del>
                              <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded">
                                -{Math.round((1-p.price/p.oldPrice)*100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-bold ${p.stock === 0 ? "text-red-500" : p.stock <= 10 ? "text-amber-500" : "text-slate-800"}`}>
                            {(p.stock || 0).toLocaleString()}
                          </span>
                          {p.stock === 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-md w-fit">
                              <IWarn /> Hết hàng
                            </span>
                          )}
                          {p.stock > 0 && p.stock <= 10 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md w-fit">
                              <IWarn /> Sắp hết
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Toggle active={p.status === "active"} onChange={() => toggleStatus(p)} />
                          <StatusBadge status={p.status} />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-slate-400 whitespace-nowrap">{fmtDate(p.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button title="Xem chi tiết"
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150">
                            <IEye />
                          </button>
                          <button title="Chỉnh sửa" onClick={() => openEdit(p)}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150">
                            <IEdit />
                          </button>
                          <button title="Xóa" onClick={() => handleDelete(p.id, p.title)}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-150">
                            <ITrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[13px] text-slate-500">
              Hiển thị <span className="font-semibold text-slate-700">{Math.min((page-1)*pageSize+1, filtered.length)}</span>–<span className="font-semibold text-slate-700">{Math.min(page*pageSize, filtered.length)}</span> / <span className="font-semibold text-slate-700">{filtered.length}</span> sản phẩm
            </p>
            <div className="flex items-center gap-1.5">
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
                className="h-8 px-2.5 border border-slate-200 rounded-lg bg-white text-[12.5px] font-medium text-slate-600 outline-none cursor-pointer mr-1">
                {[10,20,50].map(n => <option key={n} value={n}>{n} / trang</option>)}
              </select>
              <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <IChevL />
              </button>
              {pageNums.map((n,i) => n === "..." ? (
                <span key={i} className="w-8 text-center text-slate-400 text-sm">…</span>
              ) : (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg border text-[13px] font-semibold flex items-center justify-center transition-all duration-150 ${page === n ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {n}
                </button>
              ))}
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <IChevR />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── SIDE DRAWER ── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        subtitle={editProduct ? `Chỉnh sửa • ID #${editProduct?.id}` : "Tạo mới"}
        footer={
          <>
            <button
              onClick={closeDrawer}
              className="h-10 px-5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-bold bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin-anim" /> Đang lưu...</>
              ) : (
                <><ISave /> {editProduct ? "Cập nhật" : "Thêm mới"}</>
              )}
            </button>
          </>
        }
      >
        <FormSection label="Thông tin cơ bản" />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Hãng sản xuất *">
            <input name="brand" value={form.brand} onChange={handleChange} placeholder="Apple, Samsung..." className={inputCls} />
          </FormField>
          <FormField label="Danh mục *">
            <select name="category" value={form.category} onChange={handleChange} className={selectCls}>
              <option value="phone">📱 Điện thoại</option>
              <option value="laptop">💻 Laptop</option>
            </select>
          </FormField>
        </div>
        <FormField label="Tên sản phẩm *" full>
          <input name="title" value={form.title} onChange={handleChange} placeholder="iPhone 16 Pro Max 256GB..." className={inputCls} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="SKU">
            <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU-00001" className={inputCls} />
          </FormField>
          <FormField label="Trạng thái">
            <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
              <option value="active">Đang bán</option>
              <option value="draft">Bản nháp</option>
              <option value="outofstock">Hết hàng</option>
            </select>
          </FormField>
        </div>
        <FormField label="Link hình ảnh" full>
          <div className="flex items-center gap-2">
            <input name="img" value={form.img} onChange={handleChange} placeholder="https://..." className={`${inputCls} flex-1`} />
            {form.img && (
              <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex-shrink-0 overflow-hidden">
                <img src={form.img} alt="" className="w-full h-full object-contain" onError={e => e.target.style.display="none"} />
              </div>
            )}
          </div>
        </FormField>

        <FormSection label="Giá & Khuyến mãi" />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Giá bán *">
            <input name="price" value={form.price} onChange={handleChange} placeholder="33990000" className={inputCls} />
          </FormField>
          <FormField label="Giá gốc">
            <input name="oldPrice" value={form.oldPrice} onChange={handleChange} placeholder="35990000" className={inputCls} />
          </FormField>
          <FormField label="Nhãn giảm giá">
            <input name="discount" value={form.discount} onChange={handleChange} placeholder="Sale 10%..." className={inputCls} />
          </FormField>
          <FormField label="Quốc gia">
            <input name="nation" value={form.nation} onChange={handleChange} placeholder="Mỹ, Nhật, Hàn..." className={inputCls} />
          </FormField>
          <FormField label="Tồn kho">
            <input name="stock" type="number" value={form.stock} onChange={handleChange} min="0" className={inputCls} />
          </FormField>
          <FormField label="Đã bán">
            <input name="sold" type="number" value={form.sold} onChange={handleChange} min="0" className={inputCls} />
          </FormField>
        </div>

        <FormSection label="Thông số kỹ thuật" />
        <div className="grid grid-cols-2 gap-3">
          {SPEC_FIELDS.map(f => (
            <FormField key={f.name} label={f.label}>
              <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} className={inputCls} />
            </FormField>
          ))}
        </div>

        <FormField label="Mô tả sản phẩm" full>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Mô tả tính năng nổi bật..."
            className={`${inputCls} h-auto py-2.5 resize-y min-h-[90px] leading-relaxed`}
          />
        </FormField>
      </Drawer>
    </div>
  );
}