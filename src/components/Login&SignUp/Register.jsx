import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { register } from "../../api/userApi";
import { googleLogin } from "../../api/authApi";

/* ═══════════════════════════════════════════════════════════
   ICONS — line-style, stroke 1.6
   ═══════════════════════════════════════════════════════════ */
const IcUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
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
const IcLockCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="11" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M9.5 16.5l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
const IcWarnSmall = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
    <line x1="12" y1="7.5" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
  </svg>
);
const IcSuccess = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-px">
    <circle cx="12" cy="12" r="9.5" stroke="#16a34a" strokeWidth="1.6" />
    <path d="M8 12.5l2.5 2.5L16 9" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
const IcSpark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 6.4L20 10l-6.2 1.6L12 18l-1.8-6.4L4 10l6.2-1.6L12 2z" />
  </svg>
);
const IcGift = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 12h18M12 8v13" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 8s-2-5-5-5a2.5 2.5 0 0 0 0 5h5zM12 8s2-5 5-5a2.5 2.5 0 0 1 0 5h-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const IcTruck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M2 7h11v10H2zM13 11h5l3 3v3h-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const IcShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2.5l8 3v6.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V5.5l8-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   PASSWORD STRENGTH HELPER
   ═══════════════════════════════════════════════════════════ */
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Yếu" };
  if (score <= 2) return { level: 2, label: "Trung bình" };
  return { level: 3, label: "Mạnh" };
}

