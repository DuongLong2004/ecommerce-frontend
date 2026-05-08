import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * BrandLaptopFilter
 * Dùng cho trang thương hiệu laptop cụ thể (Apple, Dell, HP, ...)
 * Props:
 *   - brand: string — tên hãng hiển thị (vd: "MacBook", "Dell", "HP")
 */

/* ─── DATA ─────────────────────────────────────────────────────────── */
const filterOptions = {
  price: [
    { label:"Dưới 15 triệu",  value:"0-15000000"         },
    { label:"15 – 25 triệu",  value:"15000000-25000000"  },
    { label:"25 – 40 triệu",  value:"25000000-40000000"  },
    { label:"Trên 40 triệu",  value:"40000000-100000000" },
  ],
  ram:      [{ label:"8 GB",value:"8 GB"},{label:"16 GB",value:"16 GB"},{label:"32 GB",value:"32 GB"}],
  rom:      [{ label:"256 GB SSD",value:"256 GB SSD"},{label:"512 GB SSD",value:"512 GB SSD"},{label:"1 TB SSD",value:"1 TB SSD"}],
  display:  [{ label:'13"',value:"13"},{label:'14"',value:"14"},{label:'15.6"',value:"15.6"},{label:'16"',value:"16"}],
  chip:     [{ label:"Apple M1",value:"Apple M1"},{label:"Apple M2/M3",value:"Apple M3"},{label:"Intel i5",value:"Intel Core i5"},{label:"Intel i7",value:"Intel Core i7"},{label:"Ryzen 5",value:"Ryzen 5"},{label:"Ryzen 7",value:"Ryzen 7"}],
  gpu:      [{ label:"GPU tích hợp",value:"Integrated"},{label:"RTX 3050",value:"RTX 3050"},{label:"RTX 4050",value:"RTX 4050"},{label:"RTX 4060",value:"RTX 4060"}],
  nation:   [{ label:"Mỹ",value:"Mỹ"},{label:"Trung Quốc",value:"Trung Quốc"},{label:"Nhật Bản",value:"Nhật"},{label:"Hàn Quốc",value:"Hàn Quốc"}],
  battery:  [{ label:"Trên 10 giờ",value:"10"},{label:"Trên 15 giờ",value:"15"}],
  charging: [{ label:"USB-C 30W",value:"USB-C 30W"},{label:"USB-C 45W",value:"USB-C 45W"},{label:"USB-C 65W",value:"USB-C 65W"}],
};

const filterMeta = {
  price:    { label:"Giá",       icon:"price"    },
  ram:      { label:"RAM",       icon:"ram"      },
  rom:      { label:"SSD",       icon:"rom"      },
  display:  { label:"Màn hình", icon:"display"  },
  chip:     { label:"Chip",      icon:"chip"     },
  gpu:      { label:"GPU",       icon:"gpu"      },
  nation:   { label:"Quốc gia", icon:"nation"   },
  battery:  { label:"Pin",       icon:"battery"  },
  charging: { label:"Sạc",       icon:"charging" },
};
const KEYS = Object.keys(filterMeta);

const fmtTag = (k, v) => {
  const m = {
    "0-15000000":"Dưới 15 triệu","15000000-25000000":"15–25 triệu",
    "25000000-40000000":"25–40 triệu","40000000-100000000":"Trên 40 triệu",
  };
  if (m[v]) return m[v];
  if (k==="display") return v+'"';
  if (k==="battery") return "Trên "+v+" giờ";
  return v;
};

