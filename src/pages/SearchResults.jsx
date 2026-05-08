


import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosClient from "../api/axios";

const ISearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IEmpty = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const IGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ISpin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.7s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true);
    axiosClient.get("/products", { params: { search: q, limit: 50 } })
      .then(res => setResults(res.data.data.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.searchIcon}><ISearch /></div>
          <div>
            <h1 style={S.title}>Kết quả tìm kiếm</h1>
            <p style={S.subtitle}>
              {loading
                ? "Đang tìm kiếm..."
                : `${results.length} kết quả cho `}
              {!loading && q && (
                <span style={S.keyword}>"{q}"</span>
              )}
            </p>
          </div>
        </div>
        {!loading && results.length > 0 && (
          <div style={S.countBadge}>
            <IGrid />
            {results.length} sản phẩm
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={S.loadingWrap}>
          <ISpin />
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            Đang tìm kiếm cho "{q}"...
          </span>
        </div>
      )}

      {/* Empty */}
      {!loading && results.length === 0 && (
        <div style={S.emptyWrap}>
          <div style={S.emptyIcon}><IEmpty /></div>
          <h3 style={{ color: "#374151", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            Không tìm thấy sản phẩm
          </h3>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>
            Thử tìm với từ khóa khác hoặc kiểm tra chính tả
          </p>
          <div style={S.suggestions}>
            {["Áo phông", "Quần jeans", "Giày sneaker"].map(s => (
              <Link key={s} to={`/search?q=${s}`} style={S.suggestion}>{s}</Link>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && results.length > 0 && (
        <div style={S.grid}>
          {results.map((item, i) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              state={{ item }}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  ...S.card,
                  animationDelay: `${i * 30}ms`,
                }}
                className="search-card"
              >
                {item.discount && (
                  <div style={S.discountBadge}>{item.discount}</div>
                )}
                <div style={S.imgWrap}>
                  <img
                    src={item.img}
                    alt={item.title}
                    style={S.img}
                    onError={e => e.target.style.opacity = "0"}
                  />
                </div>
                <div style={S.cardBody}>
                  <div style={S.productTitle}>{item.title}</div>
                  <div style={S.priceRow}>
                    <span style={S.price}>{item.price}</span>
                    {item.oldPrice && (
                      <del style={S.oldPrice}>{item.oldPrice}</del>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "36px 20px 64px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  searchIcon: {
    width: 46, height: 46, borderRadius: 13,
    background: "linear-gradient(135deg, #0f172a, #334155)",
    color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(15,23,42,0.2)",
  },
  title: { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: 13, color: "#94a3b8", margin: "3px 0 0" },
  keyword: { fontWeight: 700, color: "#dc2626" },
  countBadge: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 9,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    fontSize: 13, color: "#64748b", fontWeight: 500,
  },

  loadingWrap: {
    display: "flex", alignItems: "center", gap: 10,
    justifyContent: "center", padding: "60px 20px",
    color: "#94a3b8",
  },
  emptyWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "60px 20px",
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 20,
    background: "#f8fafc", border: "2px dashed #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#cbd5e1", marginBottom: 20,
  },
  suggestions: { display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" },
  suggestion: {
    padding: "6px 14px", borderRadius: 20,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    color: "#64748b", fontSize: 13, textDecoration: "none",
    fontWeight: 500,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff", borderRadius: 14,
    border: "1px solid #f3f4f6",
    overflow: "hidden",
    position: "relative",
    transition: "all 0.2s ease",
    animation: "fadeUp 0.3s ease both",
  },
  discountBadge: {
    position: "absolute", top: 10, left: 10, zIndex: 1,
    background: "#fef2f2", color: "#dc2626",
    fontSize: 11, fontWeight: 600,
    padding: "3px 8px", borderRadius: 6,
    border: "1px solid #fecaca",
  },
  imgWrap: {
    height: 170,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#fafafa", overflow: "hidden",
  },
  img: {
    width: "100%", height: "100%", objectFit: "contain",
    transition: "transform 0.3s ease",
  },
  cardBody: { padding: "12px 14px 14px" },
  productTitle: {
    fontSize: 13, fontWeight: 500, color: "#111",
    lineHeight: 1.45, marginBottom: 8,
    display: "-webkit-box",
    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  priceRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  price: { fontSize: 15, fontWeight: 800, color: "#dc2626" },
  oldPrice: { fontSize: 12, color: "#9ca3af" },
};

const CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .search-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
    transform: translateY(-3px) !important;
  }
  .search-card:hover img {
    transform: scale(1.05);
  }
`;