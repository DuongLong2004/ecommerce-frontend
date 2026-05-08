import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { changePassword } from "../../api/authApi";

/**
 * Trang đổi mật khẩu — yêu cầu user đã login.
 *
 * Phần 6 update: Hỗ trợ 2 modes:
 *   - MODE A — Đổi mật khẩu (user thường): user có password rồi
 *     → Hiển thị 3 fields: currentPassword + newPassword + confirmPassword
 *     → Header: "Đổi mật khẩu"
 *
 *   - MODE B — Đặt mật khẩu lần đầu (user Google-only): user.hasPassword = false
 *     → Hiển thị 2 fields: newPassword + confirmPassword (KHÔNG có currentPassword)
 *     → Header: "Đặt mật khẩu lần đầu"
 *     → Banner xanh giải thích lý do
 *     → Sau khi set, user có thể login cả 2 cách
 *
 * Cách phát hiện mode: đọc `user.hasPassword` từ localStorage.user
 *   - hasPassword === false → MODE B
 *   - else → MODE A
 *
 * Flow MODE A:
 *   1. User nhập currentPassword + newPassword + confirmPassword
 *   2. FE validate client-side
 *   3. POST /auth/change-password { currentPassword, newPassword }
 *   4. BE response trả về tokens MỚI → FE update localStorage (Option C)
 *
 * Flow MODE B:
 *   1. User nhập newPassword + confirmPassword (skip currentPassword)
 *   2. FE validate
 *   3. POST /auth/change-password { newPassword } (KHÔNG gửi currentPassword)
 *   4. BE thấy user.password=null → chấp nhận, hash + lưu password mới
 *   5. BE trả tokens + user.hasPassword=true → FE update localStorage
 *
 * @note localStorage keys consistency với toàn project:
 *   - "token"        ← access token
 *   - "refreshToken" ← refresh token
 *   - "user"         ← user info JSON (giờ có thêm field hasPassword)
 *   - "role"         ← role string (legacy)
 */