/* ─── SVG ICONS ─────────────────────────────────────────────────────── */
const SvgFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);
const SvgChevron = ({ open }) => (
  <svg style={{ display:"block", transition:"transform .2s", transform: open?"rotate(180deg)":"rotate(0deg)" }}
    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const SvgCheck = ({ size=10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SvgX = ({ size=10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const iconMap = {
  price:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  ram:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M8 7V5m4 2V5m4 2V5M8 17v2m4-2v2m4-2v2"/></svg>,
  rom:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  display:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  chip:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 7V4m6 3V4M9 20v-3m6 3v-3M4 9h3m-3 6h3m10-6h3m-3 6h3"/></svg>,
  gpu:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="12" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/><path d="M5 6V4m4 2V4m4 2V4m4 2V4M5 18v2m4-2v2m4-2v2m4-2v2"/></svg>,
  nation:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  battery:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>,
  charging: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
};

/* ─── BRAND LOGO inline ─────────────────────────────────────────────── */
const BrandBadgeLogo = ({ brand }) => {
  const logos = {
    MacBook: (
      <svg viewBox="0 0 814 1000" width="11" height="14" fill="currentColor">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.4 0 699.9 0 612.2c0-189.9 124.4-290.3 247.4-290.3 63.1 0 115.5 41.4 155.1 41.4 37.7 0 96.5-43.9 168.7-43.9 27.4 0 108.2 2.6 168.7 98.7zm-194.3-149.9c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
      </svg>
    ),
    Apple: (
      <svg viewBox="0 0 814 1000" width="11" height="14" fill="currentColor">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.4 0 699.9 0 612.2c0-189.9 124.4-290.3 247.4-290.3 63.1 0 115.5 41.4 155.1 41.4 37.7 0 96.5-43.9 168.7-43.9 27.4 0 108.2 2.6 168.7 98.7zm-194.3-149.9c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
      </svg>
    ),
  };
  return logos[brand] || null;
};

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
export default function BrandLaptopFilter({ brand = "Laptop" }) {
  const [sp, setSp]       = useSearchParams();
  const [openKey, setKey] = useState(null);
  const ref               = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setKey(null); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const getSel = useCallback(k => sp.get(k)?.split(",").filter(Boolean) ?? [], [sp]);
  const isOn   = (k,v) => getSel(k).includes(v);
  const hasVal = k => getSel(k).length > 0;
  const cnt    = k => getSel(k).length;

  const toggle = (k,v) => {
    const cur = getSel(k);
    const upd = cur.includes(v) ? cur.filter(x=>x!==v) : [...cur,v];
    const nx  = new URLSearchParams(sp);
    if (!upd.length) nx.delete(k); else nx.set(k, upd.join(","));
    setSp(nx);
  };
  const rmTag = (k,v) => {
    const nx = new URLSearchParams(sp);
    const u = getSel(k).filter(x=>x!==v);
    if (!u.length) nx.delete(k); else nx.set(k, u.join(","));
    setSp(nx);
  };
  const clearAll = () => setSp(new URLSearchParams());

  const tags = [];
  KEYS.forEach(k => getSel(k).forEach(v => tags.push({k,v})));
  const total = tags.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .blf { font-family:'Nunito',sans-serif; width:100%; }
        .blf * { box-sizing:border-box; font-family:inherit; }
        .blf button { cursor:pointer; border:none; outline:none; }
        .blf button:active { opacity:.85; }
        @keyframes blf-drop { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

        .blf-wrap {
          background:#fff; border-radius:14px;
          border:1px solid #efefef;
          box-shadow:0 2px 16px rgba(0,0,0,0.06);
          padding:16px 14px; width:100%;
        }

        /* header */
        .blf-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:13px; }
        .blf-hleft  { display:flex; align-items:center; gap:10px; }
        .blf-hicon  {
          width:32px; height:32px; border-radius:8px; background:#dc2626;
          display:flex; align-items:center; justify-content:center;
          color:#fff; flex-shrink:0; box-shadow:0 3px 8px rgba(220,38,38,.28);
        }
        .blf-htitle { font-size:13px; font-weight:800; color:#111; line-height:1.3; }
        .blf-hsub   { font-size:10px; color:#bbb; margin-top:1px; }
        .blf-badge  { font-size:10px; font-weight:800; padding:2px 9px; border-radius:20px; background:#f4f4f4; color:#bbb; transition:all .2s; white-space:nowrap; }
        .blf-badge.on { background:#dc2626; color:#fff; }
        .blf-div { height:1px; background:#f5f5f5; margin:0 0 14px; }

        /* brand badge cố định */
        .blf-brand-badge {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 12px; border-radius:8px;
          background:#fff5f5; border:1.5px solid #dc2626;
          color:#dc2626; font-size:12px; font-weight:800;
          margin-bottom:14px; width:100%; justify-content:center;
        }

        /* section label */
        .blf-slabel {
          display:flex; align-items:center; gap:6px;
          font-size:9.5px; font-weight:800; color:#c0c0c0;
          text-transform:uppercase; letter-spacing:.07em; margin-bottom:9px;
        }
        .blf-sbar { width:3px; height:11px; border-radius:2px; background:#dc2626; flex-shrink:0; }

        /* dropdowns 2 cột */
        .blf-drops { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:4px; }
        .blf-dw    { position:relative; }
        .blf-dw:last-child:nth-child(odd) { grid-column: span 2; }
        .blf-dbtn {
          width:100%; display:flex; align-items:center; gap:5px;
          padding:7px 8px; border:1.5px solid #f0f0f0; border-radius:8px;
          background:#fafafa; transition:all .18s;
        }
        .blf-dbtn:hover    { border-color:#fca5a5; background:#fff8f8; }
        .blf-dbtn.open     { border-color:#dc2626; background:#fff5f5; border-radius:8px 8px 0 0; }
        .blf-dbtn.act      { border-color:#fecaca; background:#fff8f8; }
        .blf-dbtn.open.act { border-color:#dc2626; }
        .blf-dlbl { flex:1; text-align:left; font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .blf-dcnt {
          min-width:16px; height:16px; border-radius:8px; background:#dc2626; color:#fff;
          font-size:9.5px; font-weight:800; display:flex; align-items:center;
          justify-content:center; padding:0 4px; flex-shrink:0;
        }
        .blf-panel {
          position:absolute; left:0; right:0; z-index:300;
          background:#fff; border:1.5px solid #dc2626; border-top:none;
          border-radius:0 0 8px 8px; box-shadow:0 8px 24px rgba(220,38,38,.1);
          padding:4px 4px 6px; animation:blf-drop .15s ease;
        }
        .blf-opt {
          width:100%; display:flex; align-items:center; gap:7px;
          padding:5px 6px; border:none; background:transparent;
          border-radius:6px; text-align:left; font-size:11.5px; font-weight:500; color:#333;
          transition:background .12s;
        }
        .blf-opt:hover { background:#fff0f0; }
        .blf-opt.on    { background:#fff0f0; color:#dc2626; font-weight:700; }
        .blf-chk {
          width:14px; height:14px; border-radius:3.5px; flex-shrink:0;
          border:1.5px solid #ddd; background:#fff;
          display:flex; align-items:center; justify-content:center; transition:all .14s;
        }
        .blf-chk.on { background:#dc2626; border-color:#dc2626; color:#fff; }

        /* tags */
        .blf-tags      { margin-top:14px; padding:10px 9px; background:#fafafa; border-radius:8px; border:1px dashed #f5c6c6; }
        .blf-tags-ttl  { font-size:9.5px; font-weight:800; color:#ccc; text-transform:uppercase; letter-spacing:.06em; margin-bottom:7px; display:flex; align-items:center; gap:5px; }
        .blf-tags-list { display:flex; flex-wrap:wrap; gap:5px; }
        .blf-tag       { display:inline-flex; align-items:center; gap:3px; padding:3px 7px 3px 9px; background:#fff; border:1px solid #fecaca; border-radius:20px; font-size:11px; }
        .blf-tag-k     { color:#bbb; font-size:10px; }
        .blf-tag-v     { font-weight:700; color:#111; margin-left:1px; }
        .blf-tag-del   { width:15px; height:15px; border-radius:50%; background:#fee2e2; color:#dc2626; display:flex; align-items:center; justify-content:center; margin-left:3px; flex-shrink:0; padding:0; transition:background .15s; }
        .blf-tag-del:hover { background:#fca5a5; }
        .blf-clear     { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; background:transparent; border:1px solid #fca5a5 !important; border-radius:20px; color:#dc2626; font-size:11px; font-weight:700; transition:background .15s; }
        .blf-clear:hover { background:#fff0f0; }

        @media (max-width:900px) {
          .blf-drops { grid-template-columns:repeat(3,1fr); }
        }
        @media (max-width:600px) {
          .blf-drops { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="blf" ref={ref}>
        <div className="blf-wrap">

          {/* HEADER */}
          <div className="blf-header">
            <div className="blf-hleft">
              <div className="blf-hicon"><SvgFilter /></div>
              <div>
                <div className="blf-htitle">Lọc {brand}</div>
                <div className="blf-hsub">Tìm đúng chiếc laptop bạn cần</div>
              </div>
            </div>
            <div className={`blf-badge ${total > 0 ? "on" : ""}`}>
              {total > 0 ? `${total} bộ lọc` : "0 bộ lọc"}
            </div>
          </div>
          <div className="blf-div" />

          {/* BRAND BADGE CỐ ĐỊNH */}
          <div className="blf-brand-badge">
            <BrandBadgeLogo brand={brand} />
            {brand}
          </div>

          {/* DROPDOWNS */}
          <div className="blf-slabel"><span className="blf-sbar"/><span>Bộ lọc chi tiết</span></div>
          <div className="blf-drops">
            {KEYS.map(k => {
              const { label, icon } = filterMeta[k];
              const open   = openKey === k;
              const active = hasVal(k);
              return (
                <div key={k} className="blf-dw">
                  <button className={`blf-dbtn ${open?"open":""} ${active?"act":""}`}
                    onClick={() => setKey(p => p===k ? null : k)}>
                    <span style={{ color:active?"#dc2626":"#ccc", display:"flex", flexShrink:0 }}>
                      {iconMap[icon]}
                    </span>
                    <span className="blf-dlbl" style={{ color:active?"#dc2626":"#444" }}>{label}</span>
                    {cnt(k) > 0 && <span className="blf-dcnt">{cnt(k)}</span>}
                    <span style={{ display:"flex", flexShrink:0, color:active?"#dc2626":"#ccc" }}>
                      <SvgChevron open={open}/>
                    </span>
                  </button>
                  {open && (
                    <div className="blf-panel">
                      {filterOptions[k].map(opt => {
                        const on = isOn(k, opt.value);
                        return (
                          <button key={opt.label+opt.value}
                            className={`blf-opt ${on?"on":""}`}
                            onClick={() => toggle(k, opt.value)}>
                            <span className={`blf-chk ${on?"on":""}`}>
                              {on && <SvgCheck size={9}/>}
                            </span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TAGS */}
          {total > 0 && (
            <div className="blf-tags">
              <div className="blf-tags-ttl">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                Đang lọc ({total})
              </div>
              <div className="blf-tags-list">
                {tags.map((t,i) => (
                  <span key={i} className="blf-tag">
                    <span className="blf-tag-k">{filterMeta[t.k]?.label}:</span>
                    <span className="blf-tag-v">{fmtTag(t.k, t.v)}</span>
                    <button className="blf-tag-del" onClick={() => rmTag(t.k, t.v)}><SvgX size={8}/></button>
                  </span>
                ))}
                <button className="blf-clear" onClick={clearAll}>
                  <SvgX size={9}/> Xóa tất cả
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}