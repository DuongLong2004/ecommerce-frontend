import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin } from "../../api/authApi";

/* ═══════════════════════════════════════════════════════════
   ICONS — line-style, stroke 1.6
   ═══════════════════════════════════════════════════════════ */
const IcMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IcLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="11" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IcEyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const IcEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.5A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.5C3.6 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.3 4.3-.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const IcWarn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-px">
    <circle cx="12" cy="12" r="9.5" stroke="#dc2626" strokeWidth="1.6" />
    <line x1="12" y1="7.5" x2="12" y2="13" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1" fill="#dc2626" />
  </svg>
);
const IcArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcSpark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 6.4L20 10l-6.2 1.6L12 18l-1.8-6.4L4 10l6.2-1.6L12 2z" />
  </svg>
);


/* ═══════════════════════════════════════════════════════════
   HELPERS — Account Lockout (Phần 8)
   ═══════════════════════════════════════════════════════════ */

/**
 * Format milliseconds → "MM:SS" cho countdown timer.
 * VD: 75000ms → "01:15"
 */
const formatCountdown = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

/**
 * Tính ms còn lại đến thời điểm unlockTime.
 * Trả về 0 nếu đã hết hạn.
 */
const getRemainingMs = (unlockTimeISO) => {
  if (!unlockTimeISO) return 0;
  const remaining = new Date(unlockTimeISO).getTime() - Date.now();
  return Math.max(0, remaining);
};

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */
const EXTRA_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap');

body.lx-page-active{overflow:hidden}
body.lx-page-active header,
body.lx-page-active footer,
body.lx-page-active nav.navbar,
body.lx-page-active .header,
body.lx-page-active .footer,
body.lx-page-active .app-header,
body.lx-page-active .app-footer,
body.lx-page-active .site-header,
body.lx-page-active .site-footer,
body.lx-page-active .main-header,
body.lx-page-active .main-footer{display:none!important}

.font-inter{font-family:'Inter',system-ui,-apple-system,sans-serif;font-feature-settings:"ss01","cv11"}
.font-fraunces{font-family:'Fraunces',Georgia,serif;font-feature-settings:"ss01"}

@keyframes lxFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes lxShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
@keyframes lxFloat{0%,100%{transform:translate(-50%,-50%) rotate(-3deg)}50%{transform:translate(-50%,-58%) rotate(-3deg)}}
@keyframes lxFloatBadge1{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-12px) rotate(0)}}
@keyframes lxFloatBadge2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes lxPulseDot{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:1;transform:scale(1)}}
@keyframes lxGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

.animate-lx-fade-up{animation:lxFadeUp .55s both}
.animate-lx-fade-up-1{animation:lxFadeUp .55s .05s both}
.animate-lx-fade-up-2{animation:lxFadeUp .55s .1s both}
.animate-lx-fade-up-3{animation:lxFadeUp .55s .15s both}
.animate-lx-fade-up-hero{animation:lxFadeUp .7s .1s both}
.animate-lx-fade-up-stats{animation:lxFadeUp .7s .25s both}
.animate-lx-shake{animation:lxShake .45s cubic-bezier(.36,.07,.19,.97)}
.animate-lx-float{animation:lxFloat 6s ease-in-out infinite}
.animate-lx-float-b1{animation:lxFloatBadge1 7s ease-in-out infinite}
.animate-lx-float-b2{animation:lxFloatBadge2 8s ease-in-out infinite}
.animate-lx-pulse-dot{animation:lxPulseDot 2s ease-in-out infinite}

.lx-grad-text{
  background:linear-gradient(120deg,#fecaca 0%,#ef4444 50%,#fecaca 100%);
  background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;color:transparent;
  animation:lxGrad 6s ease-in-out infinite;
}

.lx-show-bg::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background-image:
    radial-gradient(circle at 20% 30%,rgba(220,38,38,.18) 0%,transparent 50%),
    radial-gradient(circle at 80% 70%,rgba(239,68,68,.12) 0%,transparent 55%);
}
.lx-show-bg::after{
  content:'';position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
  background-size:48px 48px;
  -webkit-mask-image:radial-gradient(circle at 50% 50%,black 30%,transparent 80%);
  mask-image:radial-gradient(circle at 50% 50%,black 30%,transparent 80%);
}

.lx-form-bg::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(rgba(0,0,0,.04) 1px,transparent 1px);
  background-size:32px 32px;
  -webkit-mask-image:radial-gradient(circle at 50% 50%,black 0%,transparent 70%);
  mask-image:radial-gradient(circle at 50% 50%,black 0%,transparent 70%);
}

.lx-btn-shine::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%);
}

.lx-bat-dot::after{
  content:'';position:absolute;inset:1px;background:#1a0606;border-radius:1px;
}

