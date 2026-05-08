import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";

/* ═══════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════ */
const IcMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IcWarn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-px">
    <circle cx="12" cy="12" r="9.5" stroke="#dc2626" strokeWidth="1.6" />
    <line x1="12" y1="7.5" x2="12" y2="13" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1" fill="#dc2626" />
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
const IcArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcSpark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 6.4L20 10l-6.2 1.6L12 18l-1.8-6.4L4 10l6.2-1.6L12 2z" />
  </svg>
);
const IcKey = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M11 12l9-9M16 7l3 3M14 9l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcInbox = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <path d="M3 13l3-9h12l3 9M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6M3 13h5l1 3h6l1-3h5"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   EXTRA CSS — giống Login/Register style
   ═══════════════════════════════════════════════════════════ */
const EXTRA_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap');

body.lx-page-active{overflow:hidden}
body.lx-page-active header,body.lx-page-active footer,
body.lx-page-active nav.navbar,body.lx-page-active .header,
body.lx-page-active .footer,body.lx-page-active .app-header,
body.lx-page-active .app-footer,body.lx-page-active .site-header,
body.lx-page-active .site-footer,body.lx-page-active .main-header,
body.lx-page-active .main-footer{display:none!important}

.font-inter{font-family:'Inter',system-ui,-apple-system,sans-serif;font-feature-settings:"ss01","cv11"}
.font-fraunces{font-family:'Fraunces',Georgia,serif;font-feature-settings:"ss01"}

@keyframes lxFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes lxShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
@keyframes lxPulseDot{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:1;transform:scale(1)}}
@keyframes lxGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes lxFloatBadge1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes lxFloatBadge2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes lxFloatIcon{0%,100%{transform:translate(-50%,-50%) rotate(-3deg)}50%{transform:translate(-50%,-58%) rotate(-3deg)}}