/* ═══════════════════════════════════════════════════════════
   EXTRA CSS — chỉ những thứ Tailwind không làm trực tiếp
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
@keyframes lxFloatBadge1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes lxFloatBadge2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes lxPulseDot{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:1;transform:scale(1)}}
@keyframes lxGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes lxBarFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}

.animate-lx-fade-up-1{animation:lxFadeUp .55s .05s both}
.animate-lx-fade-up-2{animation:lxFadeUp .55s .1s both}
.animate-lx-fade-up-3{animation:lxFadeUp .55s .15s both}
.animate-lx-fade-up-4{animation:lxFadeUp .55s .2s both}
.animate-lx-fade-up-5{animation:lxFadeUp .55s .25s both}
.animate-lx-fade-up-6{animation:lxFadeUp .55s .3s both}
.animate-lx-fade-up-7{animation:lxFadeUp .55s .35s both}
.animate-lx-fade-up-hero{animation:lxFadeUp .7s .1s both}
.animate-lx-fade-up-stats{animation:lxFadeUp .7s .25s both}
.animate-lx-shake{animation:lxShake .45s cubic-bezier(.36,.07,.19,.97)}
.animate-lx-float{animation:lxFloat 6s ease-in-out infinite}
.animate-lx-float-b1{animation:lxFloatBadge1 7s ease-in-out infinite}
.animate-lx-float-b2{animation:lxFloatBadge2 8s ease-in-out infinite}
.animate-lx-pulse-dot{animation:lxPulseDot 2s ease-in-out infinite}
.animate-lx-bar{animation:lxBarFill .35s ease-out;transform-origin:left}

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

.lx-iw:focus-within .lx-ico{color:#dc2626}
.lx-inp{caret-color:#dc2626}

.lx-google-wrap{position:relative;width:100%}
.lx-google-wrap > div:first-child{
  position:absolute;inset:0;width:100%;height:100%;
  opacity:0;z-index:2;
}
.lx-google-wrap > div:first-child > div{width:100%!important;height:100%!important}
.lx-google-wrap > div:first-child iframe{
  width:100%!important;height:100%!important;color-scheme:normal;
}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errKey, setErrKey] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleProcessingRef = useRef(false);

  const pwStrength = getPasswordStrength(form.password);
  const confirmMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  useEffect(() => {
    document.body.classList.add("lx-page-active");
    return () => document.body.classList.remove("lx-page-active");
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = form;

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setErrKey((k) => k + 1);
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setErrKey((k) => k + 1);
      return;
    }

    try {
      setLoading(true);
      const res = await register({ name: fullName.trim(), email: email.trim(), password });
      if (!res?.data) throw new Error("Đăng ký thất bại");
      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng ký thất bại");
      setErrKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  /*
 * Google OAuth callback success.
 * Khi đăng ký bằng Google → BE tự tạo user (isVerified=true) + cấp tokens.
 * → Tương đương login luôn, không cần qua bước verify email.
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
    // Lưu tokens + redirect home (không qua login page)
    ["token", "role", "user", "refreshToken"].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("auth-changed"));
    setSuccess(data.user ? "Đăng ký Google thành công!" : "Đăng nhập thành công!");
    setTimeout(() => navigate("/"), 1000);
  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      "Đăng ký Google thất bại. Vui lòng thử lại."
    );
    setErrKey((k) => k + 1);
  } finally {
    setGoogleLoading(false);
    googleProcessingRef.current = false;
  }
};

const handleGoogleError = () => {
  setError("Đăng ký Google bị hủy hoặc thất bại. Vui lòng thử lại.");
  setErrKey((k) => k + 1);
};

  // strength bar colors
  const barColor = (idx) => {
    if (pwStrength.level < idx) return "bg-[#f3f4f6]";
    if (pwStrength.level === 1) return "bg-[#ef4444]";
    if (pwStrength.level === 2) return "bg-[#f59e0b]";
    return "bg-[#22c55e]";
  };
  const strengthTextColor =
    pwStrength.level === 1 ? "text-[#ef4444]" : pwStrength.level === 2 ? "text-[#f59e0b]" : "text-[#22c55e]";

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
            {/* Top — logo + login link */}
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
                href="/login"
                className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium
                           text-white/55 hover:text-white no-underline
                           px-3 py-[7px] sm:px-[14px] sm:py-[9px] rounded-full
                           border border-white/10 hover:border-white/20
                           hover:bg-white/[.04] transition-all duration-[250ms]"
              >
                Đăng nhập
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Hero text */}
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
                Tham gia 50.000+ khách hàng
              </div>

              <h1 className="font-fraunces font-normal text-[clamp(34px,4.6vw,64px)] leading-[1.02] tracking-[-.035em] text-white mb-[14px] sm:mb-[18px]">
                Tạo tài khoản
                <br />
                <em className="not-italic font-medium lx-grad-text" style={{ fontStyle: "italic" }}>
                  chỉ trong 1 phút.
                </em>
              </h1>

              <p className="text-sm sm:text-base leading-[1.65] text-white/55 max-w-[440px] font-normal">
                Đăng ký miễn phí để nhận ưu đãi độc quyền, theo dõi đơn hàng
                và trải nghiệm mua sắm cá nhân hóa.
              </p>
            </div>

            {/* Phone mockup + floating badges */}
            <div
              className="pointer-events-none
                         absolute right-[-40px] top-1/2 -translate-y-1/2 z-[1]
                         w-[380px] h-[540px]
                         max-lg:!relative max-lg:!right-auto max-lg:!top-auto max-lg:!translate-y-0
                         max-lg:!w-full max-lg:!h-[200px] sm:max-lg:!h-[240px] max-lg:mt-5 sm:max-lg:mt-6"
              aria-hidden="true"
            >
              {/* Badge 1 — top */}
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
                  <IcGift />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-[1.2]">Giảm 15%</div>
                  <div className="text-[9.5px] text-white/50 mt-px">Đơn đầu tiên</div>
                </div>
              </div>

              {/* Phone */}
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
                      Chào,
                      <br />
                      <em className="text-[#dc2626]">tài khoản mới!</em>
                    </div>

                    {/* Welcome card */}
                    <div className="bg-white rounded-xl lg:rounded-[18px] p-[9px] lg:p-[14px]
                                    shadow-[0_8px_24px_rgba(220,38,38,.08)]
                                    flex items-center gap-2 lg:gap-[11px]">
                      <div className="w-8 h-8 lg:w-[46px] lg:h-[46px] rounded-[9px] lg:rounded-xl shrink-0
                                      bg-gradient-to-br from-[#22c55e] to-[#16a34a]
                                      flex items-center justify-center text-white">
                        <IcCheck />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9.5px] lg:text-[11.5px] font-semibold text-[#1a0606] leading-[1.2] mb-[3px]">
                          Tài khoản đã tạo
                        </div>
                        <div className="text-[8.5px] lg:text-[10.5px] text-[#6b7280] font-medium">
                          Sẵn sàng mua sắm
                        </div>
                      </div>
                    </div>

                    {/* Voucher card */}
                    <div className="bg-white rounded-xl lg:rounded-[18px] p-[9px] lg:p-[14px]
                                    shadow-[0_8px_24px_rgba(220,38,38,.08)]
                                    flex items-center gap-2 lg:gap-[11px]">
                      <div className="w-8 h-8 lg:w-[46px] lg:h-[46px] rounded-[9px] lg:rounded-xl shrink-0
                                      bg-gradient-to-br from-[#dc2626] to-[#991b1b]
                                      flex items-center justify-center text-white">
                        <IcGift />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9.5px] lg:text-[11.5px] font-semibold text-[#1a0606] leading-[1.2] mb-[3px]">
                          Voucher chào mừng
                        </div>
                        <div className="text-[11px] lg:text-[13px] font-bold text-[#dc2626] font-fraunces">
                          -15% • 500K
                        </div>
                      </div>
                    </div>

                    <span className="self-start text-[7.5px] lg:text-[9px] font-bold text-white
                                     bg-gradient-to-br from-[#22c55e] to-[#16a34a]
                                     px-[6px] lg:px-[9px] py-[2px] lg:py-[3px] rounded-full tracking-[.05em]">
                      ✓ Miễn phí mãi mãi
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge 2 — bottom */}
              <div
                className="hidden sm:flex absolute z-[2] pointer-events-none bottom-[14%] right-[8%] max-lg:bottom-[8%] max-lg:right-[6%]
                           items-center gap-[9px] px-[14px] py-[11px] max-lg:px-[11px] max-lg:py-2
                           rounded-2xl bg-white/[.08] backdrop-blur-md
                           border border-white/[.14]
                           animate-lx-float-b2"
              >
                <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center
                                bg-gradient-to-br from-[rgba(59,130,246,.3)] to-[rgba(37,99,235,.2)]
                                border border-[rgba(59,130,246,.3)] text-[#93c5fd]">
                  <IcShield />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-[1.2]">Bảo hành 12 tháng</div>
                  <div className="text-[9.5px] text-white/50 mt-px">Chính hãng 100%</div>
                </div>
              </div>
            </div>

            {/* Bottom — feature highlights */}
            <div className="relative z-[2] animate-lx-fade-up-stats">
              <div className="grid grid-cols-3 gap-[10px] sm:gap-4 lg:gap-6 pt-5 sm:pt-6 lg:pt-7 border-t border-white/[.08]">
                <div className="flex items-start gap-2 sm:gap-[10px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0
                                  bg-[rgba(220,38,38,.12)] border border-[rgba(239,68,68,.25)]
                                  flex items-center justify-center text-[#fca5a5]">
                    <IcGift />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10.5px] sm:text-[12px] font-semibold text-white leading-tight mb-[2px]">
                      Ưu đãi
                    </div>
                    <div className="text-[9px] sm:text-[10.5px] text-white/45 leading-snug">
                      Giảm đến 15%
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-[10px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0
                                  bg-[rgba(220,38,38,.12)] border border-[rgba(239,68,68,.25)]
                                  flex items-center justify-center text-[#fca5a5]">
                    <IcTruck />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10.5px] sm:text-[12px] font-semibold text-white leading-tight mb-[2px]">
                      Miễn phí ship
                    </div>
                    <div className="text-[9px] sm:text-[10.5px] text-white/45 leading-snug">
                      Giao trong 2-4h
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-[10px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0
                                  bg-[rgba(220,38,38,.12)] border border-[rgba(239,68,68,.25)]
                                  flex items-center justify-center text-[#fca5a5]">
                    <IcShield />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10.5px] sm:text-[12px] font-semibold text-white leading-tight mb-[2px]">
                      Bảo hành
                    </div>
                    <div className="text-[9px] sm:text-[10.5px] text-white/45 leading-snug">
                      12 tháng chính hãng
                    </div>
                  </div>
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

            {/* Form top */}
            <div className="flex justify-end items-center gap-2 text-[12.5px] sm:text-[13.5px] text-[#71717a] relative z-[1]">
              Đã có tài khoản?&nbsp;
              <a
                href="/login"
                className="text-[#dc2626] hover:text-[#991b1b] hover:underline underline-offset-[3px] no-underline font-semibold transition-colors"
              >
                Đăng nhập →
              </a>
            </div>

            {/* Form middle */}
            <div className="flex-1 flex flex-col justify-center max-w-[440px] w-full mx-auto relative z-[1] py-5 sm:py-8">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-[10px] sm:mb-[14px]
                              text-[10.5px] sm:text-[11px] font-semibold text-[#dc2626]
                              tracking-[.18em] uppercase animate-lx-fade-up-1">
                <span className="w-6 h-px bg-[#dc2626]" />
                <span>Tạo tài khoản mới</span>
              </div>

              {/* Title */}
              <h2 className="font-fraunces font-normal text-[clamp(28px,3.4vw,42px)] tracking-[-.03em] leading-[1.05] text-[#0a0a0a] mb-[10px] sm:mb-3 animate-lx-fade-up-2">
                Bắt đầu <em className="text-[#dc2626] font-medium">hành trình</em> mua sắm.
              </h2>

              <p className="text-sm sm:text-[15px] text-[#71717a] leading-[1.6] mb-[22px] sm:mb-7 animate-lx-fade-up-3">
                Điền thông tin để tạo tài khoản miễn phí trong vài giây.
              </p>

              {/* Error banner */}
              {error && (
                <div
                  key={errKey}
                  role="alert"
                  className="flex items-start gap-[11px] mb-[18px]
                             bg-[#fff1f2] border border-[#fecaca] border-l-[3px] border-l-[#dc2626]
                             rounded-[10px] px-4 py-[13px]
                             text-[13.5px] text-[#991b1b] leading-[1.5]
                             animate-lx-shake"
                >
                  <IcWarn />
                  <span>{error}</span>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div
                  role="status"
                  className="flex items-start gap-[11px] mb-[18px]
                             bg-[#f0fdf4] border border-[#bbf7d0] border-l-[3px] border-l-[#16a34a]
                             rounded-[10px] px-4 py-[13px]
                             text-[13.5px] text-[#15803d] leading-[1.5]
                             animate-lx-fade-up-1"
                >
                  <IcSuccess />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full name */}
                <div className="mb-4 animate-lx-fade-up-4">
                  <label htmlFor="lx-name" className="flex text-xs font-semibold text-[#27272a] tracking-wide mb-[9px]">
                    Họ và tên
                  </label>
                  <div className="lx-iw relative">
                    <span className="lx-ico absolute left-4 sm:left-[18px] top-1/2 -translate-y-1/2 flex text-[#a1a1aa] pointer-events-none transition-colors">
                      <IcUser />
                    </span>
                    <input
                      id="lx-name"
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={handleChange}
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

                {/* Email */}
                <div className="mb-4 animate-lx-fade-up-5">
                  <label htmlFor="lx-email" className="flex text-xs font-semibold text-[#27272a] tracking-wide mb-[9px]">
                    Email
                  </label>
                  <div className="lx-iw relative">
                    <span className="lx-ico absolute left-4 sm:left-[18px] top-1/2 -translate-y-1/2 flex text-[#a1a1aa] pointer-events-none transition-colors">
                      <IcMail />
                    </span>
                    <input
                      id="lx-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="ban@email.com"
                      value={form.email}
                      onChange={handleChange}
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

                {/* Password */}
                <div className="mb-4 animate-lx-fade-up-6">
                  <label htmlFor="lx-pw" className="flex text-xs font-semibold text-[#27272a] tracking-wide mb-[9px]">
                    Mật khẩu
                  </label>
                  <div className="lx-iw relative">
                    <span className="lx-ico absolute left-4 sm:left-[18px] top-1/2 -translate-y-1/2 flex text-[#a1a1aa] pointer-events-none transition-colors">
                      <IcLock />
                    </span>
                    <input
                      id="lx-pw"
                      type={showPw ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      placeholder="Tối thiểu 8 ký tự"
                      value={form.password}
                      onChange={handleChange}
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

                  {/* Password strength */}
                  {form.password && (
                    <div className="flex items-center gap-[6px] mt-[10px] px-1">
                      <div className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${barColor(1)}`} />
                      <div className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${barColor(2)}`} />
                      <div className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${barColor(3)}`} />
                      <span className={`text-[11px] font-semibold ml-[6px] whitespace-nowrap ${strengthTextColor}`}>
                        {pwStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="mb-5 animate-lx-fade-up-7">
                  <label htmlFor="lx-confirm" className="flex text-xs font-semibold text-[#27272a] tracking-wide mb-[9px]">
                    Xác nhận mật khẩu
                  </label>
                  <div className="lx-iw relative">
                    <span className="lx-ico absolute left-4 sm:left-[18px] top-1/2 -translate-y-1/2 flex text-[#a1a1aa] pointer-events-none transition-colors">
                      <IcLockCheck />
                    </span>
                    <input
                      id="lx-confirm"
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`lx-inp w-full h-[52px] sm:h-[54px] bg-white
                                  border-[1.5px] rounded-xl sm:rounded-[13px]
                                  pl-[46px] sm:pl-[50px] pr-[52px]
                                  font-inter text-base sm:text-[15px] font-medium text-[#0a0a0a]
                                  outline-none transition-all duration-200
                                  placeholder:text-[#c4c4c7] placeholder:font-normal
                                  ${
                                    confirmMismatch
                                      ? "border-[#dc2626] bg-[#fff1f2] focus:shadow-[0_0_0_4px_rgba(220,38,38,.1)]"
                                      : "border-[#e4e4e7] hover:border-[#d4d4d8] focus:border-[#dc2626] focus:shadow-[0_0_0_4px_rgba(220,38,38,.08),0_4px_12px_rgba(220,38,38,.06)]"
                                  }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="absolute right-1 sm:right-[6px] top-1/2 -translate-y-1/2
                                 bg-transparent border-none cursor-pointer
                                 w-10 h-10 sm:w-[38px] sm:h-[38px] rounded-[9px]
                                 text-[#a1a1aa] hover:text-[#3f3f46] hover:bg-[#f4f4f5]
                                 flex items-center justify-center
                                 transition-colors duration-200
                                 focus-visible:outline-2 focus-visible:outline-[#dc2626] focus-visible:outline-offset-1"
                    >
                      {showConfirm ? <IcEyeOff /> : <IcEyeOn />}
                    </button>
                  </div>
                  {confirmMismatch && (
                    <div className="flex items-center gap-[6px] mt-[8px] px-1 text-[12px] font-medium text-[#dc2626]">
                      <IcWarnSmall />
                      <span>Mật khẩu xác nhận không khớp</span>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !!success}
                  className="lx-btn-shine relative w-full h-[54px] sm:h-14 border-none rounded-[13px] sm:rounded-2xl
                             font-inter text-sm sm:text-[14.5px] font-semibold tracking-wide text-white cursor-pointer
                             bg-[linear-gradient(135deg,#dc2626_0%,#b91c1c_100%)]
                             shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_4px_0_#7f1d1d,0_8px_24px_rgba(220,38,38,.35)]
                             transition-[transform,box-shadow,opacity] duration-[140ms]
                             flex items-center justify-center gap-[9px]
                             overflow-hidden mb-[22px]
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
                      <span>Đang đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo tài khoản</span>
                      <span className="transition-transform duration-[250ms] group-enabled:group-hover:translate-x-1">
                        <IcArrow />
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* OR divider — Phần 6 */}
              <div className="flex items-center gap-[14px] mb-[18px]">
                <div className="flex-1 h-px bg-[#e4e4e7]" />
                <span className="text-[11px] text-[#a1a1aa] font-semibold tracking-[.18em]">HOẶC ĐĂNG KÝ VỚI</span>
                <div className="flex-1 h-px bg-[#e4e4e7]" />
              </div>

              {/* Social buttons — Phần 6: Google functional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] mb-6">
                <div className="lx-google-wrap h-12 sm:h-[50px] rounded-xl overflow-hidden">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    width="440"
                    text="signup_with"
                    shape="rectangular"
                    theme="outline"
                  />
                  <button
                    type="button"
                    disabled={loading || googleLoading || !!success}
                    className="w-full h-full rounded-xl bg-white border-[1.5px] border-[#e4e4e7]
                               flex items-center justify-center gap-[9px]
                               font-inter text-[13.5px] font-semibold text-[#27272a]
                               transition-all duration-200
                               enabled:hover:border-[#d4d4d8] enabled:hover:-translate-y-px enabled:hover:shadow-[0_6px_16px_rgba(0,0,0,.06)]
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

              {/* Terms */}
              <p className="text-[11.5px] sm:text-[12px] text-[#a1a1aa] text-center leading-[1.65] mb-2">
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <a href="/terms" className="text-[#dc2626] hover:text-[#991b1b] hover:underline underline-offset-[3px] font-medium no-underline">
                  Điều khoản dịch vụ
                </a>
                {" "}và{" "}
                <a href="/privacy" className="text-[#dc2626] hover:text-[#991b1b] hover:underline underline-offset-[3px] font-medium no-underline">
                  Chính sách bảo mật
                </a>
                {" "}của chúng tôi.
              </p>
            </div>

            {/* Form bottom */}
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