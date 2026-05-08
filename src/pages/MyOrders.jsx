// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import axiosClient from "../api/axios";

// /* ── SVG Icons ─────────────────────────────────── */
// const IBox      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
// const IUser     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
// const IPhone    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
// const IMapPin   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
// const ICard     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
// const IClock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
// const ICheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
// const IParty    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.8 11.3L2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.) 0.76-.81 1.22-1.56 1.22"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.46 4.94 9 5.75 9 6.5"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2z"/></svg>;
// const IXCircle  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
// const IShop     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
// const IArrow    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
// const IRefresh  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
// const ITrash    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
// const IChevron  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
// const IChevronU = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;

// /* ── Helpers ────────────────────────────────────── */
// const fmt = (n) => Number(n).toLocaleString("vi-VN") + "₫";

// const STATUS = {
//   pending:   { label: "Chờ xác nhận", icon: <IClock/>,   color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
//   confirmed: { label: "Đã xác nhận",  icon: <ICheck/>,   color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
//   completed: { label: "Hoàn thành",   icon: <IParty/>,   color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0" },
//   cancelled: { label: "Đã hủy",       icon: <IXCircle/>, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
// };

// const PAY = {
//   cod:     "Thanh toán khi nhận hàng",
//   banking: "Chuyển khoản ngân hàng",
//   momo:    "Ví MoMo",
// };

// /* ── Component ─────────────────────────────────── */
// export default function MyOrders() {
//   const [orders,     setOrders]     = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [loadingMore,setLoadingMore]= useState(false);
//   const [hasMore,    setHasMore]    = useState(false);
//   const [nextCursor, setNextCursor] = useState(null);
//   const [expanded,   setExpanded]   = useState({});
//   const navigate = useNavigate();

//   // ✅ Fetch với cursor-based pagination
//   const fetchOrders = useCallback(async (cursor = null) => {
//     const token = localStorage.getItem("token");
//     if (!token) { navigate("/login"); return; }

//     cursor ? setLoadingMore(true) : setLoading(true);
//     try {
//       const url = cursor
//         ? `/orders/me?cursor=${cursor}&limit=5`
//         : `/orders/me?limit=5`;
//       const res = await axiosClient.get(url);
//       // ✅ Fix: cursor-based trả { data, hasMore, nextCursor }
//       const payload = res.data.data;
//       const list    = payload?.data ?? payload ?? [];
//       setOrders(prev => cursor ? [...prev, ...list] : list);
//       setHasMore(payload?.hasMore ?? false);
//       setNextCursor(payload?.nextCursor ?? null);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       cursor ? setLoadingMore(false) : setLoading(false);
//     }
//   }, [navigate]);

//   useEffect(() => { fetchOrders(); }, [fetchOrders]);

//   const cancelOrder = async (id) => {
//     if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
//     try {
//       await axiosClient.patch(`/orders/${id}/cancel`);
//       setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
//     } catch (err) {
//       alert(err.response?.data?.message || "Không thể hủy đơn!");
//     }
//   };

//   const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

//   /* ── Loading state ── */
//   if (loading) return (
//     <div style={styles.center}>
//       <div style={styles.spinner}/>
//       <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 12 }}>Đang tải đơn hàng...</p>
//       <style>{spinCSS}</style>
//     </div>
//   );

//   /* ── Empty state ── */
//   if (orders.length === 0) return (
//     <div style={styles.center}>
//       <div style={{ color: "#cbd5e1", marginBottom: 16 }}><IBox/><span style={{fontSize:48}}/></div>
//       <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" style={{marginBottom:16}}>
//         <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
//         <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
//       </svg>
//       <h2 style={{ color: "#374151", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
//         Chưa có đơn hàng nào
//       </h2>
//       <p style={{ color: "#9ca3af", marginBottom: 24, fontSize: 14 }}>
//         Hãy mua sắm và quay lại đây nhé!
//       </p>
//       <button onClick={() => navigate("/")} style={styles.btnPrimary}>
//         <IShop/> Mua sắm ngay <IArrow/>
//       </button>
//     </div>
//   );

//   /* ── Main render ── */
//   return (
//     <div style={styles.page}>
//       <style>{spinCSS}</style>