.animate-lx-fade-up-1{animation:lxFadeUp .55s .05s both}
.animate-lx-fade-up-2{animation:lxFadeUp .55s .1s both}
.animate-lx-fade-up-3{animation:lxFadeUp .55s .15s both}
.animate-lx-fade-up-4{animation:lxFadeUp .55s .2s both}
.animate-lx-fade-up-5{animation:lxFadeUp .55s .25s both}
.animate-lx-fade-up-hero{animation:lxFadeUp .7s .1s both}
.animate-lx-fade-up-stats{animation:lxFadeUp .7s .25s both}
.animate-lx-shake{animation:lxShake .45s cubic-bezier(.36,.07,.19,.97)}
.animate-lx-pulse-dot{animation:lxPulseDot 2s ease-in-out infinite}
.animate-lx-float-b1{animation:lxFloatBadge1 7s ease-in-out infinite}
.animate-lx-float-b2{animation:lxFloatBadge2 8s ease-in-out infinite}
.animate-lx-float-icon{animation:lxFloatIcon 6s ease-in-out infinite}

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
.lx-iw:focus-within .lx-ico{color:#dc2626}
.lx-inp{caret-color:#dc2626}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [errKey, setErrKey] = useState(0);

  // Hide app header/footer
  useEffect(() => {
    document.body.classList.add("lx-page-active");
    return () => document.body.classList.remove("lx-page-active");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      setErrKey((k) => k + 1);
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim());
      // BE luôn 200 (anti-enumeration) → luôn show success
      setSubmitted(true);
    } catch (err) {
      // Chỉ vào nhánh này khi rate limit (429) hoặc validation FE
      setError(
        err.response?.data?.message ||
          "Không thể gửi yêu cầu. Vui lòng thử lại sau."
      );
      setErrKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
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
            {/* Top — logo + back to login */}
            <div className="relative z-[2] flex items-center justify-between">
              <div className="flex items-center gap-[11px]">
                <div className="font-fraunces w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[11px]
                                bg-gradient-to-br from-[#ef4444] to-[#991b1b]
                                flex items-center justify-center
                                font-semibold text-lg sm:text-xl text-white italic tracking-tighter
                                shadow-[0_4px_16px_rgba(220,38,38,.4),inset_0_1px_0_rgba(255,255,255,.2)]">
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

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium
                           text-white/55 hover:text-white no-underline
                           px-3 py-[7px] sm:px-[14px] sm:py-[9px] rounded-full
                           border border-white/10 hover:border-white/20
                           hover:bg-white/[.04] transition-all duration-[250ms]"
              >
                <IcArrowLeft />
                Đăng nhập
              </Link>
            </div>

            {/* Hero text */}
            <div className="relative z-[2] max-w-[520px] animate-lx-fade-up-hero">
              <div className="inline-flex items-center gap-2 mb-[18px] sm:mb-6
                              pl-[6px] pr-[11px] py-[5px] sm:pl-2 sm:pr-3 sm:py-1.5 rounded-full
                              bg-[rgba(220,38,38,.12)] border border-[rgba(239,68,68,.25)]
                              text-[10px] sm:text-[11px] font-semibold text-[#fca5a5]
                              tracking-[.08em] uppercase">
                <span className="w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center text-white">
                  <IcSpark />
                </span>
                Khôi phục tài khoản
              </div>

              <h1 className="font-fraunces font-normal text-[clamp(34px,4.6vw,64px)] leading-[1.02] tracking-[-.035em] text-white mb-[14px] sm:mb-[18px]">
                Quên mật khẩu?
                <br />
                <em className="not-italic font-medium lx-grad-text" style={{ fontStyle: "italic" }}>
                  Không sao cả.
                </em>
              </h1>

              <p className="text-sm sm:text-base leading-[1.65] text-white/55 max-w-[440px] font-normal">
                Chỉ cần nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu
                trong vài giây. Liên kết có hiệu lực trong 1 giờ.
              </p>
            </div>

            {/* Floating icon mockup */}
            <div className="pointer-events-none
                            absolute right-[-40px] top-1/2 -translate-y-1/2 z-[1]
                            w-[380px] h-[540px]
                            max-lg:!relative max-lg:!right-auto max-lg:!top-auto max-lg:!translate-y-0
                            max-lg:!w-full max-lg:!h-[200px] sm:max-lg:!h-[240px] max-lg:mt-5 sm:max-lg:mt-6"
                 aria-hidden="true">

              {/* Badge 1 */}
              <div className="hidden sm:flex absolute z-[2] pointer-events-none top-[8%] right-[18%] max-lg:top-[6%] max-lg:right-[8%]
                              items-center gap-[9px] px-[14px] py-[11px] max-lg:px-[11px] max-lg:py-2
                              rounded-2xl bg-white/[.08] backdrop-blur-md
                              border border-white/[.14] animate-lx-float-b1">
                <div className="w-[30px] h-[30px] max-lg:w-6 max-lg:h-6 rounded-lg flex items-center justify-center
                                bg-gradient-to-br from-[rgba(220,38,38,.3)] to-[rgba(239,68,68,.2)]
                                border border-[rgba(220,38,38,.3)] text-[#fca5a5]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-[1.2]">Email gửi tức thì</div>
                  <div className="text-[9.5px] text-white/50 mt-px">Đến hộp thư của bạn</div>
                </div>
              </div>

              {/* Big floating key icon */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                              w-[200px] h-[200px] lg:w-[280px] lg:h-[280px]
                              rounded-[42px]
                              bg-[linear-gradient(145deg,#2a0c0c_0%,#1a0606_100%)]
                              shadow-[0_0_0_2px_#1a0606,0_0_0_4px_#2a0c0c,0_50px_100px_rgba(0,0,0,.6),0_30px_60px_rgba(220,38,38,.25)]
                              flex items-center justify-center
                              animate-lx-float-icon">
                <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-3xl
                                bg-gradient-to-br from-[#ef4444] to-[#991b1b]
                                flex items-center justify-center text-white
                                shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_8px_24px_rgba(220,38,38,.4)]">
                  <IcKey />
                </div>
              </div>

              {/* Badge 2 */}
              <div className="hidden sm:flex absolute z-[2] pointer-events-none bottom-[14%] right-[8%] max-lg:bottom-[8%] max-lg:right-[6%]
                              items-center gap-[9px] px-[14px] py-[11px] max-lg:px-[11px] max-lg:py-2
                              rounded-2xl bg-white/[.08] backdrop-blur-md
                              border border-white/[.14] animate-lx-float-b2">
                <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center
                                bg-gradient-to-br from-[rgba(34,197,94,.3)] to-[rgba(16,185,129,.2)]
                                border border-[rgba(34,197,94,.3)] text-[#86efac]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2.5l8 3v6.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V5.5l8-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-[1.2]">Link mã hóa SSL</div>
                  <div className="text-[9.5px] text-white/50 mt-px">Hết hạn sau 1 giờ</div>
                </div>
              </div>
            </div>

            {/* Bottom — info row */}
            <div className="relative z-[2] animate-lx-fade-up-stats">
              <div className="grid grid-cols-3 gap-[10px] sm:gap-4 lg:gap-6 pt-5 sm:pt-6 lg:pt-7 border-t border-white/[.08]">
                <div>
                  <div className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-none mb-[5px]">
                    1<em className="text-[#fca5a5] font-normal">h</em>
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] text-white/45 tracking-wide">Hiệu lực link</div>
                </div>
                <div>
                  <div className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-none mb-[5px]">
                    SSL<em className="text-[#fca5a5] font-normal">+</em>
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] text-white/45 tracking-wide">Mã hóa</div>
                </div>
                <div>
                  <div className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-none mb-[5px]">
                    24/7<em className="text-[#fca5a5] font-normal">★</em>
                  </div>
                  <div className="text-[9.5px] sm:text-[11px] text-white/45 tracking-wide">Hỗ trợ</div>
                </div>
              </div>
            </div>
          </aside>

          {/* ════════════════════════════════════════════
              RIGHT — FORM
              ════════════════════════════════════════════ */}
          <main className="lx-form-bg bg-[#fafaf7] flex flex-col relative overflow-y-auto
                           px-5 py-7 sm:px-10 sm:py-8 lg:px-14 lg:py-10">

            {/* Top — link đăng nhập/đăng ký */}
            <div className="flex justify-end items-center gap-2 text-[12.5px] sm:text-[13.5px] text-[#71717a] relative z-[1]">
              Nhớ ra mật khẩu?&nbsp;
              <Link
                to="/login"
                className="text-[#dc2626] hover:text-[#991b1b] hover:underline underline-offset-[3px] no-underline font-semibold transition-colors"
              >
                Đăng nhập →
              </Link>
            </div>

            {/* Middle — form/success state */}
            <div className="flex-1 flex flex-col justify-center max-w-[440px] w-full mx-auto relative z-[1] py-5 sm:py-10">

              {/* ── STATE 1: chưa submit → show form ── */}
              {!submitted && (
                <>
                  <div className="inline-flex items-center gap-2 mb-[10px] sm:mb-[14px]
                                  text-[10.5px] sm:text-[11px] font-semibold text-[#dc2626]
                                  tracking-[.18em] uppercase animate-lx-fade-up-1">
                    <span className="w-6 h-px bg-[#dc2626]" />
                    <span>Đặt lại mật khẩu</span>
                  </div>

                  <h2 className="font-fraunces font-normal text-[clamp(30px,3.6vw,46px)] tracking-[-.03em] leading-[1.05] text-[#0a0a0a] mb-[10px] sm:mb-3 animate-lx-fade-up-2">
                    Nhập <em className="text-[#dc2626] font-medium">email</em> của bạn.
                  </h2>

                  <p className="text-sm sm:text-[15px] text-[#71717a] leading-[1.6] mb-[26px] sm:mb-9 animate-lx-fade-up-3">
                    Chúng tôi sẽ gửi link đặt lại mật khẩu qua email. Vui lòng kiểm tra
                    cả thư mục Spam nếu không thấy email trong vài phút.
                  </p>

                  {/* Error */}
                  {error && (
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

                  <form onSubmit={handleSubmit} noValidate className="animate-lx-fade-up-4">
                    {/* Email */}
                    <div className="mb-5 sm:mb-6">
                      <label htmlFor="lx-email" className="flex text-xs font-semibold text-[#27272a] tracking-wide mb-[9px]">
                        Email tài khoản
                      </label>
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
                          autoFocus
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

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="lx-btn-shine relative w-full h-[54px] sm:h-14 border-none rounded-[13px] sm:rounded-2xl
                                 font-inter text-sm sm:text-[14.5px] font-semibold tracking-wide text-white cursor-pointer
                                 bg-[linear-gradient(135deg,#dc2626_0%,#b91c1c_100%)]
                                 shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_4px_0_#7f1d1d,0_8px_24px_rgba(220,38,38,.35)]
                                 transition-[transform,box-shadow,opacity] duration-[140ms]
                                 flex items-center justify-center gap-[9px]
                                 overflow-hidden mb-5
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
                          <span>Đang gửi email...</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi link đặt lại mật khẩu</span>
                          <span className="transition-transform duration-[250ms] group-hover:translate-x-1">
                            <IcArrow />
                          </span>
                        </>
                      )}
                    </button>

                    {/* Back to login */}
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2
                                 text-[13.5px] font-semibold text-[#71717a] hover:text-[#27272a]
                                 no-underline transition-colors"
                    >
                      <IcArrowLeft />
                      Quay lại đăng nhập
                    </Link>
                  </form>
                </>
              )}

              {/* ── STATE 2: đã submit → success message ── */}
              {submitted && (
                <div className="text-center animate-lx-fade-up-1">
                  {/* Big inbox icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl
                                    bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0]
                                    border-2 border-[#86efac]
                                    flex items-center justify-center text-[#16a34a]
                                    shadow-[0_8px_24px_rgba(34,197,94,.2)]">
                      <IcInbox />
                    </div>
                  </div>

                  <h2 className="font-fraunces font-normal text-[clamp(28px,3.4vw,40px)] tracking-[-.03em] leading-[1.05] text-[#0a0a0a] mb-3">
                    Kiểm tra <em className="text-[#16a34a] font-medium">hộp thư</em>.
                  </h2>

                  <p className="text-sm sm:text-[15px] text-[#71717a] leading-[1.6] mb-2">
                    Nếu địa chỉ <strong className="text-[#0a0a0a]">{email}</strong> tồn tại trong hệ thống,
                    chúng tôi đã gửi link đặt lại mật khẩu.
                  </p>

                  <p className="text-[13px] text-[#a1a1aa] leading-[1.6] mb-7">
                    Liên kết có hiệu lực trong <strong>1 giờ</strong>. Đừng quên kiểm tra cả
                    thư mục <strong>Spam</strong> nếu không thấy email.
                  </p>

                  {/* Info banner */}
                  <div className="flex items-start gap-[11px] mb-7
                                  bg-[#f0fdf4] border border-[#bbf7d0] border-l-[3px] border-l-[#16a34a]
                                  rounded-[10px] px-4 py-[13px] text-left
                                  text-[13px] text-[#15803d] leading-[1.55]">
                    <IcSuccess />
                    <span>
                      <strong>Mẹo bảo mật:</strong> Sau khi đặt lại mật khẩu, tất cả các phiên
                      đăng nhập trên thiết bị khác sẽ tự động đăng xuất.
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setEmail("");
                      }}
                      className="flex-1 h-12 rounded-xl bg-white border-[1.5px] border-[#e4e4e7]
                                 font-inter text-[13.5px] font-semibold text-[#27272a] cursor-pointer
                                 transition-all duration-200
                                 hover:border-[#d4d4d8] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,.06)]
                                 active:translate-y-0"
                    >
                      Gửi lại với email khác
                    </button>
                    <Link
                      to="/login"
                      className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl
                                 bg-[#dc2626] hover:bg-[#b91c1c] text-white
                                 font-inter text-[13.5px] font-semibold no-underline
                                 transition-all duration-200 hover:-translate-y-px shadow-md hover:shadow-lg"
                    >
                      Về trang đăng nhập
                      <IcArrow />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="relative z-[1] flex flex-col sm:flex-row justify-between sm:items-center
                            gap-[10px] sm:gap-0 text-xs text-[#a1a1aa]
                            pt-[18px] sm:pt-5 border-t border-[#ececec]">
              <div className="flex items-center gap-[6px]">
                <span className="w-[5px] h-[5px] rounded-full bg-[#22c55e] animate-lx-pulse-dot" />
                <span>Hệ thống an toàn · SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-[14px]">
                <Link to="/terms" className="text-[#71717a] hover:text-[#27272a] no-underline transition-colors">Điều khoản</Link>
                <Link to="/privacy" className="text-[#71717a] hover:text-[#27272a] no-underline transition-colors">Bảo mật</Link>
                <Link to="/help" className="text-[#71717a] hover:text-[#27272a] no-underline transition-colors">Trợ giúp</Link>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}