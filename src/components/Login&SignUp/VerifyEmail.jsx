import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axios";

/* ═══════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════ */
const IcCheck = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth="2" />
    <path d="M8 12.5l2.5 2.5L16 9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IcError = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2" />
    <line x1="12" y1="7" x2="12" y2="13" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1.2" fill="#dc2626" />
  </svg>
);

const IcArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  /*
   * BUG FIX: React StrictMode trong development gọi useEffect 2 lần
   * → API verify bị gọi 2 lần với cùng token
   * → Lần 1: verify thành công, BE clear token
   * → Lần 2: token đã NULL trong DB → BE trả "Token không hợp lệ"
   * → setStatus("error") override state success → user thấy FAIL
   *
   * Solution: Dùng useRef để track call đã thực hiện chưa.
   * useRef KHÔNG bị reset khi StrictMode unmount + remount component
   * → Chặn được call thứ 2.
   */
  const hasCalledRef = useRef(false);

  // Effect 1: Gọi API verify khi component mount
  useEffect(() => {
    // Guard: Chỉ gọi 1 lần duy nhất
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    if (!token) {
      setStatus("error");
      setErrorMessage(
        "Link xác thực không hợp lệ. Vui lòng kiểm tra email và thử lại."
      );
      return;
    }

    const verifyToken = async () => {
      try {
        await axiosClient.get(`/auth/verify-email?token=${token}&format=json`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
            "Có lỗi xảy ra khi xác thực email. Vui lòng thử lại."
        );
      }
    };

    verifyToken();
  }, [token]);

  // Effect 2: Countdown khi success → auto redirect /login
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">

        {/* ═══════ VERIFYING ═══════ */}
        {status === "verifying" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#dc2626] rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Đang xác thực email...
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Vui lòng đợi trong giây lát. ⏳
            </p>
          </>
        )}

        {/* ═══════ SUCCESS ═══════ */}
        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <IcCheck />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              🎉 Xác thực thành công!
            </h1>
            <p className="text-gray-600 leading-relaxed mb-2">
              Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Tự động chuyển hướng sau{" "}
              <span className="font-bold text-[#dc2626]">{countdown}</span> giây...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              Đăng nhập ngay
              <IcArrow />
            </Link>
          </>
        )}

        {/* ═══════ ERROR ═══════ */}
        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <IcError />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Xác thực thất bại
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              {errorMessage}
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                Đăng ký lại
                <IcArrow />
              </Link>

              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline transition-colors"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}