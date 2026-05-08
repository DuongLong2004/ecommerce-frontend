// import { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axiosClient from "../api/axios";
// import ProductCard from "../components/Product/ProductCard";
// import { useWishlist } from "../hooks/useWishlist";

// export default function Wishlist() {
//   const [items, setItems]        = useState([]);
//   const [loading, setLoading]    = useState(true);
//   const { wishlistIds, refetch } = useWishlist();
//   const navigate = useNavigate();

//   const fetchWishlist = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) { navigate("/login"); return; }
//     try {
//       const res = await axiosClient.get("/wishlist");
//       setItems(res.data.data || []);
//     } catch {
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchWishlist(); }, []);

//   const handleChange = () => {
//     refetch();
//     fetchWishlist();
//   };

//   if (loading) return (
//     <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>
//       ⏳ Đang tải...
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif" }}>
//       <h1 style={{ fontFamily: "serif", fontSize: 28, marginBottom: 4, color: "#111" }}>
//         ❤️ Sản phẩm yêu thích
//       </h1>
//       <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 32 }}>
//         {items.length} sản phẩm
//       </p>

//       {items.length === 0 ? (
//         <div style={{ textAlign: "center", padding: "60px 20px" }}>
//           <div style={{ fontSize: 64, marginBottom: 16 }}>🤍</div>
//           <h2 style={{ color: "#374151", marginBottom: 8 }}>Chưa có sản phẩm yêu thích</h2>
//           <p style={{ color: "#9ca3af", marginBottom: 24 }}>Hãy thêm sản phẩm bạn thích!</p>
//           <button onClick={() => navigate("/")} style={{
//             padding: "10px 24px", background: "#dc2626", color: "#fff",
//             border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14
//           }}>
//             Khám phá ngay →
//           </button>
//         </div>
//       ) : (
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
//           gap: 16
//         }}>
//           {items.map(w => (
//             <ProductCard
//               key={w.id}
//               item={{ ...w.Product }}
//               wishlistIds={wishlistIds}
//               onWishlistChange={handleChange}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
import ProductCard from "../components/Product/ProductCard";
import { useWishlist } from "../hooks/useWishlist";

const IHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IHeartEmpty = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ISpin = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default function Wishlist() {
  const [items, setItems]        = useState([]);
  const [loading, setLoading]    = useState(true);
  const { wishlistIds, refetch } = useWishlist();
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const res = await axiosClient.get("/wishlist");
      setItems(res.data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleChange = () => {
    refetch();
    fetchWishlist();
  };

  if (loading) return (
    <div style={S.center}>
      <style>{CSS}</style>
      <ISpin />
      <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 14, fontFamily: "inherit" }}>
        Đang tải danh sách yêu thích...
      </p>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.heartIcon}><IHeart /></div>
          <div>
            <h1 style={S.title}>Sản phẩm yêu thích</h1>
            <p style={S.subtitle}>{items.length} sản phẩm đã lưu</p>
          </div>
        </div>
      </div>

      {/* Empty */}
      {items.length === 0 ? (
        <div style={S.emptyWrap}>
          <div style={S.emptyIcon}><IHeartEmpty /></div>
          <h2 style={S.emptyTitle}>Chưa có sản phẩm yêu thích</h2>
          <p style={S.emptySub}>
            Nhấn vào biểu tượng tim trên sản phẩm để lưu vào đây
          </p>
          <button onClick={() => navigate("/")} style={S.btnPrimary}>
            Khám phá ngay <IArrow />
          </button>
        </div>
      ) : (
        <div style={S.grid}>
          {items.map((w, i) => (
            <div
              key={w.id}
              style={{
                animation: "fadeUp 0.3s ease both",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <ProductCard
                item={{ ...w.Product }}
                wishlistIds={wishlistIds}
                onWishlistChange={handleChange}
              />
            </div>
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
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "60vh",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  heartIcon: {
    width: 46, height: 46, borderRadius: 13,
    background: "linear-gradient(135deg, #dc2626, #f43f5e)",
    color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 14px rgba(220,38,38,0.28)",
  },
  title: { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: 13, color: "#94a3b8", margin: "3px 0 0" },

  emptyWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "64px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 20,
    background: "#fff1f2", border: "2px dashed #fecdd3",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fca5a5", marginBottom: 22,
  },
  emptyTitle: {
    fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 10px",
  },
  emptySub: {
    fontSize: 14, color: "#9ca3af", maxWidth: 320,
    lineHeight: 1.6, marginBottom: 28,
  },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "12px 24px", borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    color: "#fff", fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(220,38,38,0.28)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
};

const CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;