.lx-cb-input:checked + .lx-cb-box{
  background:#dc2626;border-color:#dc2626;
  box-shadow:0 2px 6px rgba(220,38,38,.3);
}
.lx-cb-box svg{opacity:0;transition:opacity .15s}
.lx-cb-input:checked + .lx-cb-box svg{opacity:1}
.lx-cb-input:focus-visible + .lx-cb-box{outline:2px solid #dc2626;outline-offset:2px}

.lx-iw:focus-within .lx-ico{color:#dc2626}
.lx-inp{caret-color:#dc2626}

/*
 * Wrapper cho <GoogleLogin> component:
 *   Library tự render iframe với button Google chuẩn —
 *   mình overlay button custom trên top để giữ style đồng bộ.
 *   Cách trick: làm iframe của Google trong suốt + position absolute,
 *   button của mình hiển thị bên dưới với pointer-events: none để
 *   click xuyên qua xuống iframe.
 */
.lx-google-wrap{position:relative;width:100%}
.lx-google-wrap > div:first-child{
  position:absolute;inset:0;width:100%;height:100%;
  opacity:0;z-index:2;
}
.lx-google-wrap > div:first-child > div{
  width:100%!important;height:100%!important;
}
.lx-google-wrap > div:first-child iframe{
  width:100%!important;height:100%!important;
  color-scheme:normal;
}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}

@media (max-width:1024px){
  .lx-phone-mobile{
    position:relative!important;right:auto!important;top:auto!important;transform:none!important;
    width:100%!important;height:240px!important;margin:24px auto 0!important;
  }
}
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [errKey, setErrKey] = useState(0);
  /*
   * Phầnn Account Lockout state.
   *
   * lockInfo: thông tin lock từ BE response 423
   *   - lockedUntil: ISO string thời điểm hết khoá
   *   - message: text BE gửi về
   *   → khi có giá trị → hiển thị banner đỏ với countdown
   *
   * remainingMs: số ms còn lại đến khi unlock (update mỗi giây)
   *
   * attemptsRemaining: số lần còn lại trước khi bị khoá (BE gửi khi 401)
   *   - Hiển thị warning màu cam khi <= 2 (tức là user đã sai 3-4 lần)
   */
  const [lockInfo, setLockInfo] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const navigate = useNavigate();

  /*
   * Guard chống StrictMode chạy callback 2 lần.
   * Cũng dùng để tránh user click Google nhiều lần liên tiếp.
   */
  const googleProcessingRef = useRef(false);

  useEffect(() => {
    document.body.classList.add("lx-page-active");
    return () => document.body.classList.remove("lx-page-active");
  }, []);

  /*
   * Phần Countdown timer cho account lockout.
   *
   * Khi lockInfo được set:
   *   1. Tính remaining ngay lập tức
   *   2. Set interval update mỗi giây
   *   3. Khi hết thời gian → clear lockInfo (cho user thử lại)
   *
   * Cleanup: clear interval khi component unmount hoặc lockInfo thay đổi
   * → tránh memory leak.
   */
  useEffect(() => {
    if (!lockInfo?.lockedUntil) {
      setRemainingMs(0);
      return;
    }

    // Update lần đầu ngay lập tức (không đợi 1s)
    const updateRemaining = () => {
      const ms = getRemainingMs(lockInfo.lockedUntil);
      setRemainingMs(ms);

      if (ms <= 0) {
        // Hết thời gian khoá → clear state để user thử lại
        setLockInfo(null);
        setAttemptsRemaining(null);
      }
    };

    updateRemaining();
    const intervalId = setInterval(updateRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [lockInfo]);

  /*
   * Helper: Lưu tokens vào localStorage và dispatch event auth-changed.
   * Dùng chung cho cả login thường và Google login.
   */
  const persistAuthAndRedirect = (data) => {
    ["token", "role", "user", "refreshToken"].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  /*
   * Phần 8 — handleSubmit với account lockout handling.
   *
   * BE có 3 loại error response:
   *   1. 423 Locked: Account đang bị khoá (đã sai 5 lần trước đó hoặc vừa lock)
   *      → response.data có { message, lockedUntil, minutesRemaining }
   *      → set lockInfo để trigger countdown banner
   *
   *   2. 401 Unauthorized + attemptsRemaining: Sai password, chưa lock
   *      → response.data có { message, attemptsRemaining }
   *      → set attemptsRemaining để hiển thị warning nếu <= 2
   *
   *   3. Các error khác (400, 403, 500): hiển thị message thường như cũ
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Block submit nếu đang trong thời gian lock
    if (lockInfo && remainingMs > 0) return;

    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password: pw });
      const data = res?.data?.data;
      if (!data?.accessToken || !data?.user) throw new Error("Phản hồi không hợp lệ");

      // Login thành công → clear hết state lockout
      setLockInfo(null);
      setAttemptsRemaining(null);
      persistAuthAndRedirect(data);
    } catch (err) {
      const status   = err.response?.status;
      const respData = err.response?.data;

      if (status === 423) {
        /*
         * Account locked — set lockInfo để trigger countdown banner.
         * BE gửi lockedUntil dưới dạng ISO string trong field error.
         * Body response từ AppError: { success: false, message, lockedUntil, minutesRemaining }
         */
        setLockInfo({
          lockedUntil: respData?.lockedUntil,
          message:     respData?.message || "Tài khoản tạm thời bị khoá.",
        });
        setAttemptsRemaining(null); // Clear warning vì đã lock rồi
        setError(""); // Không hiển thị error thường, dùng banner countdown thay
      } else if (status === 401 && typeof respData?.attemptsRemaining === "number") {
        /*
         * Sai password, chưa lock — hiển thị error + warning attemptsRemaining.
         */
        setAttemptsRemaining(respData.attemptsRemaining);
        setError(respData?.message || "Email hoặc mật khẩu không chính xác");
      } else {
        // Các error khác (400, 403, 500, network error...)
        setAttemptsRemaining(null);
        setError(respData?.message || err.message || "Đăng nhập thất bại");
      }

      setErrKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Phần 6: Google OAuth callback success.
   *
   * @param {Object} response
   * @param {string} response.credential - Google ID token (JWT)
   *                                       BE verify được trực tiếp.
   *
   * Flow:
   *   1. User click Google button → popup → chọn account
   *   2. Google trả về object { credential, ... }
   *   3. FE gọi BE qua googleLogin(credential)
   *   4. BE verify ID token → trả tokens + user
   *   5. FE persist + redirect home
   */
  const handleGoogleSuccess = async (response) => {
    if (googleProcessingRef.current) return;
    googleProcessingRef.current = true;

    setError("");
    setGoogleLoading(true);
    try {
      const res = await googleLogin(response.credential);
      const data = res?.data?.data;
      if (!data?.accessToken || !data?.user) {
        throw new Error("Phản hồi không hợp lệ từ server");
      }
      persistAuthAndRedirect(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập Google thất bại. Vui lòng thử lại."
      );
      setErrKey((k) => k + 1);
    } finally {
      setGoogleLoading(false);
      googleProcessingRef.current = false;
    }
  };

  const handleGoogleError = () => {
    setError("Đăng nhập Google bị hủy hoặc thất bại. Vui lòng thử lại.");
    setErrKey((k) => k + 1);
  };

  return (
    <>
      <style>{EXTRA_CSS}</style>

      <div className="font-inter fixed inset-0 z-[9999] w-full h-screen overflow-y-auto bg-[#fafaf7]">
        <div className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr] grid-cols-1 bg-[#fafaf7] relative overflow-hidden">

          {/* ════════════════════════════════════════════
              LEFT — SHOWCASE
              ════════════════════════════════════════════ */}
          <aside
            className="lx-show-bg relative overflow-hidden text-white flex flex-col justify-between
                       px-5 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10
                       bg-[linear-gradient(135deg,#1a0606_0%,#2a0c0c_35%,#3a1010_70%,#1a0606_100%)]"
          >
            <div className="relative z-[2] flex items-center justify-between">
              <div className="flex items-center gap-[11px]">
                <div
                  className="font-fraunces w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[11px]
                             bg-gradient-to-br from-[#ef4444] to-[#991b1b]
                             flex items-center justify-center
                             font-semibold text-lg sm:text-xl text-white italic tracking-tighter
                             shadow-[0_4px_16px_rgba(220,38,38,.4),inset_0_1px_0_rgba(255,255,255,.2)]"
                >
                  L
                </div>
                <div className="flex flex-col leading-[1.05]">
                  <span className="font-fraunces text-base sm:text-lg font-medium tracking-tight">
                    LongtyJR Phone
                  </span>
                  <span className="text-[9px] sm:text-[9.5px] font-semibold tracking-[.22em] uppercase text-[rgba(252,165,165,.7)] mt-[3px]">
                    Official Store
                  </span>
                </div>
              </div>

              <a
                href="/"
                className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium
                           text-white/55 hover:text-white no-underline
                           px-3 py-[7px] sm:px-[14px] sm:py-[9px] rounded-full
                           border border-white/10 hover:border-white/20
                           hover:bg-white/[.04] transition-all duration-[250ms]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Trang chủ
              </a>
            </div>

            <div className="relative z-[2] max-w-[520px] animate-lx-fade-up-hero">
              <div
                className="inline-flex items-center gap-2 mb-[18px] sm:mb-6
                           pl-[6px] pr-[11px] py-[5px] sm:pl-2 sm:pr-3 sm:py-1.5 rounded-full
                           bg-[rgba(220,38,38,.12)] border border-[rgba(239,68,68,.25)]
                           text-[10px] sm:text-[11px] font-semibold text-[#fca5a5]
                           tracking-[.08em] uppercase"
              >
                <span className="w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center text-white">
                  <IcSpark />
                </span>
                Bộ sưu tập 2026
              </div>

              <h1 className="font-fraunces font-normal text-[clamp(34px,4.6vw,64px)] leading-[1.02] tracking-[-.035em] text-white mb-[14px] sm:mb-[18px]">
                Smartphone
                <br />
                <em className="not-italic font-medium lx-grad-text" style={{ fontStyle: "italic" }}>
                  thượng hạng
                </em>
                <br />
                trong tầm tay.
              </h1>

              <p className="text-sm sm:text-base leading-[1.65] text-white/55 max-w-[440px] font-normal">
                Khám phá những mẫu điện thoại mới nhất từ Apple, Samsung và Xiaomi —
                giao hàng tận nơi trong 2 giờ tại Hà Nội & TP.HCM.
              </p>
            </div>

            <div
              className="lx-phone-mobile pointer-events-none
                         absolute right-[-40px] top-1/2 -translate-y-1/2 z-[1]
                         w-[380px] h-[540px]
                         max-lg:!relative max-lg:!right-auto max-lg:!top-auto max-lg:!translate-y-0
                         max-lg:!w-full max-lg:!h-[200px] sm:max-lg:!h-[240px] max-lg:mt-5 sm:max-lg:mt-6"
              aria-hidden="true"
            >
              <div
                className="hidden sm:flex absolute z-[2] pointer-events-none top-[8%] right-[18%] max-lg:top-[6%] max-lg:right-[8%]
                           items-center gap-[9px] px-[14px] py-[11px] max-lg:px-[11px] max-lg:py-2
                           rounded-2xl bg-white/[.08] backdrop-blur-md
                           border border-white/[.14]
                           animate-lx-float-b1"
              >
                <div className="w-[30px] h-[30px] max-lg:w-6 max-lg:h-6 rounded-lg flex items-center justify-center
                                bg-gradient-to-br from-[rgba(34,197,94,.3)] to-[rgba(16,185,129,.2)]
                                border border-[rgba(34,197,94,.3)] text-[#86efac]">
                  <IcCheck />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-[1.2]">Đã giao 1.247 đơn</div>
                  <div className="text-[9.5px] text-white/50 mt-px">Hôm nay</div>
                </div>
              </div>

              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                           rotate-[-3deg]
                           w-[140px] h-[240px] sm:w-[160px] sm:h-[280px] lg:w-[230px] lg:h-[470px]
                           rounded-[32px] lg:rounded-[42px]
                           bg-[linear-gradient(145deg,#2a2a2a_0%,#0a0a0a_100%)]
                           shadow-[0_0_0_2px_#1a1a1a,0_0_0_4px_#2a2a2a,0_50px_100px_rgba(0,0,0,.6),0_30px_60px_rgba(220,38,38,.15)]
                           animate-lx-float"
              >
                <div className="absolute top-[10px] lg:top-[14px] left-1/2 -translate-x-1/2
                                w-[64px] h-[18px] lg:w-[90px] lg:h-6 rounded-full bg-black z-[3]" />

                <div className="absolute inset-[6px] lg:inset-2 rounded-[26px] lg:rounded-[34px] overflow-hidden
                                bg-[linear-gradient(160deg,#fef2f2_0%,#fee2e2_50%,#fecaca_100%)]">
                  <span className="absolute top-[13px] lg:top-[18px] left-[18px] lg:left-6
                                   text-[10px] lg:text-[13px] font-semibold text-[#1a0606] z-[2] font-inter">
                    9:41
                  </span>
                  <div className="absolute top-[13px] lg:top-[18px] right-[18px] lg:right-[22px] flex gap-1 items-center z-[2]">
                    <div className="lx-bat-dot relative w-[11px] h-[6px] lg:w-[14px] lg:h-[7px] border border-[#1a0606] rounded-[2px]" />
                  </div>

                  <div className="px-[14px] lg:px-[22px] pt-[38px] lg:pt-[54px] pb-[14px] lg:pb-[22px] flex flex-col gap-[9px] lg:gap-[14px]">
                    <div className="font-fraunces text-[15px] lg:text-[22px] text-[#1a0606] font-medium tracking-tight leading-[1.1]">
                      Xin chào,
                      <br />
                      <em className="text-[#dc2626]">An.</em>
                    </div>

                    <div className="bg-white rounded-xl lg:rounded-[18px] p-[9px] lg:p-[14px]
                                    shadow-[0_8px_24px_rgba(220,38,38,.08)]
                                    flex items-center gap-2 lg:gap-[11px]">
                      <div className="w-8 h-8 lg:w-[46px] lg:h-[46px] rounded-[9px] lg:rounded-xl shrink-0
                                      bg-gradient-to-br from-[#1a1a1a] to-[#3a3a3a]
                                      flex items-center justify-center
                                      font-fraunces italic font-semibold text-white text-[13px] lg:text-lg">
                        i
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9.5px] lg:text-[11.5px] font-semibold text-[#1a0606] leading-[1.2] mb-[3px]">
                          iPhone 17 Pro Max
                        </div>
                        <div className="text-[11px] lg:text-[13px] font-bold text-[#dc2626] font-fraunces">
                          34.990.000₫
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl lg:rounded-[18px] p-[9px] lg:p-[14px]
                                    shadow-[0_8px_24px_rgba(220,38,38,.08)]
                                    flex items-center gap-2 lg:gap-[11px]">
                      <div className="w-8 h-8 lg:w-[46px] lg:h-[46px] rounded-[9px] lg:rounded-xl shrink-0
                                      bg-gradient-to-br from-[#1e40af] to-[#3b82f6]
                                      flex items-center justify-center
                                      font-fraunces italic font-semibold text-white text-[13px] lg:text-lg">
                        S
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9.5px] lg:text-[11.5px] font-semibold text-[#1a0606] leading-[1.2] mb-[3px]">
                          Galaxy S26 Ultra
                        </div>
                        <div className="text-[11px] lg:text-[13px] font-bold text-[#dc2626] font-fraunces">
                          29.490.000₫
                        </div>
                      </div>
                    </div>

                    <span className="self-start text-[7.5px] lg:text-[9px] font-bold text-white
                                     bg-gradient-to-br from-[#dc2626] to-[#991b1b]
                                     px-[6px] lg:px-[9px] py-[2px] lg:py-[3px] rounded-full tracking-[.05em]">
                      ⚡ Giao trong 2h
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="hidden sm:flex absolute z-[2] pointer-events-none bottom-[14%] right-[8%] max-lg:bottom-[8%] max-lg:right-[6%]
                           items-center gap-[9px] px-[14px] py-[11px] max-lg:px-[11px] max-lg:py-2
                           rounded-2xl bg-white/[.08] backdrop-blur-md
                           border border-white/[.14]
                           animate-lx-float-b2"
              >
                <div className="flex gap-[1.5px] text-[#fbbf24] text-[11px] leading-none">★★★★★</div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-[1.2]">4.9 / 5.0</div>
                  <div className="text-[9.5px] text-white/50 mt-px">12,840 đánh giá</div>
                </div>
              </div>
            </div>

            <div className="relative z-[2] animate-lx-fade-up-stats">
              <div className="grid grid-cols-3 gap-[10px] sm:gap-4 lg:gap-6 pt-5 sm:pt-6 lg:pt-7 border-t border-white/[.08]">
                <div>
                  <div className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-none mb-[5px]">
                    50K<em className="text-[#fca5a5] font-normal">+</em>
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] text-white/45 tracking-wide">Khách hàng</div>
                </div>
                <div>
                  <div className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-none mb-[5px]">
                    2<em className="text-[#fca5a5] font-normal">h</em>
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] text-white/45 tracking-wide">Giao hàng</div>
                </div>
                <div>
                  <div className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-none mb-[5px]">
                    4.9<em className="text-[#fca5a5] font-normal">★</em>
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] text-white/45 tracking-wide">Đánh giá</div>
                </div>
              </div>

              <div className="hidden sm:flex mt-[18px] lg:mt-6 items-center gap-[18px]
                              text-[10px] text-white/30 tracking-[.18em] uppercase font-medium">
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="flex items-center gap-[18px]">
                  <span className="font-fraunces text-sm italic text-white/50 tracking-tight normal-case">Apple</span>
                  <span className="font-fraunces text-sm italic text-white/50 tracking-tight normal-case">Samsung</span>
                  <span className="font-fraunces text-sm italic text-white/50 tracking-tight normal-case">Xiaomi</span>
                  <span className="font-fraunces text-sm italic text-white/50 tracking-tight normal-case">OPPO</span>
                </div>
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          </aside>

          {/* ════════════════════════════════════════════
              RIGHT — FORM
              ════════════════════════════════════════════ */}
          <main className="lx-form-bg bg-[#fafaf7] flex flex-col relative overflow-y-auto
                           px-5 py-7 sm:px-10 sm:py-8 lg:px-14 lg:py-10">

            <div className="flex justify-end items-center gap-2 text-[12.5px] sm:text-[13.5px] text-[#71717a] relative z-[1]">
              Chưa có tài khoản?&nbsp;
              <a
                href="/register"
                className="text-[#dc2626] hover:text-[#991b1b] hover:underline underline-offset-[3px] no-underline font-semibold transition-colors"
              >
                Đăng ký miễn phí →
              </a>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-[440px] w-full mx-auto relative z-[1] py-5 sm:py-10">

              <div className="inline-flex items-center gap-2 mb-[10px] sm:mb-[14px]
                              text-[10.5px] sm:text-[11px] font-semibold text-[#dc2626]
                              tracking-[.18em] uppercase animate-lx-fade-up-1">
                <span className="w-6 h-px bg-[#dc2626]" />
                <span>Đăng nhập tài khoản</span>
              </div>

              <h2 className="font-fraunces font-normal text-[clamp(30px,3.6vw,46px)] tracking-[-.03em] leading-[1.05] text-[#0a0a0a] mb-[10px] sm:mb-3 animate-lx-fade-up-2">
                Chào mừng <em className="text-[#dc2626] font-medium">trở lại</em>.
              </h2>

              <p className="text-sm sm:text-[15px] text-[#71717a] leading-[1.6] mb-[26px] sm:mb-9 animate-lx-fade-up-3">
                Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng của bạn.
              </p>

              {/*
                Phần 8 — Account Lockout Banner (PRIORITY 1)
                Hiển thị khi BE trả 423: countdown timer đếm ngược từng giây.
                Disable cả form input + submit button khi banner active.
              */}
              {lockInfo && remainingMs > 0 && (
                <div
                  key={`lock-${errKey}`}
                  role="alert"
                  className="mb-[22px] rounded-[12px] overflow-hidden
                             bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]
                             border-[1.5px] border-[#fca5a5]
                             shadow-[0_4px_16px_rgba(220,38,38,.12)]
                             animate-lx-shake"
                >
                  <div className="flex items-start gap-3 px-4 py-[14px]">
                    <div className="w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center
                                    bg-gradient-to-br from-[#dc2626] to-[#991b1b] text-white
                                    shadow-[0_2px_8px_rgba(220,38,38,.3)]">
                      <IcLock />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[#991b1b] mb-[3px] leading-[1.3]">
                        Tài khoản tạm thời bị khoá
                      </div>
                      <div className="text-[12.5px] text-[#7f1d1d] leading-[1.5]">
                        Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau:
                      </div>
                    </div>
                  </div>

                  {/* Countdown box — số to, đậm, đếm ngược từng giây */}
                  <div className="bg-white/60 backdrop-blur-sm border-t border-[#fca5a5]/40
                                  px-4 py-[14px] flex items-center justify-center gap-[10px]">
                    <span className="text-[#dc2626]">
                      <IcClock />
                    </span>
                    <span className="font-fraunces text-[28px] font-semibold text-[#991b1b]
                                     tracking-[.05em] leading-none tabular-nums">
                      {formatCountdown(remainingMs)}
                    </span>
                    <span className="text-[11.5px] font-semibold text-[#991b1b]/70
                                     tracking-[.15em] uppercase mt-[6px]">
                      Còn lại
                    </span>
                  </div>

                 <div className="px-4 py-[10px] bg-[#fff5f5] border-t border-[#fca5a5]/30
                                  text-[11.5px] text-[#991b1b]/80 leading-[1.5]">
                    💡 Quên mật khẩu? Hãy dùng chức năng{" "}
                    <a
                      href="/forgot-password"
                      className="text-[#dc2626] font-semibold hover:underline underline-offset-[2px] no-underline"
                    >
                      Quên mật khẩu
                    </a>{" "}
                    để đặt lại sau khi tài khoản được mở khoá.
                  </div>
                </div>
              )}

              {/*
                Phần 8 — Warning Attempts Remaining (PRIORITY 2)
                Hiển thị khi user còn <= 2 lần thử (đã sai 3-4 lần).
                Chỉ hiển thị khi KHÔNG đang lock (lockInfo null).
              */}
              {!lockInfo && attemptsRemaining !== null && attemptsRemaining <= 2 && attemptsRemaining > 0 && (
                <div
                  key={`warn-${errKey}`}
                  role="alert"
                  className="flex items-start gap-[11px] mb-[22px]
                             bg-[#fffbeb] border-[1.5px] border-[#fcd34d] border-l-[3px] border-l-[#f59e0b]
                             rounded-[10px] px-4 py-[13px]
                             text-[13px] text-[#92400e] leading-[1.5]
                             animate-lx-shake"
                >
                  <span className="text-[#f59e0b] shrink-0 mt-px">
                    <IcWarn />
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold mb-[2px]">
                      ⚠️ Cảnh báo bảo mật
                    </div>
                    <div className="text-[12.5px]">
                      Bạn còn <strong className="text-[#dc2626]">{attemptsRemaining} lần thử</strong> trước khi tài khoản bị tạm khoá 15 phút.
                    </div>
                  </div>
                </div>
              )}

              {/*
                Error thường (PRIORITY 3) — hiển thị khi không có lock + không có warning.
                Giữ nguyên style cũ.
              */}
              {!lockInfo && error && (attemptsRemaining === null || attemptsRemaining > 2) && (
                <div
                  key={errKey}
                  role="alert"
                  className="flex items-start gap-[11px] mb-[22px]
                             bg-[#fff1f2] border border-[#fecaca] border-l-[3px] border-l-[#dc2626]
                             rounded-[10px] px-4 py-[13px]
                             text-[13.5px] text-[#991b1b] leading-[1.5]
                             animate-lx-shake"
                >
                  <IcWarn />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4 sm:mb-[18px]">
                  <div className="flex items-center justify-between mb-[9px]">
                    <label htmlFor="lx-email" className="text-xs font-semibold text-[#27272a] tracking-wide">
                      Email
                    </label>
                  </div>
                  <div className="lx-iw relative">
                    <span className="lx-ico absolute left-4 sm:left-[18px] top-1/2 -translate-y-1/2 flex text-[#a1a1aa] pointer-events-none transition-colors">
                      <IcMail />
                    </span>
                    <input
                      id="lx-email"
                      type="email"
                      autoComplete="email"
                      placeholder="ban@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="lx-inp w-full h-[52px] sm:h-[54px] bg-white
                                 border-[1.5px] border-[#e4e4e7] rounded-xl sm:rounded-[13px]
                                 pl-[46px] sm:pl-[50px] pr-4 sm:pr-[18px]
                                 font-inter text-base sm:text-[15px] font-medium text-[#0a0a0a]
                                 outline-none transition-all duration-200
                                 placeholder:text-[#c4c4c7] placeholder:font-normal
                                 hover:border-[#d4d4d8]
                                 focus:border-[#dc2626] focus:shadow-[0_0_0_4px_rgba(220,38,38,.08),0_4px_12px_rgba(220,38,38,.06)]"
                    />
                  </div>
                </div>

                <div className="mb-4 sm:mb-[18px]">
                  <div className="flex items-center justify-between mb-[9px]">
                    <label htmlFor="lx-pw" className="text-xs font-semibold text-[#27272a] tracking-wide">
                      Mật khẩu
                    </label>
                    <a
                      href="/forgot-password"
                      className="text-[12.5px] font-medium text-[#dc2626] hover:text-[#991b1b] hover:underline underline-offset-[3px] no-underline transition-colors"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="lx-iw relative">
                    <span className="lx-ico absolute left-4 sm:left-[18px] top-1/2 -translate-y-1/2 flex text-[#a1a1aa] pointer-events-none transition-colors">
                      <IcLock />
                    </span>
                    <input
                      id="lx-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      required
                      className="lx-inp w-full h-[52px] sm:h-[54px] bg-white
                                 border-[1.5px] border-[#e4e4e7] rounded-xl sm:rounded-[13px]
                                 pl-[46px] sm:pl-[50px] pr-[52px]
                                 font-inter text-base sm:text-[15px] font-medium text-[#0a0a0a]
                                 outline-none transition-all duration-200
                                 placeholder:text-[#c4c4c7] placeholder:font-normal
                                 hover:border-[#d4d4d8]
                                 focus:border-[#dc2626] focus:shadow-[0_0_0_4px_rgba(220,38,38,.08),0_4px_12px_rgba(220,38,38,.06)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-1 sm:right-[6px] top-1/2 -translate-y-1/2
                                 bg-transparent border-none cursor-pointer
                                 w-10 h-10 sm:w-[38px] sm:h-[38px] rounded-[9px]
                                 text-[#a1a1aa] hover:text-[#3f3f46] hover:bg-[#f4f4f5]
                                 flex items-center justify-center
                                 transition-colors duration-200
                                 focus-visible:outline-2 focus-visible:outline-[#dc2626] focus-visible:outline-offset-1"
                    >
                      {showPw ? <IcEyeOff /> : <IcEyeOn />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-[9px] text-[13px] text-[#52525b] font-medium cursor-pointer select-none mb-6 w-fit">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="lx-cb-input absolute opacity-0 pointer-events-none"
                  />
                  <span className="lx-cb-box w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-[#d4d4d8] bg-white
                                   flex items-center justify-center text-white shrink-0 transition-all duration-[180ms]">
                    <IcCheck />
                  </span>
                  Ghi nhớ đăng nhập trên thiết bị này
                </label>

                <button
                  type="submit"
                  disabled={loading || googleLoading || (lockInfo && remainingMs > 0)}
                  className="lx-btn-shine relative w-full h-[54px] sm:h-14 border-none rounded-[13px] sm:rounded-2xl
                             font-inter text-sm sm:text-[14.5px] font-semibold tracking-wide text-white cursor-pointer
                             bg-[linear-gradient(135deg,#dc2626_0%,#b91c1c_100%)]
                             shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_4px_0_#7f1d1d,0_8px_24px_rgba(220,38,38,.35)]
                             transition-[transform,box-shadow,opacity] duration-[140ms]
                             flex items-center justify-center gap-[9px]
                             overflow-hidden mb-[26px]
                             enabled:hover:-translate-y-px
                             enabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_5px_0_#7f1d1d,0_12px_32px_rgba(220,38,38,.45)]
                             enabled:active:translate-y-[3px]
                             enabled:active:shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_1px_0_#7f1d1d,0_3px_8px_rgba(220,38,38,.3)]
                             disabled:opacity-70 disabled:cursor-not-allowed
                             group"
                >
                  {loading ? (
                    <>
                      <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : lockInfo && remainingMs > 0 ? (
                    <>
                      <span className="opacity-80">
                        <IcLock />
                      </span>
                      <span>Tạm khoá · Thử lại sau {formatCountdown(remainingMs)}</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <span className="transition-transform duration-[250ms] group-hover:translate-x-1">
                        <IcArrow />
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* OR divider */}
              <div className="flex items-center gap-[14px] mb-[18px]">
                <div className="flex-1 h-px bg-[#e4e4e7]" />
                <span className="text-[11px] text-[#a1a1aa] font-semibold tracking-[.18em]">HOẶC TIẾP TỤC VỚI</span>
                <div className="flex-1 h-px bg-[#e4e4e7]" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] mb-8">
                {/*
                 * Google login button — Phần 6.
                 * Wrapper trick:
                 *   - <GoogleLogin /> render iframe Google (button chính thức)
                 *   - Iframe absolute đặt lên trên, opacity:0 (nhìn không thấy nhưng vẫn click được)
                 *   - Button custom của mình hiển thị bên dưới với style đồng bộ
                 *   → User thấy button đẹp, click vào "thực ra" là click iframe Google
                 */}
                <div className="lx-google-wrap h-12 sm:h-[50px] rounded-xl overflow-hidden">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    width="440"
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                  />
                  <button
                    type="button"
                    disabled={loading || googleLoading}
                    className="w-full h-full rounded-xl bg-white border-[1.5px] border-[#e4e4e7]
                               flex items-center justify-center gap-[9px]
                               font-inter text-[13.5px] font-semibold text-[#27272a]
                               transition-all duration-200
                               enabled:hover:border-[#d4d4d8] enabled:hover:-translate-y-px enabled:hover:shadow-[0_6px_16px_rgba(0,0,0,.06)]
                               enabled:active:translate-y-0
                               disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ pointerEvents: "none" }}
                  >
                    {googleLoading ? (
                      <>
                        <span className="w-[16px] h-[16px] border-2 border-[#dc2626]/30 border-t-[#dc2626] rounded-full animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                      </>
                    )}
                  </button>
                </div>

                {/* Facebook — placeholder cho Phần 7 */}
                <button
                  type="button"
                  disabled
                  title="Tính năng Facebook đang được phát triển"
                  className="h-12 sm:h-[50px] rounded-xl bg-white border-[1.5px] border-[#e4e4e7]
                             flex items-center justify-center gap-[9px]
                             font-inter text-[13.5px] font-semibold text-[#27272a]
                             transition-all duration-200
                             opacity-50 cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

            <div className="relative z-[1] flex flex-col sm:flex-row justify-between sm:items-center
                            gap-[10px] sm:gap-0 text-xs text-[#a1a1aa]
                            pt-[18px] sm:pt-5 border-t border-[#ececec]">
              <div className="flex items-center gap-[6px]">
                <span className="w-[5px] h-[5px] rounded-full bg-[#22c55e] animate-lx-pulse-dot" />
                <span>Hệ thống an toàn · SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-[14px]">
                <a href="/terms" className="text-[#71717a] hover:text-[#27272a] no-underline transition-colors">Điều khoản</a>
                <a href="/privacy" className="text-[#71717a] hover:text-[#27272a] no-underline transition-colors">Bảo mật</a>
                <a href="/help" className="text-[#71717a] hover:text-[#27272a] no-underline transition-colors">Trợ giúp</a>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}