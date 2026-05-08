import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/* ─── BRAND LOGOS (inline — không bao giờ bị CORS) ─────────────────── */
const BrandLogo = ({ brand, active }) => {
  const c = active ? "#dc2626" : "#555";
  const logos = {
    Apple: (
      <svg viewBox="0 0 814 1000" width="13" height="16" fill={c}>
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.4 0 699.9 0 612.2c0-189.9 124.4-290.3 247.4-290.3 63.1 0 115.5 41.4 155.1 41.4 37.7 0 96.5-43.9 168.7-43.9 27.4 0 108.2 2.6 168.7 98.7zm-194.3-149.9c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
      </svg>
    ),
    Samsung: (
      <span style={{ fontSize:9.5, fontWeight:900, color:c, letterSpacing:0.3 }}>SAMSUNG</span>
    ),
    OPPO: (
      <span style={{ fontSize:13, fontWeight:900, color:c, letterSpacing:1 }}>OPPO</span>
    ),
    Xiaomi: (
      <span style={{ fontSize:11, fontWeight:900, color:c, letterSpacing:0.5 }}>Xiaomi</span>
    ),
    Vivo: (
      <span style={{ fontSize:13, fontWeight:900, color:c, letterSpacing:1 }}>vivo</span>
    ),
  };
  return logos[brand] || <span style={{ fontSize:11, fontWeight:700, color:c }}>{brand}</span>;
};

/* ─── DATA ─────────────────────────────────────────────────────────── */
const filterOptions = {
  brand: ["Apple", "Samsung", "OPPO", "Xiaomi", "Vivo"],
  price:   [{ label:"Dưới 5 triệu",value:"0-5000000"},{label:"5 – 10 triệu",value:"5000000-10000000"},{label:"Trên 10 triệu",value:"10000000-50000000"}],
  ram:     [{ label:"6 GB",value:"6 GB"},{label:"8 GB",value:"8 GB"},{label:"12 GB",value:"12 GB"},{label:"16 GB",value:"16 GB"}],
  rom:     [{ label:"128 GB",value:"128 GB"},{label:"256 GB",value:"256 GB"},{label:"512 GB",value:"512 GB"}],
  display: [{ label:'6.1"',value:"6.1"},{label:'6.7"',value:"6.7"},{label:'6.73"',value:"6.73"},{label:'6.8"',value:"6.8"},{label:'6.9"',value:"6.9"}],
  chip: [
    { label:"Snapdragon 8 Gen 3",value:"Snapdragon 8 Gen 3"},
    { label:"Dimensity 9300",value:"Dimensity 9300"},
    { label:"Dimensity 9200+",value:"Dimensity 9200+"},
    { label:"Apple A18 Pro",value:"A18 Pro"},
    { label:"Apple A17 Pro",value:"A17 Pro"},
    { label:"Exynos 9900",value:"Exynos 9900"},
  ],
  camera:  [{ label:"48 MP",value:"48MP"},{label:"50 MP",value:"50MP"},{label:"50 MP Leica",value:"50MP"},{label:"200 MP",value:"200MP"}],
  battery: [{ label:"3400 mAh",value:"3400"},{label:"4422 mAh",value:"4422"},{label:"4670 mAh",value:"4670"},{label:"5000 mAh",value:"5000"},{label:"5400 mAh",value:"5400"}],
};

const filterMeta = {
  price:   { label:"Giá",       icon:"price"   },
  ram:     { label:"RAM",       icon:"ram"     },
  rom:     { label:"Bộ nhớ",   icon:"rom"     },
  display: { label:"Màn hình", icon:"display" },
  chip:    { label:"Chip",      icon:"chip"    },
  camera:  { label:"Camera",   icon:"camera"  },
  battery: { label:"Pin",       icon:"battery" },
};
const KEYS = Object.keys(filterMeta);

