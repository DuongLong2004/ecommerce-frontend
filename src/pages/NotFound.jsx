// import { useNavigate } from "react-router-dom";

// export default function NotFound() {
//   const navigate = useNavigate();

//   return (
//     <div style={{
//       minHeight: "60vh", display: "flex", flexDirection: "column",
//       alignItems: "center", justifyContent: "center",
//       fontFamily: "'DM Sans', sans-serif", textAlign: "center",
//       padding: "40px 20px"
//     }}>
//       <div style={{ fontSize: 80, marginBottom: 16 }}>📦</div>
//       <h1 style={{
//         fontSize: 96, fontWeight: 800, color: "#f3f4f6",
//         margin: 0, lineHeight: 1, fontFamily: "serif"
//       }}>404</h1>
//       <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: "16px 0 8px" }}>
//         Trang không tồn tại
//       </h2>
//       <p style={{ color: "#9ca3af", fontSize: 15, marginBottom: 32 }}>
//         Trang bạn tìm kiếm đã bị xóa hoặc không tồn tại.
//       </p>
//       <div style={{ display: "flex", gap: 12 }}>
//         <button
//           onClick={() => navigate(-1)}
//           style={{
//             padding: "10px 24px", borderRadius: 10,
//             border: "1.5px solid #e5e7eb", background: "#fff",
//             color: "#374151", fontSize: 14, cursor: "pointer",
//             fontWeight: 500
//           }}
//         >
//           ← Quay lại
//         </button>
//         <button
//           onClick={() => navigate("/")}
//           style={{
//             padding: "10px 24px", borderRadius: 10,
//             border: "none", background: "#dc2626",
//             color: "#fff", fontSize: 14, cursor: "pointer",
//             fontWeight: 500
//           }}
//         >
//           🏠 Về trang chủ
//         </button>
//       </div>
//     </div>
//   );
// }
import { useNavigate } from "react-router-dom";

const IHome = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IBack = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ISearch = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={S.wrap}>
      <style>{CSS}</style>

      {/* Giant 404 */}
      <div style={S.giant}>404</div>

      {/* Icon */}
      <div style={S.iconWrap}>
        <ISearch />
      </div>

      <h1 style={S.title}>Trang không tồn tại</h1>
      <p style={S.sub}>
        Trang bạn tìm kiếm đã bị xóa, di chuyển hoặc chưa bao giờ tồn tại.
      </p>

      <div style={S.btnGroup}>
        <button onClick={() => navigate(-1)} style={S.btnSecondary}>
          <IBack /> Quay lại
        </button>
        <button onClick={() => navigate("/")} style={S.btnPrimary}>
          <IHome /> Về trang chủ
        </button>
      </div>

      {/* Decorative dots */}
      <div style={S.dots} aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            ...S.dot,
            animationDelay: `${i * 0.15}s`,
            left: `${(i % 5) * 22 + 4}%`,
            top: `${Math.floor(i / 5) * 25 + 10}%`,
          }} />
        ))}
      </div>
    </div>
  );
}

const S = {
  wrap: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    textAlign: "center",
    padding: "40px 20px",
    position: "relative",
    overflow: "hidden",
  },
  giant: {
    fontSize: 140,
    fontWeight: 900,
    color: "#f1f5f9",
    lineHeight: 1,
    margin: 0,
    fontFamily: "'Georgia', serif",
    letterSpacing: "-6px",
    userSelect: "none",
    position: "relative",
    zIndex: 1,
  },
  iconWrap: {
    width: 72, height: 72,
    borderRadius: 20,
    background: "#f8fafc",
    border: "2px dashed #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#cbd5e1",
    margin: "-20px 0 20px",
    position: "relative", zIndex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 10px",
  },
  sub: {
    fontSize: 14,
    color: "#94a3b8",
    maxWidth: 360,
    lineHeight: 1.6,
    marginBottom: 32,
  },
  btnGroup: {
    display: "flex", gap: 12, position: "relative", zIndex: 2,
  },
  btnSecondary: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "10px 22px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", background: "#fff",
    color: "#374151", fontSize: 14, fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.18s",
  },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "10px 22px", borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    color: "#fff", fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(220,38,38,0.28)",
    transition: "all 0.18s",
  },
  dots: {
    position: "absolute", inset: 0,
    pointerEvents: "none", zIndex: 0,
  },
  dot: {
    position: "absolute",
    width: 4, height: 4,
    borderRadius: "50%",
    background: "#e2e8f0",
    animation: "pulse 3s ease-in-out infinite",
  },
};

const CSS = `
  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.5); }
  }
`;