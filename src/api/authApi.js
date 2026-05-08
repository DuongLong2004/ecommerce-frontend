import axiosClient from "./axios";

/* ═══════════════════════════════════════════════════════════
   AUTHENTICATION API
   ═══════════════════════════════════════════════════════════ */

/**
 * Đăng ký tài khoản mới — endpoint chuẩn auth flow.
 * BE sẽ generate verification token và gửi email verify.
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password
 */
export const register = (data) => {
  return axiosClient.post("/auth/register", data);
};

/**
 * Đăng nhập.
 *
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 *
 * @returns {Promise<{data: {accessToken, refreshToken, user}}>}
 *
 * @throws {403} Nếu email chưa verify → FE hiển thị nút "Gửi lại email xác thực"
 */
export const login = (data) => {
  return axiosClient.post("/auth/login", data);
};

/**
 * Gửi lại email xác thực (cho user chưa verify).
 *
 * @param {string} email
 *
 * @returns {Promise<{data: null}>} Luôn 200 (anti-enumeration)
 */
export const resendVerification = (email) => {
  return axiosClient.post("/auth/resend-verification", { email });
};

/* ═══════════════════════════════════════════════════════════
   FORGOT / RESET PASSWORD (Phần 3)
   ═══════════════════════════════════════════════════════════ */

/**
 * Yêu cầu đặt lại mật khẩu — gửi email reset cho user.
 *
 * BE luôn return 200 kể cả khi:
 *   - Email không tồn tại trong DB
 *   - User chưa verify email
 *   - Email gửi thành công
 * → Anti-enumeration: FE chỉ hiển thị message chung
 *   "Nếu email tồn tại, link reset đã được gửi".
 *
 * Rate limit BE: 3 requests / 15 phút / IP.
 *
 * @param {string} email
 * @returns {Promise<{data: null}>}
 */
export const forgotPassword = (email) => {
  return axiosClient.post("/auth/forgot-password", { email });
};

/**
 * Đặt lại mật khẩu mới với token từ email.
 *
 * Sau khi reset thành công, BE clear ALL refresh tokens
 * → user phải login lại trên TẤT CẢ devices.
 *
 * @param {Object} payload
 * @param {string} payload.token       - Token từ URL ?token=xxx
 * @param {string} payload.newPassword - Min 8 ký tự, có chữ + số
 *
 * @returns {Promise<{data: {email}}>}
 *
 * @throws {400} Token invalid/expired hoặc password không hợp lệ
 */
export const resetPassword = ({ token, newPassword }) => {
  return axiosClient.post("/auth/reset-password", { token, newPassword });
};

/* ═══════════════════════════════════════════════════════════
   CHANGE PASSWORD (Phần 4 — update Phần 6)
   ═══════════════════════════════════════════════════════════ */

/**
 * Đổi mật khẩu khi user đã login.
 *
 * Phần 6 update: `currentPassword` là OPTIONAL.
 *   - User có password (đăng ký thường): BẮT BUỘC nhập currentPassword
 *   - User Google-only (password=null): KHÔNG cần currentPassword (set lần đầu)
 *
 * @param {Object} payload
 * @param {string} [payload.currentPassword] - Optional: omit nếu Google-only user
 * @param {string} payload.newPassword
 * @returns {Promise<{data: {accessToken, refreshToken, user}}>}
 *
 * @note Sau khi đổi thành công, FE PHẢI update localStorage với
 *       accessToken + refreshToken MỚI từ response để giữ session.
 *       Nếu không update → request tiếp theo sẽ fail vì token cũ
 *       đã bị revoke ở backend.
 */
export const changePassword = ({ currentPassword, newPassword }) => {
  return axiosClient.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
};

/* ═══════════════════════════════════════════════════════════
   GOOGLE OAUTH (Phần 6)
   ═══════════════════════════════════════════════════════════ */

/**
 * Đăng nhập / Đăng ký bằng Google OAuth.
 *
 * Flow:
 *   1. FE dùng useGoogleLogin() từ @react-oauth/google
 *   2. User click → popup Google → user chọn account
 *   3. Google trả về `credential` (ID token JWT)
 *   4. FE gọi function này, gửi credential lên BE
 *   5. BE verify ID token với Google → login/register user
 *   6. BE trả tokens → FE lưu localStorage + redirect home
 *
 * @param {string} credential - Google ID token (JWT) từ @react-oauth/google
 * @returns {Promise<{data: {accessToken, refreshToken, user, isNewUser}}>}
 *
 * @throws {401} Credential không hợp lệ hoặc đã hết hạn
 * @throws {403} Google chưa xác thực email
 * @throws {429} Quá nhiều lần thử (rate limit 10/15min)
 */
export const googleLogin = (credential) => {
  return axiosClient.post("/auth/google", { credential });
};