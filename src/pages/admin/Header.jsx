import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

/* ── Icons ── */
const IBell = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IGear = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IChevronRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const ICheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ITrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IRefresh = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ── Page map ── */
const PAGE_NAMES = {
  "/admin":           "Dashboard",
  "/admin/users":     "Người dùng",
  "/admin/products":  "Sản phẩm",
  "/admin/orders":    "Đơn hàng",
  "/admin/analytics": "Thống kê",
  "/admin/reviews":   "Đánh giá",
  "/admin/settings":  "Cài đặt",
};

/* ── Notification types ── */
const NOTIF_TYPES = {
  order:   { color: "#dc2626", bg: "#fef2f2", label: "Đơn hàng" },
  user:    { color: "#2563eb", bg: "#eff6ff", label: "Người dùng" },
  review:  { color: "#d97706", bg: "#fffbeb", label: "Đánh giá" },
  system:  { color: "#16a34a", bg: "#f0fdf4", label: "Hệ thống" },
  product: { color: "#7c3aed", bg: "#f5f3ff", label: "Sản phẩm" },
};

/* ── Mock fallback notifications (when API unavailable) ── */
const MOCK_NOTIFS = [
  { id: 1, type: "order",   title: "Đơn hàng #4821 mới",       body: "Khách hàng vừa đặt đơn 2.4tr đ",   time: "2 phút trước",  read: false },
  { id: 2, type: "user",    title: "Tài khoản mới đăng ký",    body: "nguyen.minh@gmail.com vừa tham gia", time: "14 phút trước", read: false },
  { id: 3, type: "review",  title: "Đánh giá 1★ cần xử lý",   body: "Sản phẩm Áo Polo – cần phản hồi",   time: "1 giờ trước",   read: false },
  { id: 4, type: "system",  title: "Backup hoàn tất",           body: "Dữ liệu đã được sao lưu thành công", time: "3 giờ trước",   read: true  },
  { id: 5, type: "product", title: "Sản phẩm sắp hết hàng",   body: "Giày Sneaker XR còn 3 sản phẩm",   time: "5 giờ trước",   read: true  },
];

/* ── Fetch notifications ──
   Replace API_URL with your real endpoint.
   Expected shape: [{ id, type, title, body, time, read }]
   Falls back to MOCK_NOTIFS on error. ── */
const API_URL = null; // e.g. "https://yourapi.com/api/admin/notifications"
const POLL_INTERVAL_MS = 30_000; // auto-reload every 30s