const fmtTag = (k, v) => {
  const m = {"0-5000000":"Dưới 5 triệu","5000000-10000000":"5–10 triệu","10000000-50000000":"Trên 10 triệu"};
  if (m[v]) return m[v];
  if (k === "display") return v + '"';
  if (k === "battery") return v + " mAh";
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
  price:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  ram:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M8 7V5m4 2V5m4 2V5M8 17v2m4-2v2m4-2v2"/></svg>,
  rom:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  display: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>,
  chip:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 7V4m6 3V4M9 20v-3m6 3v-3M4 9h3m-3 6h3m10-6h3m-3 6h3"/></svg>,
  camera:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  battery: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>,
};

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
export default function PhoneFilter() {
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
  const setBrand = v => {
    const nx = new URLSearchParams(sp);
    if (!v) nx.delete("brand"); else nx.set("brand", v);
    setSp(nx);
  };
  const rmTag = (k,v) => {
    const nx = new URLSearchParams(sp);
    if (k==="brand") nx.delete("brand");
    else { const u=getSel(k).filter(x=>x!==v); if(!u.length) nx.delete(k); else nx.set(k,u.join(",")); }
    setSp(nx);
  };
  const clearAll = () => setSp(new URLSearchParams());

  const brand = sp.get("brand");
  const tags  = [];
  if (brand) tags.push({k:"brand",v:brand});
  KEYS.forEach(k => getSel(k).forEach(v => tags.push({k,v})));
  const total = tags.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .pfw { font-family:'Nunito',sans-serif; width:100%; }
        .pfw * { box-sizing:border-box; font-family:inherit; }
        .pfw button { cursor:pointer; border:none; outline:none; }
        .pfw button:active { opacity:.85; }
        @keyframes pf-drop { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

        .pfw-wrap {
          background:#fff;
          border-radius:14px;
          border:1px solid #efefef;
          box-shadow:0 2px 16px rgba(0,0,0,0.06);
          padding:16px 14px;
          width:100%;
        }

        .pfw-header {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:13px;
        }
        .pfw-hleft { display:flex; align-items:center; gap:10px; }
        .pfw-hicon {
          width:32px; height:32px; border-radius:8px;
          background:#dc2626;
          display:flex; align-items:center; justify-content:center;
          color:#fff; flex-shrink:0;
          box-shadow:0 3px 8px rgba(220,38,38,.28);
        }
        .pfw-htitle { font-size:13px; font-weight:800; color:#111; line-height:1.3; }
        .pfw-hsub   { font-size:10px; color:#bbb; margin-top:1px; }
        .pfw-badge  { font-size:10px; font-weight:800; padding:2px 9px; border-radius:20px; background:#f4f4f4; color:#bbb; transition:all .2s; }
        .pfw-badge.on { background:#dc2626; color:#fff; }

        .pfw-div { height:1px; background:#f5f5f5; margin:0 0 14px; }

        .pfw-slabel {
          display:flex; align-items:center; gap:6px;
          font-size:9.5px; font-weight:800; color:#c0c0c0;
          text-transform:uppercase; letter-spacing:.07em; margin-bottom:9px;
        }
        .pfw-sbar { width:3px; height:11px; border-radius:2px; background:#dc2626; flex-shrink:0; }

        /* brand — 3 cột, 5 brand + 1 "Tất cả" = 6 ô vừa đẹp */
        .pfw-brands {
          display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:18px;
        }
        .pfw-brand {
          position:relative; height:38px;
          border:1.5px solid #f0f0f0; border-radius:8px; background:#fafafa;
          display:flex; align-items:center; justify-content:center;
          padding:5px 8px; overflow:hidden; transition:all .18s;
        }
        .pfw-brand:hover { border-color:#fca5a5; background:#fff8f8; }
        .pfw-brand.on    { border-color:#dc2626; background:#fff5f5; box-shadow:0 2px 8px rgba(220,38,38,.12); }
        .pfw-btick {
          position:absolute; top:3px; right:3px;
          width:14px; height:14px; border-radius:50%;
          background:#dc2626; color:#fff;
          display:flex; align-items:center; justify-content:center;
        }
        .pfw-ball {
          height:38px; border:1.5px solid #f0f0f0; border-radius:8px;
          background:#fafafa; font-size:11px; font-weight:700; color:#888; transition:all .18s;
        }
        .pfw-ball:hover { border-color:#fca5a5; color:#dc2626; }
        .pfw-ball.on    { border-color:#dc2626; background:#fff5f5; color:#dc2626; }

        /* dropdowns */
        .pfw-drops { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:4px; }
        .pfw-dw    { position:relative; }
        .pfw-dw:last-child:nth-child(odd) { grid-column: span 2; }
        .pfw-dbtn {
          width:100%; display:flex; align-items:center; gap:5px;
          padding:7px 8px; border:1.5px solid #f0f0f0; border-radius:8px;
          background:#fafafa; color:#555; transition:all .18s;
        }
        .pfw-dbtn:hover          { border-color:#fca5a5; background:#fff8f8; }
        .pfw-dbtn.open           { border-color:#dc2626; background:#fff5f5; border-radius:8px 8px 0 0; }
        .pfw-dbtn.act            { border-color:#fecaca; background:#fff8f8; color:#dc2626; }
        .pfw-dbtn.open.act       { border-color:#dc2626; }
        .pfw-dlbl { flex:1; text-align:left; font-size:11.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pfw-dcnt {
          min-width:16px; height:16px; border-radius:8px;
          background:#dc2626; color:#fff; font-size:9.5px; font-weight:800;
          display:flex; align-items:center; justify-content:center; padding:0 4px; flex-shrink:0;
        }
        .pfw-panel {
          position:absolute; left:0; right:0; z-index:300;
          background:#fff; border:1.5px solid #dc2626; border-top:none;
          border-radius:0 0 8px 8px;
          box-shadow:0 8px 24px rgba(220,38,38,.1);
          padding:4px 4px 6px; animation:pf-drop .15s ease;
        }
        .pfw-opt {
          width:100%; display:flex; align-items:center; gap:7px;
          padding:5px 6px; border:none; background:transparent;
          border-radius:6px; text-align:left; font-size:11.5px; font-weight:500; color:#333;
          transition:background .12s;
        }
        .pfw-opt:hover { background:#fff0f0; }
        .pfw-opt.on    { background:#fff0f0; color:#dc2626; font-weight:700; }
        .pfw-chk {
          width:14px; height:14px; border-radius:3.5px; flex-shrink:0;
          border:1.5px solid #ddd; background:#fff;
          display:flex; align-items:center; justify-content:center; transition:all .14s;
        }
        .pfw-chk.on { background:#dc2626; border-color:#dc2626; color:#fff; }

        /* tags */
        .pfw-tags { margin-top:14px; padding:10px 9px; background:#fafafa; border-radius:8px; border:1px dashed #f5c6c6; }
        .pfw-tags-ttl { font-size:9.5px; font-weight:800; color:#ccc; text-transform:uppercase; letter-spacing:.06em; margin-bottom:7px; display:flex; align-items:center; gap:5px; }
        .pfw-tags-list { display:flex; flex-wrap:wrap; gap:5px; }
        .pfw-tag { display:inline-flex; align-items:center; gap:3px; padding:3px 7px 3px 9px; background:#fff; border:1px solid #fecaca; border-radius:20px; font-size:11px; }
        .pfw-tag-k   { color:#bbb; font-size:10px; }
        .pfw-tag-v   { font-weight:700; color:#111; margin-left:1px; }
        .pfw-tag-del {
          width:15px; height:15px; border-radius:50%;
          background:#fee2e2; color:#dc2626;
          display:flex; align-items:center; justify-content:center;
          margin-left:3px; flex-shrink:0; padding:0; transition:background .15s;
        }
        .pfw-tag-del:hover { background:#fca5a5; }
        .pfw-clear {
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 10px; background:transparent;
          border:1px solid #fca5a5 !important; border-radius:20px;
          color:#dc2626; font-size:11px; font-weight:700; transition:background .15s;
        }
        .pfw-clear:hover { background:#fff0f0; }

        /* responsive */
        @media (max-width:900px) {
          .pfw-drops  { grid-template-columns:repeat(3,1fr); }
          .pfw-brands { grid-template-columns:repeat(6,1fr); }
        }
        @media (max-width:600px) {
          .pfw-drops  { grid-template-columns:repeat(2,1fr); }
          .pfw-brands { grid-template-columns:repeat(3,1fr); }
        }
        @media (max-width:400px) {
          .pfw-drops  { grid-template-columns:1fr 1fr; }
          .pfw-brands { grid-template-columns:repeat(3,1fr); }
        }
      `}</style>

      <div className="pfw" ref={ref}>
        <div className="pfw-wrap">

          {/* HEADER */}
          <div className="pfw-header">
            <div className="pfw-hleft">
              <div className="pfw-hicon"><SvgFilter /></div>
              <div>
                <div className="pfw-htitle">Bộ lọc sản phẩm</div>
                <div className="pfw-hsub">Tìm đúng điện thoại bạn cần</div>
              </div>
            </div>
            <div className={`pfw-badge ${total > 0 ? "on" : ""}`}>
              {total > 0 ? `${total} bộ lọc` : "0 bộ lọc"}
            </div>
          </div>
          <div className="pfw-div" />

          {/* BRAND */}
          <div className="pfw-slabel"><span className="pfw-sbar"/><span>Hãng sản xuất</span></div>
          <div className="pfw-brands">
            {filterOptions.brand.map(b => (
              <button key={b}
                className={`pfw-brand ${brand === b ? "on" : ""}`}
                onClick={() => setBrand(brand === b ? null : b)}
                title={b}
              >
                <BrandLogo brand={b} active={brand === b} />
                {brand === b && (
                  <span className="pfw-btick"><SvgCheck size={8}/></span>
                )}
              </button>
            ))}
            <button className={`pfw-ball ${!brand ? "on" : ""}`} onClick={() => setBrand(null)}>
              Tất cả
            </button>
          </div>

          {/* DROPDOWNS */}
          <div className="pfw-slabel"><span className="pfw-sbar"/><span>Bộ lọc chi tiết</span></div>
          <div className="pfw-drops">
            {KEYS.map(k => {
              const { label, icon } = filterMeta[k];
              const open   = openKey === k;
              const active = hasVal(k);
              return (
                <div key={k} className="pfw-dw">
                  <button className={`pfw-dbtn ${open?"open":""} ${active?"act":""}`}
                    onClick={() => setKey(p => p===k ? null : k)}>
                    <span style={{ color:active?"#dc2626":"#ccc", display:"flex", flexShrink:0 }}>
                      {iconMap[icon]}
                    </span>
                    <span className="pfw-dlbl" style={{ color:active?"#dc2626":"#444" }}>{label}</span>
                    {cnt(k) > 0 && <span className="pfw-dcnt">{cnt(k)}</span>}
                    <span style={{ display:"flex", flexShrink:0, color:active?"#dc2626":"#ccc" }}>
                      <SvgChevron open={open}/>
                    </span>
                  </button>
                  {open && (
                    <div className="pfw-panel">
                      {filterOptions[k].map(opt => {
                        const on = isOn(k, opt.value);
                        return (
                          <button key={opt.label+opt.value}
                            className={`pfw-opt ${on?"on":""}`}
                            onClick={() => toggle(k, opt.value)}>
                            <span className={`pfw-chk ${on?"on":""}`}>
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
            <div className="pfw-tags">
              <div className="pfw-tags-ttl">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                Đang lọc ({total})
              </div>
              <div className="pfw-tags-list">
                {tags.map((t,i) => (
                  <span key={i} className="pfw-tag">
                    <span className="pfw-tag-k">{t.k==="brand"?"Hãng":filterMeta[t.k]?.label}:</span>
                    <span className="pfw-tag-v">{t.k==="brand" ? t.v : fmtTag(t.k,t.v)}</span>
                    <button className="pfw-tag-del" onClick={() => rmTag(t.k,t.v)}><SvgX size={8}/></button>
                  </span>
                ))}
                <button className="pfw-clear" onClick={clearAll}>
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