//       {/* Page header */}
//       <div style={styles.pageHeader}>
//         <div style={styles.pageHeaderLeft}>
//           <div style={styles.pageIconWrap}><IBox/></div>
//           <div>
//             <h1 style={styles.pageTitle}>Đơn hàng của tôi</h1>
//             <p style={styles.pageSubtitle}>{orders.length} đơn hàng</p>
//           </div>
//         </div>
//         <button onClick={() => fetchOrders()} style={styles.btnRefresh} title="Làm mới">
//           <IRefresh/>
//         </button>
//       </div>

//       {/* Order list */}
//       <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//         {orders.map(order => {
//           const st   = STATUS[order.status] || STATUS.pending;
//           const open = expanded[order.id];
//           const itemCount = order.OrderItems?.length || 0;

//           return (
//             <div key={order.id} style={styles.card}>

//               {/* ── Card header ── */}
//               <div style={styles.cardHeader}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                   {/* Status dot */}
//                   <div style={{
//                     width: 8, height: 8, borderRadius: "50%",
//                     background: st.color, flexShrink: 0,
//                     boxShadow: `0 0 0 3px ${st.bg}`
//                   }}/>
//                   <span style={{ fontWeight: 700, color: "#111", fontSize: 14 }}>
//                     Đơn #{order.id}
//                   </span>
//                   <span style={{
//                     padding: "3px 10px", borderRadius: 20,
//                     fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
//                     color: st.color, background: st.bg,
//                     border: `1px solid ${st.border}`,
//                     display: "flex", alignItems: "center", gap: 4
//                   }}>
//                     {st.icon} {st.label}
//                   </span>
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                   <span style={{ fontSize: 12, color: "#94a3b8" }}>
//                     {new Date(order.createdAt).toLocaleDateString("vi-VN", {
//                       day: "2-digit", month: "2-digit", year: "numeric"
//                     })}
//                   </span>
//                   <button onClick={() => toggle(order.id)} style={styles.btnToggle}>
//                     {open ? <IChevronU/> : <IChevron/>}
//                   </button>
//                 </div>
//               </div>

//               {/* ── Preview khi collapsed: chỉ hiện ảnh sản phẩm ── */}
//               {!open && (
//                 <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
//                   <div style={{ display: "flex", gap: 6 }}>
//                     {order.OrderItems?.slice(0, 3).map((item, i) => (
//                       <img key={i} src={item.Product?.img} alt={item.Product?.title}
//                         style={{ width: 44, height: 44, objectFit: "contain",
//                           borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9" }}
//                       />
//                     ))}
//                     {itemCount > 3 && (
//                       <div style={{ width: 44, height: 44, borderRadius: 8,
//                         background: "#f1f5f9", display: "flex", alignItems: "center",
//                         justifyContent: "center", fontSize: 11, color: "#64748b", fontWeight: 600 }}>
//                         +{itemCount - 3}
//                       </div>
//                     )}
//                   </div>
//                   <div style={{ flex: 1, marginLeft: 4 }}>
//                     <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
//                       {order.OrderItems?.[0]?.Product?.title}
//                       {itemCount > 1 && (
//                         <span style={{ color: "#94a3b8", fontWeight: 400 }}>
//                           {" "}và {itemCount - 1} sản phẩm khác
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 15, flexShrink: 0 }}>
//                     {fmt(order.totalAmount)}
//                   </div>
//                 </div>
//               )}

