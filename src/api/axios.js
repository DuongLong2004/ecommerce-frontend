import axios from "axios";

/*
 * baseURL ưu tiên đọc từ env VITE_API_URL (set ở Vercel cho production).
 * Fallback localhost:5000/api nếu chưa có env (dev local).
 *
 * Lưu ý: Vite chỉ inject env có prefix "VITE_" vào client bundle.
 *        Sửa env xong phải RESTART dev server (Vite không hot-reload env).
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * =========================
 * REQUEST INTERCEPTOR
 * - Gắn token nếu có
 * =========================
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ❗ Không gắn token nếu chưa đăng nhập
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * =========================
 * RESPONSE INTERCEPTOR
 * - Chỉ xử lý lỗi, KHÔNG đụng response
 *
 * Phần 8 update — Phân biệt 401 theo nguồn gốc:
 *   1. 401 từ /auth/login: SAI password (Phần 8 còn kèm attemptsRemaining)
 *      → KHÔNG xóa token, KHÔNG redirect — để Login.jsx tự xử lý hiển thị error
 *
 *   2. 401 từ API khác: token expired/invalid
 *      → Xóa token + redirect /login như cũ
 *
 *   3. 401 từ /auth/refresh: refresh token cũng hết hạn
 *      → Xóa token + redirect /login (logout hoàn toàn)
 *
 * @design Phân biệt bằng URL của request thay vì check trạng thái token
 *         vì cleaner và không phụ thuộc vào timing của localStorage.
 * =========================
 */

/**
 * Whitelist các endpoint auth — 401 từ những endpoint này là "expected error"
 * (login fail, register fail, etc.) — KHÔNG trigger logout/redirect.
 */
const AUTH_ENDPOINTS_NO_REDIRECT = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
];

/**
 * Check xem URL có thuộc whitelist không.
 * URL có thể là full URL hoặc path tương đối.
 */
const isAuthEndpoint = (url = "") => {
  return AUTH_ENDPOINTS_NO_REDIRECT.some((endpoint) => url.includes(endpoint));
};

axiosClient.interceptors.response.use(
  (response) => response, // 👈 giữ nguyên để login không lỗi
  (error) => {
    const status      = error.response?.status;
    const requestUrl  = error.config?.url || "";

    // ❌ 401 — Token sai / hết hạn HOẶC login fail
    if (status === 401) {
      /*
       * Phần 8: KHÔNG redirect/clear token nếu 401 đến từ auth endpoints
       * (login fail, register fail, forgot password fail, etc.).
       * Component xử lý error riêng (Login.jsx hiển thị banner countdown).
       */
      if (!isAuthEndpoint(requestUrl)) {
        // 401 từ API protected → token thật sự expired/invalid
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        // Tránh loop khi đang ở trang login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      // Nếu là auth endpoint → để component tự xử lý, KHÔNG làm gì thêm
    }

    // ❌ Không đủ quyền (giữ nguyên logic cũ)
    if (status === 403) {
      /*
       * 403 cũng có nhiều nguồn — cần check để KHÔNG alert sai chỗ:
       *   - 403 từ /auth/login: email chưa verify (đã có message từ BE)
       *   - 403 từ API khác: thiếu quyền truy cập
       */
      if (!isAuthEndpoint(requestUrl)) {
        alert("Bạn không có quyền truy cập chức năng này");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;