async function fetchNotifications() {
  if (!API_URL) return MOCK_NOTIFS;
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}` },
  });
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

async function markReadAPI(id) {
  if (!API_URL) return;
  await fetch(`${API_URL}/${id}/read`, { method: "PATCH" }).catch(() => {});
}

async function deleteNotifAPI(id) {
  if (!API_URL) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" }).catch(() => {});
}

/* ═══════════════════════════════════════════════════
   HEADER COMPONENT
═══════════════════════════════════════════════════ */
export default function Header({ onMenuToggle, isMobile = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = PAGE_NAMES[location.pathname] || "Admin";

  /* Clock */
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });

  /* Notifications */
  const [notifs, setNotifs]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [spinning, setSpinning]       = useState(false);
  const [panelOpen, setPanelOpen]     = useState(false);
  const panelRef                      = useRef(null);
  const bellRef                       = useRef(null);

  const unread = notifs.filter(n => !n.read).length;

  const loadNotifs = useCallback(async (showSpin = false) => {
    if (showSpin) setSpinning(true);
    try {
      const data = await fetchNotifications();
      setNotifs(data);
    } catch (_) {
      setNotifs(MOCK_NOTIFS);
    } finally {
      setLoading(false);
      if (showSpin) setTimeout(() => setSpinning(false), 400);
    }
  }, []);

  /* Initial load + polling */
  useEffect(() => {
    loadNotifs();
    const poll = setInterval(() => loadNotifs(), POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [loadNotifs]);

  /* Close panel on outside click */
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current  && !bellRef.current.contains(e.target)
      ) setPanelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  /* Mark one read */
  const markRead = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markReadAPI(id);
  };

  /* Mark all read */
  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    if (API_URL) {
      await fetch(`${API_URL}/read-all`, { method: "PATCH" }).catch(() => {});
    }
  };

  /* Delete one */
  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    setNotifs(prev => prev.filter(n => n.id !== id));
    await deleteNotifAPI(id);
  };

  return (
    <>
      <style>{CSS}</style>
      <header className="hd-root">

        {/* LEFT */}
        <div className="hd-left">
          <button className="hd-hamburger" onClick={onMenuToggle} aria-label="Mở menu">
            <IMenu />
          </button>
          <div className="hd-breadcrumb">
            <button className="hd-bc-home" onClick={() => navigate("/admin")}>Admin</button>
            <span className="hd-bc-sep"><IChevronRight /></span>
            <span className="hd-bc-current">{pageName}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hd-right">
          {/* Clock */}
          {!isMobile && (
            <div className="hd-clock">
              <IClock />
              <div className="hd-clock-inner">
                <span className="hd-clock-time">{timeStr}</span>
                <span className="hd-clock-date">{dateStr}</span>
              </div>
            </div>
          )}

          <div className="hd-divider" />

          {/* Bell */}
          <div style={{ position: "relative" }}>
            <button
              ref={bellRef}
              className={`hd-btn${panelOpen ? " hd-btn-active" : ""}`}
              onClick={() => setPanelOpen(o => !o)}
              aria-label="Thông báo"
              title="Thông báo"
            >
              <IBell />
              {unread > 0 && (
                <span className="hd-badge">{unread > 9 ? "9+" : unread}</span>
              )}
            </button>

            {/* Notification Panel */}
            {panelOpen && (
              <div className="hd-panel" ref={panelRef} role="dialog" aria-label="Thông báo">
                {/* Panel header */}
                <div className="hd-panel-top">
                  <div className="hd-panel-title">
                    Thông báo
                    {unread > 0 && <span className="hd-panel-count">{unread}</span>}
                  </div>
                  <div className="hd-panel-actions">
                    <button
                      className={`hd-panel-action${spinning ? " hd-spinning" : ""}`}
                      onClick={() => loadNotifs(true)}
                      title="Tải lại"
                    >
                      <IRefresh />
                    </button>
                    {unread > 0 && (
                      <button className="hd-panel-action" onClick={markAllRead} title="Đánh dấu tất cả đã đọc">
                        <ICheck />
                      </button>
                    )}
                    <button className="hd-panel-action" onClick={() => setPanelOpen(false)} title="Đóng">
                      <IX />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="hd-panel-list">
                  {loading ? (
                    <div className="hd-panel-empty">
                      <div className="hd-loader" />
                      Đang tải...
                    </div>
                  ) : notifs.length === 0 ? (
                    <div className="hd-panel-empty">Không có thông báo nào</div>
                  ) : (
                    notifs.map(n => {
                      const meta = NOTIF_TYPES[n.type] || NOTIF_TYPES.system;
                      return (
                        <div
                          key={n.id}
                          className={`hd-notif-item${n.read ? " hd-notif-read" : ""}`}
                          onClick={() => markRead(n.id)}
                        >
                          <span
                            className="hd-notif-dot-left"
                            style={{ background: n.read ? "transparent" : "#dc2626" }}
                          />
                          <div className="hd-notif-body">
                            <div className="hd-notif-row">
                              <span
                                className="hd-notif-tag"
                                style={{ color: meta.color, background: meta.bg }}
                              >
                                {meta.label}
                              </span>
                              <span className="hd-notif-time">{n.time}</span>
                              <button
                                className="hd-notif-del"
                                onClick={(e) => deleteNotif(n.id, e)}
                                title="Xóa"
                              >
                                <ITrash />
                              </button>
                            </div>
                            <p className="hd-notif-title">{n.title}</p>
                            <p className="hd-notif-desc">{n.body}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="hd-panel-footer">
                  <button className="hd-panel-footer-btn" onClick={() => { navigate("/admin/notifications"); setPanelOpen(false); }}>
                    Xem tất cả thông báo →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          {!isMobile && (
            <button
              className="hd-btn"
              onClick={() => navigate("/admin/settings")}
              title="Cài đặt"
              aria-label="Cài đặt"
            >
              <IGear />
            </button>
          )}
        </div>
      </header>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

/* ── Root ── */
.hd-root {
  height: 60px;
  background: linear-gradient(135deg, #9b1c1c 0%, #dc2626 50%, #b91c1c 100%);
  border-bottom: 1px solid rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 16px rgba(185,28,28,0.35);
  font-family: 'DM Sans', sans-serif;
  flex-shrink: 0;
}

/* subtle shimmer line at top */
.hd-root::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1.5px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 35%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 65%, transparent 100%);
}

/* ── Left ── */
.hd-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* ── Hamburger ── */
.hd-hamburger {
  display: none;
  width: 36px; height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.22);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  flex-shrink: 0;
  padding: 0;
  transition: background 0.15s;
}
.hd-hamburger:hover { background: rgba(255,255,255,0.22); }

/* ── Breadcrumb ── */
.hd-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}
.hd-bc-home {
  font-size: 13px;
  color: rgba(255,255,255,0.65);
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  padding: 0;
  transition: color 0.15s;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.hd-bc-home:hover { color: #fff; }
.hd-bc-sep {
  color: rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.hd-bc-current {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
}

/* ── Right ── */
.hd-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ── Clock ── */
.hd-clock {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 6px;
  color: rgba(255,255,255,0.6);
}
.hd-clock-inner {
  display: flex;
  flex-direction: column;
  line-height: 1;
}
.hd-clock-time {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
.hd-clock-date {
  font-size: 10px;
  color: rgba(255,255,255,0.58);
  margin-top: 2px;
  letter-spacing: 0.06em;
}

/* ── Divider ── */
.hd-divider {
  width: 1px;
  height: 22px;
  background: rgba(255,255,255,0.2);
  flex-shrink: 0;
}

/* ── Icon buttons ── */
.hd-btn {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.88);
  position: relative;
  transition: background 0.15s, border-color 0.15s, transform 0.12s;
  padding: 0;
  flex-shrink: 0;
}
.hd-btn:hover {
  background: rgba(255,255,255,0.22);
  border-color: rgba(255,255,255,0.35);
  color: #fff;
}
.hd-btn:active { transform: scale(0.95); }
.hd-btn-active {
  background: rgba(255,255,255,0.28) !important;
  border-color: rgba(255,255,255,0.45) !important;
}

/* ── Notification badge ── */
.hd-badge {
  position: absolute;
  top: -5px; right: -5px;
  min-width: 17px; height: 17px;
  padding: 0 4px;
  border-radius: 20px;
  background: #fff;
  color: #dc2626;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #dc2626;
  line-height: 1;
  font-family: 'DM Sans', sans-serif;
  animation: badge-pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes badge-pop {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}

/* ── Notification Panel ── */
.hd-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 360px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06);
  z-index: 200;
  overflow: hidden;
  animation: panel-in 0.2s cubic-bezier(0.22,1,0.36,1);
  font-family: 'DM Sans', sans-serif;
}
@keyframes panel-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* panel arrow */
.hd-panel::before {
  content: '';
  position: absolute;
  top: -6px; right: 14px;
  width: 12px; height: 12px;
  background: #fff;
  border-left: 1px solid #f0f0f0;
  border-top: 1px solid #f0f0f0;
  transform: rotate(45deg);
  border-radius: 2px;
}

.hd-panel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid #f5f5f5;
}
.hd-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  display: flex;
  align-items: center;
  gap: 7px;
}
.hd-panel-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px; height: 20px;
  padding: 0 5px;
  border-radius: 20px;
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.hd-panel-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.hd-panel-action {
  width: 28px; height: 28px;
  border: none;
  background: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: background 0.12s, color 0.12s;
  padding: 0;
}
.hd-panel-action:hover {
  background: #f3f4f6;
  color: #374151;
}
.hd-spinning svg {
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Notification list ── */
.hd-panel-list {
  max-height: 340px;
  overflow-y: auto;
  scroll-behavior: smooth;
}
.hd-panel-list::-webkit-scrollbar { width: 4px; }
.hd-panel-list::-webkit-scrollbar-track { background: transparent; }
.hd-panel-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.hd-panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 16px;
  color: #9ca3af;
  font-size: 13px;
}
.hd-loader {
  width: 20px; height: 20px;
  border: 2px solid #f3f4f6;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.hd-notif-item {
  display: flex;
  align-items: flex-start;
  padding: 11px 14px;
  gap: 10px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid #fafafa;
  position: relative;
}
.hd-notif-item:hover { background: #fafafa; }
.hd-notif-item:hover .hd-notif-del { opacity: 1; }
.hd-notif-read { opacity: 0.65; }

.hd-notif-dot-left {
  width: 6px; height: 6px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
  transition: background 0.2s;
}
.hd-notif-body { flex: 1; min-width: 0; }
.hd-notif-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}
.hd-notif-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}
.hd-notif-time {
  font-size: 11px;
  color: #9ca3af;
  flex: 1;
}
.hd-notif-del {
  opacity: 0;
  width: 22px; height: 22px;
  border: none;
  background: none;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: opacity 0.15s, background 0.12s, color 0.12s;
  padding: 0;
  flex-shrink: 0;
}
.hd-notif-del:hover { background: #fee2e2; color: #dc2626; }
.hd-notif-title {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 2px;
}
.hd-notif-desc {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* ── Panel footer ── */
.hd-panel-footer {
  padding: 10px 14px;
  border-top: 1px solid #f5f5f5;
}
.hd-panel-footer-btn {
  width: 100%;
  padding: 8px;
  border: 1.5px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  letter-spacing: 0.01em;
}
.hd-panel-footer-btn:hover {
  background: #fef2f2;
  border-color: rgba(220,38,38,0.25);
}

/* ── Responsive ── */
@media (max-width: 767px) {
  .hd-hamburger { display: flex !important; }
  .hd-panel {
    width: calc(100vw - 24px);
    right: -8px;
  }
}
@media (max-width: 480px) {
  .hd-root { padding: 0 14px; }
  .hd-bc-current { font-size: 15px; }
}
`;