import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  listSessions,
  revokeSession,
  revokeOtherSessions,
} from "../api/sessionApi";

/**
 * Trang Quản lý phiên đăng nhập (Phần 5 — Multi-device session).
 *
 * Features:
 *   - List tất cả sessions của user kèm metadata (device name, IP, lastActive)
 *   - Highlight session "Hiện tại" với badge xanh
 *   - Logout 1 device cụ thể (button trên từng row)
 *   - Logout all OTHER devices (button đầu trang)
 *   - Auto-refresh list sau mỗi action
 *   - Loading states + error handling
 *
 * @design Card layout cho từng device, responsive cho mobile.
 *         Theme đỏ/cam matching brand LongtyJR.
 */
export default function Sessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  // Action states
  const [revokingId, setRevokingId] = useState(null);  // deviceId đang revoke
  const [revokingAll, setRevokingAll] = useState(false);

  // Confirm modal state
  const [confirmAction, setConfirmAction] = useState(null);
  // confirmAction = { type: 'revoke' | 'revokeOthers', deviceId?, deviceName? }

  // ═══════════════════════════════════════════════════════════════
  // AUTH GUARD: Redirect nếu chưa login
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ═══════════════════════════════════════════════════════════════
  // FETCH SESSIONS
  // ═══════════════════════════════════════════════════════════════
  const fetchSessions = async () => {
    try {
      setError("");
      const res = await listSessions();
      setSessions(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tải danh sách thiết bị";
      setError(msg);

      // Nếu 401, token đã expire → đẩy về login
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  const handleRevoke = async (deviceId) => {
    setRevokingId(deviceId);
    setError("");
    try {
      await revokeSession(deviceId);
      await fetchSessions(); // Refresh list
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng xuất thiết bị thất bại";
      setError(msg);
    } finally {
      setRevokingId(null);
      setConfirmAction(null);
    }
  };

  const handleRevokeOthers = async () => {
    setRevokingAll(true);
    setError("");
    try {
      await revokeOtherSessions();
      await fetchSessions();
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng xuất các thiết bị khác thất bại";
      setError(msg);
    } finally {
      setRevokingAll(false);
      setConfirmAction(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Format relative time: "Vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước"
   */
  const formatRelativeTime = (isoString) => {
    if (!isoString) return "—";
    const diff = Date.now() - new Date(isoString).getTime();
    const sec  = Math.floor(diff / 1000);
    const min  = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day  = Math.floor(hour / 24);

    if (sec  < 60)  return "Vừa xong";
    if (min  < 60)  return `${min} phút trước`;
    if (hour < 24)  return `${hour} giờ trước`;
    if (day  < 30)  return `${day} ngày trước`;
    return new Date(isoString).toLocaleDateString("vi-VN");
  };

  /**
   * Format IP cho UX. Local IP (::1, 127.0.0.1) → "Localhost".
   */
  const formatIp = (ip) => {
    if (!ip) return "—";
    if (ip === "::1" || ip === "127.0.0.1") return "Localhost";
    return ip;
  };

  /**
   * Pick icon dựa vào device name.
   */
  const getDeviceIcon = (deviceName = "") => {
    const n = deviceName.toLowerCase();
    if (n.includes("iphone") || n.includes("ios"))     return "📱";
    if (n.includes("android"))                          return "📱";
    if (n.includes("mac"))                              return "💻";
    if (n.includes("windows"))                          return "🖥️";
    if (n.includes("linux"))                            return "🐧";
    return "💻";
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 text-sm transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Về trang chủ
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">Thiết bị đăng nhập</h1>
              <p className="text-white/90 text-sm">
                Quản lý các thiết bị đang đăng nhập vào tài khoản của bạn.
                Đăng xuất khỏi thiết bị bạn không còn sử dụng để bảo mật tài khoản.
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="inline-block w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500">Đang tải danh sách thiết bị...</p>
          </div>
        ) : (
          <>
            {/* Action bar */}
            {otherSessionsCount > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Bạn đang đăng nhập trên <strong>{sessions.length}</strong> thiết bị
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Có {otherSessionsCount} thiết bị khác ngoài thiết bị hiện tại
                  </p>
                </div>
                <button
                  onClick={() => setConfirmAction({ type: "revokeOthers" })}
                  disabled={revokingAll}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-medium text-sm rounded-lg transition disabled:opacity-50"
                >
                  🚪 Đăng xuất tất cả thiết bị khác
                </button>
              </div>
            )}

            {/* Session list */}
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <p className="text-gray-500">Không có thiết bị nào đang đăng nhập</p>
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.deviceId}
                    className={`bg-white rounded-2xl shadow-sm p-5 transition-all ${
                      s.isCurrent ? "ring-2 ring-orange-400" : "hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        s.isCurrent ? "bg-orange-100" : "bg-gray-100"
                      }`}>
                        {getDeviceIcon(s.deviceName)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-800">
                            {s.deviceName}
                          </h3>
                          {s.isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                              Đang dùng
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-500 space-y-0.5">
                          <p>
                            <span className="text-gray-400">IP: </span>
                            {formatIp(s.ip)}
                          </p>
                          <p>
                            <span className="text-gray-400">Hoạt động lần cuối: </span>
                            {formatRelativeTime(s.lastActive)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Đăng nhập: {new Date(s.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      {/* Action button */}
                      {!s.isCurrent && (
                        <button
                          onClick={() => setConfirmAction({
                            type:       "revoke",
                            deviceId:   s.deviceId,
                            deviceName: s.deviceName,
                          })}
                          disabled={revokingId === s.deviceId}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition disabled:opacity-50 flex-shrink-0"
                        >
                          {revokingId === s.deviceId ? "Đang xử lý..." : "Đăng xuất"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Security note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">🔒 Mẹo bảo mật:</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-700">
            <li>Nếu thấy thiết bị lạ, hãy đăng xuất khỏi nó ngay lập tức</li>
            <li>Sau đó đổi mật khẩu để bảo vệ tài khoản</li>
            <li>Mỗi phiên đăng nhập tự động hết hạn sau 7 ngày không hoạt động</li>
          </ul>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* CONFIRM MODAL                                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-center text-gray-800 mb-2">
              {confirmAction.type === "revoke"
                ? "Đăng xuất thiết bị này?"
                : "Đăng xuất tất cả thiết bị khác?"}
            </h3>

            <p className="text-sm text-gray-600 text-center mb-6">
              {confirmAction.type === "revoke"
                ? `Thiết bị "${confirmAction.deviceName}" sẽ bị đăng xuất ngay lập tức.`
                : `Tất cả ${otherSessionsCount} thiết bị khác sẽ bị đăng xuất. Thiết bị hiện tại của bạn vẫn được giữ nguyên.`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === "revoke") {
                    handleRevoke(confirmAction.deviceId);
                  } else {
                    handleRevokeOthers();
                  }
                }}
                disabled={revokingId !== null || revokingAll}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {revokingId !== null || revokingAll ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}