//               {/* ── Expanded: chi tiết đầy đủ ── */}
//               {open && (
//                 <>
//                   {/* Items */}
//                   <div style={{ padding: "4px 20px 0" }}>
//                     {order.OrderItems?.map((item, i) => (
//                       <div key={i} style={{
//                         display: "flex", alignItems: "center", gap: 14,
//                         padding: "12px 0",
//                         borderBottom: i < itemCount - 1 ? "1px solid #f8fafc" : "none"
//                       }}>
//                         <img src={item.Product?.img} alt={item.Product?.title}
//                           style={{ width: 56, height: 56, objectFit: "contain",
//                             borderRadius: 10, background: "#f8fafc",
//                             border: "1px solid #f1f5f9", flexShrink: 0 }}
//                         />
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{ fontWeight: 600, fontSize: 13, color: "#111",
//                             whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                             {item.Product?.title}
//                           </div>
//                           <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
//                             {fmt(item.price)} × {item.quantity}
//                           </div>
//                         </div>
//                         <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 14, flexShrink: 0 }}>
//                           {fmt(item.price * item.quantity)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Shipping info */}
//                   {order.shippingName && (
//                     <div style={styles.shippingBox}>
//                       <div style={styles.shippingGrid}>
//                         {[
//                           { icon: <IUser/>,   label: "Người nhận", value: order.shippingName    },
//                           { icon: <IPhone/>,  label: "Điện thoại", value: order.shippingPhone   },
//                           { icon: <IMapPin/>, label: "Địa chỉ",    value: order.shippingAddress },
//                           { icon: <ICard/>,   label: "Thanh toán", value: PAY[order.payMethod] || order.payMethod },
//                         ].filter(r => r.value).map((row, j) => (
//                           <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
//                             <span style={{ color: "#94a3b8", marginTop: 1, flexShrink: 0 }}>{row.icon}</span>
//                             <span style={{ color: "#94a3b8", fontSize: 12, flexShrink: 0 }}>{row.label}:</span>
//                             <span style={{ color: "#374151", fontSize: 12, fontWeight: 500 }}>{row.value}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Footer */}
//                   <div style={styles.cardFooter}>
//                     <div style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
//                       Tổng cộng:
//                       <span style={{ fontWeight: 800, color: "#dc2626", fontSize: 18, marginLeft: 4 }}>
//                         {fmt(order.totalAmount)}
//                       </span>
//                     </div>
//                     {order.status === "pending" && (
//                       <button onClick={() => cancelOrder(order.id)} style={styles.btnCancel}>
//                         <ITrash/> Hủy đơn
//                       </button>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Load more */}
//       {hasMore && (
//         <div style={{ textAlign: "center", marginTop: 24 }}>
//           <button
//             onClick={() => fetchOrders(nextCursor)}
//             disabled={loadingMore}
//             style={styles.btnLoadMore}
//           >
//             {loadingMore
//               ? <><div style={styles.spinnerSm}/> Đang tải...</>
//               : <><IRefresh/> Xem thêm đơn hàng</>
//             }
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Styles ─────────────────────────────────────── */
// const styles = {
//   page: {
//     maxWidth: 820,
//     margin: "0 auto",
//     padding: "40px 20px 60px",
//     fontFamily: "'Segoe UI', system-ui, sans-serif",
//   },
//   center: {
//     display: "flex", flexDirection: "column",
//     alignItems: "center", justifyContent: "center",
//     minHeight: "60vh", fontFamily: "'Segoe UI', system-ui, sans-serif",
//   },
//   pageHeader: {
//     display: "flex", justifyContent: "space-between",
//     alignItems: "center", marginBottom: 28,
//   },
//   pageHeaderLeft: {
//     display: "flex", alignItems: "center", gap: 14,
//   },
//   pageIconWrap: {
//     width: 44, height: 44, borderRadius: 12,
//     background: "linear-gradient(135deg, #dc2626, #ef4444)",
//     color: "#fff", display: "flex",
//     alignItems: "center", justifyContent: "center",
//     boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
//   },
//   pageTitle: {
//     fontSize: 22, fontWeight: 800, color: "#111", margin: 0,
//   },
//   pageSubtitle: {
//     fontSize: 13, color: "#94a3b8", margin: "2px 0 0",
//   },
//   card: {
//     background: "#fff", borderRadius: 16,
//     border: "1px solid #f1f5f9",
//     boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
//     overflow: "hidden",
//     transition: "box-shadow 0.2s",
//   },
//   cardHeader: {
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     padding: "14px 20px",
//     borderBottom: "1px solid #f8fafc",
//     background: "#fafafa",
//   },
//   cardFooter: {
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     padding: "14px 20px",
//     borderTop: "1px solid #f8fafc",
//     background: "#fafafa",
//   },
//   shippingBox: {
//     margin: "0 20px",
//     padding: "14px 16px",
//     background: "#fafafa",
//     borderRadius: 10,
//     border: "1px solid #f1f5f9",
//     marginTop: 4,
//     marginBottom: 4,
//   },
//   shippingGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "8px 16px",
//   },
//   btnToggle: {
//     background: "#f1f5f9", border: "none", borderRadius: 8,
//     width: 30, height: 30, display: "flex",
//     alignItems: "center", justifyContent: "center",
//     cursor: "pointer", color: "#64748b",
//     transition: "background 0.2s",
//   },
//   btnRefresh: {
//     background: "#f8fafc", border: "1px solid #e2e8f0",
//     borderRadius: 10, width: 38, height: 38,
//     display: "flex", alignItems: "center", justifyContent: "center",
//     cursor: "pointer", color: "#64748b", transition: "all 0.2s",
//   },
//   btnCancel: {
//     display: "flex", alignItems: "center", gap: 6,
//     padding: "8px 16px", borderRadius: 8,
//     border: "1.5px solid #fca5a5", background: "#fff",
//     color: "#dc2626", fontSize: 13, cursor: "pointer",
//     fontWeight: 500, fontFamily: "inherit",
//     transition: "all 0.2s",
//   },
//   btnPrimary: {
//     display: "flex", alignItems: "center", gap: 8,
//     padding: "12px 24px", borderRadius: 10,
//     background: "linear-gradient(135deg, #dc2626, #ef4444)",
//     color: "#fff", border: "none", fontSize: 14,
//     fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
//     boxShadow: "0 4px 14px rgba(220,38,38,0.3)",
//   },
//   btnLoadMore: {
//     display: "inline-flex", alignItems: "center", gap: 8,
//     padding: "10px 24px", borderRadius: 10,
//     border: "1.5px solid #e2e8f0", background: "#fff",
//     color: "#374151", fontSize: 13, fontWeight: 500,
//     cursor: "pointer", fontFamily: "inherit",
//     transition: "all 0.2s",
//   },
//   spinner: {
//     width: 32, height: 32,
//     border: "3px solid #fee2e2",
//     borderTopColor: "#dc2626",
//     borderRadius: "50%",
//     animation: "spin 0.7s linear infinite",
//   },
//   spinnerSm: {
//     width: 14, height: 14,
//     border: "2px solid #e2e8f0",
//     borderTopColor: "#64748b",
//     borderRadius: "50%",
//     animation: "spin 0.7s linear infinite",
//     display: "inline-block",
//   },
// };

// const spinCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;



import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";

/* ── SVG Icons ─────────────────────────────────── */
const IBox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const ICard = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const ICheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IXCircle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IShop = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const ITrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IChevron = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IChevronU = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const ICalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

/* ── Helpers ────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString("vi-VN") + "₫";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS = {
  pending:   { label: "Chờ xác nhận", icon: <IClock/>,   color: "#d97706", bg: "#fffbeb", border: "#fde68a",  dot: "#f59e0b" },
  confirmed: { label: "Đã xác nhận",  icon: <ICheck/>,   color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",  dot: "#3b82f6" },
  completed: { label: "Hoàn thành",   icon: <IStar/>,    color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",  dot: "#22c55e" },
  cancelled: { label: "Đã hủy",       icon: <IXCircle/>, color: "#dc2626", bg: "#fff1f2", border: "#fecdd3",  dot: "#ef4444" },
};

const PAY = {
  cod:     "Thanh toán khi nhận",
  banking: "Chuyển khoản",
  momo:    "Ví MoMo",
};

const FILTER_TABS = [
  { key: "all",       label: "Tất cả" },
  { key: "pending",   label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

/* ── Component ─────────────────────────────────── */
export default function MyOrders() {
  const [allOrders,   setAllOrders]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,     setHasMore]     = useState(false);
  const [nextCursor,  setNextCursor]  = useState(null);
  const [expanded,    setExpanded]    = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  /* ── Fetch ── */
  const fetchOrders = useCallback(async (cursor = null) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    cursor ? setLoadingMore(true) : setLoading(true);
    try {
      const url = cursor
        ? `/orders/me?cursor=${cursor}&limit=10`
        : `/orders/me?limit=10`;
      const res = await axiosClient.get(url);
      const payload = res.data.data;
      const list    = payload?.data ?? payload ?? [];
      setAllOrders(prev => cursor ? [...prev, ...list] : list);
      setHasMore(payload?.hasMore ?? false);
      setNextCursor(payload?.nextCursor ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      cursor ? setLoadingMore(false) : setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* ── Cancel ── */
  const cancelOrder = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await axiosClient.patch(`/orders/${id}/cancel`);
      setAllOrders(prev =>
        prev.map(o => o.id === id ? { ...o, status: "cancelled" } : o)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Không thể hủy đơn!");
    }
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  /* ── Filter ── */
  const orders = activeFilter === "all"
    ? allOrders
    : allOrders.filter(o => o.status === activeFilter);

  /* ── Stats ── */
  const stats = {
    total:     allOrders.length,
    pending:   allOrders.filter(o => o.status === "pending").length,
    completed: allOrders.filter(o => o.status === "completed").length,
    cancelled: allOrders.filter(o => o.status === "cancelled").length,
    totalSpent: allOrders
      .filter(o => o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.totalAmount || 0), 0),
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={S.center}>
      <div style={S.spinRing} />
      <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 16, fontFamily: "inherit" }}>
        Đang tải đơn hàng...
      </p>
      <style>{CSS}</style>
    </div>
  );

  /* ── Empty ── */
  if (allOrders.length === 0) return (
    <div style={S.center}>
      <style>{CSS}</style>
      <div style={S.emptyIcon}>
        <IBox />
      </div>
      <h2 style={{ color: "#0f172a", fontSize: 20, fontWeight: 700, margin: "20px 0 8px", fontFamily: "inherit" }}>
        Chưa có đơn hàng nào
      </h2>
      <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: 14, fontFamily: "inherit" }}>
        Hãy mua sắm và quay lại đây nhé!
      </p>
      <button onClick={() => navigate("/")} style={S.btnPrimary}>
        <IShop /> Mua sắm ngay <IArrow />
      </button>
    </div>
  );

  /* ── Main ── */
  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={S.pageHeader}>
        <div style={S.headerLeft}>
          <div style={S.pageIcon}><IBox /></div>
          <div>
            <h1 style={S.pageTitle}>Đơn hàng của tôi</h1>
            <p style={S.pageSub}>{stats.total} đơn hàng</p>
          </div>
        </div>
        <button onClick={() => fetchOrders()} style={S.btnRefresh} title="Làm mới">
          <IRefresh />
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div style={S.statsRow}>
        {[
          { label: "Tổng đơn",    value: stats.total,     color: "#6366f1" },
          { label: "Chờ xử lý",   value: stats.pending,   color: "#f59e0b" },
          { label: "Hoàn thành",  value: stats.completed, color: "#22c55e" },
          { label: "Đã chi tiêu", value: fmt(stats.totalSpent), color: "#dc2626", wide: true },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={S.filterBar}>
        <IFilter />
        <div style={S.filterTabs}>
          {FILTER_TABS.map(tab => {
            const count = tab.key === "all"
              ? allOrders.length
              : allOrders.filter(o => o.status === tab.key).length;
            const isActive = activeFilter === tab.key;
            const st = STATUS[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  ...S.filterTab,
                  ...(isActive ? {
                    background: st ? st.bg : "#f8fafc",
                    color: st ? st.color : "#0f172a",
                    border: `1.5px solid ${st ? st.border : "#e2e8f0"}`,
                    fontWeight: 600,
                  } : {}),
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    ...S.filterCount,
                    background: isActive ? (st ? st.color : "#334155") : "#e2e8f0",
                    color: isActive ? "#fff" : "#64748b",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Empty filter result ── */}
      {orders.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>
            <IFilter />
          </div>
          <p style={{ fontSize: 14 }}>Không có đơn hàng nào ở trạng thái này</p>
        </div>
      )}

      {/* ── Order List ── */}
      <div style={S.list}>
        {orders.map((order, idx) => {
          const st = STATUS[order.status] || STATUS.pending;
          const open = expanded[order.id];
          const itemCount = order.OrderItems?.length || 0;

          return (
            <div
              key={order.id}
              style={{
                ...S.card,
                animationDelay: `${idx * 40}ms`,
              }}
              className="order-card"
            >
              {/* ── Card Header ── */}
              <div style={S.cardHead}>
                <div style={S.cardHeadLeft}>
                  {/* Status dot */}
                  <div style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: st.dot, flexShrink: 0,
                    boxShadow: `0 0 0 3px ${st.bg}`,
                  }} />
                  <span style={S.orderId}>#{String(order.id).padStart(5, "0")}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 9px", borderRadius: 20,
                    fontSize: 11, fontWeight: 600,
                    color: st.color, background: st.bg, border: `1px solid ${st.border}`,
                  }}>
                    {st.icon} {st.label}
                  </span>
                </div>
                <div style={S.cardHeadRight}>
                  <span style={S.orderDate}>
                    <ICalendar />
                    {fmtDate(order.createdAt)}
                  </span>
                  <button onClick={() => toggle(order.id)} style={S.btnToggle}>
                    {open ? <IChevronU /> : <IChevron />}
                  </button>
                </div>
              </div>

              {/* ── Collapsed Preview ── */}
              {!open && (
                <div style={S.preview}>
                  <div style={S.previewImgs}>
                    {order.OrderItems?.slice(0, 4).map((item, i) => (
                      <img
                        key={i}
                        src={item.Product?.img}
                        alt={item.Product?.title}
                        style={S.previewImg}
                        onError={e => e.target.style.display = "none"}
                      />
                    ))}
                    {itemCount > 4 && (
                      <div style={S.previewMore}>+{itemCount - 4}</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.previewTitle}>
                      {order.OrderItems?.[0]?.Product?.title}
                      {itemCount > 1 && (
                        <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                          {" "}và {itemCount - 1} SP khác
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      {itemCount} sản phẩm
                    </div>
                  </div>
                  <div style={S.previewTotal}>{fmt(order.totalAmount)}</div>
                </div>
              )}

              {/* ── Expanded Detail ── */}
              {open && (
                <div style={S.expandBody}>
                  {/* Items */}
                  <div style={S.itemsList}>
                    {order.OrderItems?.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          ...S.itemRow,
                          borderBottom: i < itemCount - 1 ? "1px solid #f8fafc" : "none",
                        }}
                      >
                        <div style={S.itemImgWrap}>
                          <img
                            src={item.Product?.img}
                            alt={item.Product?.title}
                            style={S.itemImg}
                            onError={e => e.target.style.display = "none"}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={S.itemTitle}>{item.Product?.title}</div>
                          <div style={S.itemMeta}>{fmt(item.price)} × {item.quantity}</div>
                        </div>
                        <div style={S.itemSubtotal}>{fmt(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  {order.shippingName && (
                    <div style={S.shippingBox}>
                      <div style={S.shippingTitle}>Thông tin giao hàng</div>
                      <div style={S.shippingGrid}>
                        {[
                          { icon: <IUser />,   label: "Người nhận", value: order.shippingName    },
                          { icon: <IPhone />,  label: "Điện thoại", value: order.shippingPhone   },
                          { icon: <IMapPin />, label: "Địa chỉ",    value: order.shippingAddress },
                          { icon: <ICard />,   label: "Thanh toán", value: PAY[order.payMethod] || order.payMethod },
                        ].filter(r => r.value).map((row, j) => (
                          <div key={j} style={S.shippingRow}>
                            <span style={{ color: "#94a3b8", flexShrink: 0 }}>{row.icon}</span>
                            <span style={S.shippingLabel}>{row.label}</span>
                            <span style={S.shippingValue}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={S.cardFoot}>
                    <div style={S.totalWrap}>
                      <span style={S.totalLabel}>Tổng thanh toán</span>
                      <span style={S.totalAmount}>{fmt(order.totalAmount)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {order.status === "completed" && (
                        <button
                          onClick={() => navigate("/")}
                          style={S.btnReorder}
                        >
                          <IShop /> Mua lại
                        </button>
                      )}
                      {order.status === "pending" && (
                        <button onClick={() => cancelOrder(order.id)} style={S.btnCancel}>
                          <ITrash /> Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Load More ── */}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button
            onClick={() => fetchOrders(nextCursor)}
            disabled={loadingMore}
            style={S.btnLoadMore}
          >
            {loadingMore
              ? <><div style={S.spinSm} /> Đang tải...</>
              : <><IRefresh /> Xem thêm đơn hàng</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────── */
const S = {
  page: {
    maxWidth: 860,
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
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20,
    background: "#f8fafc", border: "2px dashed #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#cbd5e1",
  },

  /* Header */
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  pageIcon: {
    width: 46, height: 46, borderRadius: 13,
    background: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 14px rgba(220,38,38,0.28)",
  },
  pageTitle: { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 },
  pageSub:   { fontSize: 13, color: "#94a3b8", margin: "3px 0 0" },

  /* Stats */
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: "#fff", borderRadius: 12, padding: "14px 16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  },

  /* Filter */
  filterBar: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 20, color: "#94a3b8",
  },
  filterTabs: {
    display: "flex", gap: 6, flexWrap: "wrap",
  },
  filterTab: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 12px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", background: "#fff",
    color: "#64748b", fontSize: 12.5, fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  filterCount: {
    fontSize: 10, fontWeight: 700,
    padding: "1px 6px", borderRadius: 10,
  },

  /* List */
  list: { display: "flex", flexDirection: "column", gap: 12 },

  /* Card */
  card: {
    background: "#fff", borderRadius: 16,
    border: "1px solid #f1f5f9",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    overflow: "hidden",
    animation: "fadeUp 0.3s ease both",
  },
  cardHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px 18px",
    borderBottom: "1px solid #f8fafc",
    background: "#fafafa",
  },
  cardHeadLeft: { display: "flex", alignItems: "center", gap: 9 },
  cardHeadRight: { display: "flex", alignItems: "center", gap: 10 },
  orderId: { fontSize: 13.5, fontWeight: 700, color: "#0f172a" },
  orderDate: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, color: "#94a3b8",
  },

  /* Preview (collapsed) */
  preview: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 18px",
  },
  previewImgs: { display: "flex", gap: 6 },
  previewImg: {
    width: 42, height: 42, objectFit: "contain",
    borderRadius: 8, background: "#f8fafc",
    border: "1px solid #f1f5f9",
  },
  previewMore: {
    width: 42, height: 42, borderRadius: 8,
    background: "#f1f5f9", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 11, color: "#64748b", fontWeight: 600,
  },
  previewTitle: {
    fontSize: 13, color: "#374151", fontWeight: 500,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    maxWidth: 320,
  },
  previewTotal: {
    fontWeight: 800, color: "#dc2626", fontSize: 15, flexShrink: 0,
  },

  /* Expanded */
  expandBody: {},
  itemsList: { padding: "4px 18px 0" },
  itemRow: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "11px 0",
  },
  itemImgWrap: {
    width: 52, height: 52, borderRadius: 10,
    background: "#f8fafc", border: "1px solid #f1f5f9",
    overflow: "hidden", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  itemImg: { width: "100%", height: "100%", objectFit: "contain" },
  itemTitle: {
    fontSize: 13, fontWeight: 600, color: "#0f172a",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  itemMeta: { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  itemSubtotal: { fontSize: 13, fontWeight: 700, color: "#dc2626", flexShrink: 0 },

  /* Shipping */
  shippingBox: {
    margin: "12px 18px",
    padding: "14px 16px",
    background: "#fafafa", borderRadius: 11,
    border: "1px solid #f1f5f9",
  },
  shippingTitle: {
    fontSize: 11, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.08em",
    marginBottom: 10,
  },
  shippingGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 16px",
  },
  shippingRow: { display: "flex", alignItems: "flex-start", gap: 6 },
  shippingLabel: { fontSize: 12, color: "#94a3b8", flexShrink: 0 },
  shippingValue: { fontSize: 12, color: "#374151", fontWeight: 500 },

  /* Card Footer */
  cardFoot: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px 18px",
    borderTop: "1px solid #f8fafc",
    background: "#fafafa",
  },
  totalWrap: { display: "flex", alignItems: "baseline", gap: 8 },
  totalLabel: { fontSize: 13, color: "#64748b" },
  totalAmount: { fontSize: 20, fontWeight: 800, color: "#dc2626" },

  /* Buttons */
  btnToggle: {
    width: 30, height: 30, borderRadius: 8,
    background: "#f1f5f9", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#64748b",
  },
  btnRefresh: {
    width: 38, height: 38, borderRadius: 10,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#64748b",
  },
  btnCancel: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 9,
    border: "1.5px solid #fca5a5", background: "#fff",
    color: "#dc2626", fontSize: 13, cursor: "pointer",
    fontWeight: 500, fontFamily: "inherit",
  },
  btnReorder: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 9,
    border: "1.5px solid #bfdbfe", background: "#eff6ff",
    color: "#2563eb", fontSize: 13, cursor: "pointer",
    fontWeight: 500, fontFamily: "inherit",
  },
  btnPrimary: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 24px", borderRadius: 10,
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    color: "#fff", border: "none", fontSize: 14,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(220,38,38,0.3)",
  },
  btnLoadMore: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 24px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", background: "#fff",
    color: "#374151", fontSize: 13, fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
  },
  spinRing: {
    width: 36, height: 36,
    border: "3px solid #fee2e2",
    borderTopColor: "#dc2626",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  spinSm: {
    width: 14, height: 14,
    border: "2px solid #e2e8f0",
    borderTopColor: "#64748b",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
};

const CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .order-card:hover {
    box-shadow: 0 6px 24px rgba(0,0,0,0.08) !important;
  }
`;