export default function ChangePassword() {
  const navigate = useNavigate();

  /*
   * Phần 6: Phát hiện user Google-only (chưa có password) để hiển thị MODE B.
   *
   * Đọc user từ localStorage:
   *   - hasPassword === false → MODE B (Google-only, set lần đầu)
   *   - else (true hoặc undefined) → MODE A (đổi password)
   *
   * Lý do default về MODE A: backward compat với user login từ trước
   * khi BE chưa trả hasPassword (user.hasPassword = undefined).
   */
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  // Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/hide password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Body class để hide app header/footer (giống các auth pages khác)
  useEffect(() => {
    document.body.classList.add("lx-page-active");
    return () => document.body.classList.remove("lx-page-active");
  }, []);

  // Check user đã login chưa + detect mode (MODE A vs MODE B)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    /*
     * Detect MODE B (Google-only user):
     *   user.hasPassword === false → MODE B
     *   user.hasPassword === true OR undefined → MODE A
     */
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.hasPassword === false) {
          setIsFirstTimeSetup(true);
        }
      }
    } catch {
      // Nếu parse user fail, default MODE A
    }
  }, [navigate]);

  // Countdown redirect sau khi success
  useEffect(() => {
    if (!success) return;

    if (countdown <= 0) {
      navigate("/", { replace: true });
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  // Password strength meter (đơn giản — match với passwordSchema BE)
  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "" };
    if (pw.length < 8) return { level: 1, label: "Quá ngắn", color: "bg-red-500" };
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    if (!hasLetter || !hasNumber)
      return { level: 2, label: "Yếu", color: "bg-orange-500" };
    if (pw.length < 12)
      return { level: 3, label: "Trung bình", color: "bg-yellow-500" };
    return { level: 4, label: "Mạnh", color: "bg-green-500" };
  };

  const strength = getPasswordStrength(newPassword);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    /*
     * Client-side validation — phân nhánh theo mode:
     *   - MODE A: cần currentPassword + newPassword + confirmPassword
     *   - MODE B: chỉ cần newPassword + confirmPassword
     */
    if (!isFirstTimeSetup && !currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError("Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 số");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    // Check newPassword khác currentPassword chỉ ở MODE A
    if (!isFirstTimeSetup && newPassword === currentPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    // Submit
    setLoading(true);
    try {
      /*
       * Phần 6: payload phân nhánh theo mode.
       *   - MODE A: gửi currentPassword + newPassword
       *   - MODE B: chỉ gửi newPassword (BE thấy user.password=null → OK)
       *
       * BE đã handle (Q3=B): nếu user.password=null thì skip verify currentPassword.
       */
      const payload = isFirstTimeSetup
        ? { newPassword }
        : { currentPassword, newPassword };

      const res = await changePassword(payload);

      /*
       * OPTION C: Backend trả về tokens MỚI sau khi đổi password thành công.
       * FE PHẢI update localStorage để giữ session.
       *
       * Sau khi set password lần đầu (MODE B), user.hasPassword=true
       * → lần sau vào /change-password sẽ thấy MODE A như user thường.
       */
      const { accessToken, refreshToken, user } = res.data.data || res.data;
      if (accessToken)  localStorage.setItem("token",        accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role) localStorage.setItem("role", user.role);
      }

      window.dispatchEvent(new Event("auth-changed"));
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message ||
        (isFirstTimeSetup
          ? "Đặt mật khẩu thất bại. Vui lòng thử lại."
          : "Đổi mật khẩu thất bại. Vui lòng thử lại.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER: SUCCESS STATE
  // ─────────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {isFirstTimeSetup
              ? "Đặt mật khẩu thành công! 🎉"
              : "Đổi mật khẩu thành công! 🎉"}
          </h2>

          <p className="text-gray-600 mb-2">
            {isFirstTimeSetup
              ? "Bây giờ bạn có thể đăng nhập bằng cả email/password và Google."
              : "Mật khẩu của bạn đã được cập nhật."}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tài khoản của bạn vẫn đang đăng nhập. Bạn không cần phải login lại.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              ⏱ Tự động chuyển về trang chủ sau <strong>{countdown}s</strong>...
            </p>
          </div>

          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Về trang chủ ngay
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // RENDER: FORM STATE
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex">

      {/* LEFT — Showcase orange/red */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              {isFirstTimeSetup ? (
                <>Đặt mật khẩu<br />đầu tiên 🔐</>
              ) : (
                <>Bảo mật<br />tài khoản 🔐</>
              )}
            </h1>
            <p className="text-white/90 text-lg leading-relaxed">
              {isFirstTimeSetup
                ? "Đặt mật khẩu cho tài khoản Google của bạn để có thêm 1 cách đăng nhập an toàn."
                : "Đổi mật khẩu định kỳ giúp tài khoản của bạn an toàn hơn trước các nguy cơ bảo mật."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Mã hóa bcrypt 12 rounds</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>
                {isFirstTimeSetup
                  ? "Vẫn giữ nguyên đăng nhập Google"
                  : "Tự động revoke token cũ"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Không cần login lại</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
          </Link>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isFirstTimeSetup ? "Đặt mật khẩu lần đầu" : "Đổi mật khẩu"}
          </h2>
          <p className="text-gray-500 mb-6">
            {isFirstTimeSetup
              ? "Tạo mật khẩu cho tài khoản Google của bạn"
              : "Nhập mật khẩu hiện tại và mật khẩu mới của bạn"}
          </p>

          {/* Banner cho MODE B (Google-only user) */}
          {isFirstTimeSetup && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <span className="text-2xl">🔐</span>
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-1">
                    Tài khoản Google của bạn chưa có mật khẩu
                  </p>
                  <p className="text-blue-700 leading-relaxed">
                    Đặt mật khẩu để có thể đăng nhập bằng email/password
                    (vẫn giữ được đăng nhập Google).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/*
             * Current Password — chỉ hiển thị ở MODE A (user thường).
             * MODE B (Google-only) skip field này.
             */}
            {!isFirstTimeSetup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showCurrent ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isFirstTimeSetup ? "Mật khẩu" : "Mật khẩu mới"}
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  placeholder="Tối thiểu 8 ký tự, 1 chữ + 1 số"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showNew ? "🙈" : "👁"}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= strength.level ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Độ mạnh: <span className="font-semibold">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isFirstTimeSetup ? "Xác nhận mật khẩu" : "Xác nhận mật khẩu mới"}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Mật khẩu không khớp
                </p>
              )}
            </div>

            {/* Security note — khác nhau giữa MODE A và MODE B */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <p className="font-semibold mb-1">🔒 Lưu ý bảo mật:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {isFirstTimeSetup ? (
                  <>
                    <li>Sau khi đặt, bạn có thể login bằng email/password HOẶC Google</li>
                    <li>Tài khoản Google vẫn được liên kết bình thường</li>
                  </>
                ) : (
                  <>
                    <li>Các thiết bị khác (nếu có) sẽ bị đăng xuất tự động</li>
                    <li>Thiết bị hiện tại sẽ <strong>vẫn giữ session</strong></li>
                  </>
                )}
              </ul>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? (isFirstTimeSetup ? "Đang đặt mật khẩu..." : "Đang đổi mật khẩu...")
                : (isFirstTimeSetup ? "Đặt mật khẩu" : "Đổi mật khẩu")}
            </button>

            {/* Forgot password link — chỉ hiển thị ở MODE A */}
            {!isFirstTimeSetup && (
              <p className="text-center text-sm text-gray-600">
                Quên mật khẩu hiện tại?{" "}
                <Link to="/forgot-password" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Đặt lại qua email
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}