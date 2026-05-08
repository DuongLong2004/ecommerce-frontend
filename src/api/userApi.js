import axiosClient from "./axios";

/* ═══════════════════════════════════════════════════════════
   USER API (legacy)
   ═══════════════════════════════════════════════════════════ */

/**
 * Đăng ký tài khoản — wrapper gọi /auth/register.
 *
 * @deprecated Dùng `register` từ `./authApi.js` thay vì file này.
 *             Giữ lại để tương thích với code cũ. Sẽ remove ở Phần 9+.
 */
export const register = (data) => {
  return axiosClient.post("/auth/register", data);
};

/**
 * Đăng nhập — wrapper gọi /auth/login.
 *
 * @deprecated Dùng `login` từ `./authApi.js` thay vì file này.
 */
export const login = (data) => {
  return axiosClient.post("/auth/login", data);
};