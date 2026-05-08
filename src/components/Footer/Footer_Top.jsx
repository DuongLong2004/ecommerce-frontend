import {
  Phone,
  Megaphone,
  Wrench,
  ArrowRight,
  Youtube,
  Facebook,
  Instagram,
  Music2,
  MessageCircleMore,
  Smartphone,
} from "lucide-react";

/* ─── DATA ─────────────────────────────────────────── */
const hotlines = [
  { Icon: Phone,     label: "Gọi mua hàng", number: "1800.2097", hours: "7h30 – 22h00" },
  { Icon: Megaphone, label: "Gọi khiếu nại", number: "1800.2063", hours: "8h00 – 21h30" },
  { Icon: Wrench,    label: "Gọi bảo hành",  number: "1800.2064", hours: "8h00 – 21h00" },
];

const payments = [
  { src: "https://cdn2.cellphones.com.vn/x35,webp/media/wysiwyg/apple-pay-og.png",          alt: "Apple Pay" },
  { src: "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/vnpay-logo.png",       alt: "VNPay"     },
  { src: "https://cdn2.cellphones.com.vn/x/media/wysiwyg/momo_1.png",                       alt: "MoMo"      },
  { src: "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/onepay-logo.png",      alt: "OnePay"    },
  { src: "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/mpos-logo.png",        alt: "mPOS"      },
  { src: "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/kredivo-logo.png",     alt: "Kredivo"   },
  { src: "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/zalopay-logo.png",     alt: "ZaloPay"   },
  { src: "https://cdn2.cellphones.com.vn/x35,webp/media/logo/payment/alepay-logo.png",      alt: "Alepay"    },
  { src: "https://cdn2.cellphones.com.vn/x/media/wysiwyg/fundiin.png",                      alt: "Fundiin"   },
];

const policies = [
  "Mua hàng thanh toán online",
  "Mua hàng trả góp online",
  "Mua hàng trả góp bằng thẻ tín dụng",
  "Xem ưu đãi Xmember",
  "Tra thông tin bảo hành",
];

const services = [
  "Khách hàng doanh nghiệp (B2B)",
  "Ưu đãi thanh toán",
  "Chính sách bảo mật thông tin cá nhân",
  "Chính sách Bảo hành",
  "Quy chế hoạt động",
  "Liên hệ hợp tác kinh doanh",
];

const socials = [
  { Icon: Youtube,          name: "YouTube",   iconBg: "bg-red-50",   iconColor: "text-red-600"  },
  { Icon: Facebook,         name: "Facebook",  iconBg: "bg-blue-50",  iconColor: "text-blue-600" },
  { Icon: Instagram,        name: "Instagram", iconBg: "bg-pink-50",  iconColor: "text-pink-500" },
  { Icon: Music2,           name: "TikTok",    iconBg: "bg-gray-100", iconColor: "text-gray-900" },
  { Icon: MessageCircleMore,name: "Zalo",      iconBg: "bg-sky-50",   iconColor: "text-sky-500"  },
];

/* ─── SUB-COMPONENTS ───────────────────────────────── */

function SectionHeading({ children, className = "" }) {
  return (
    <h3
      className={`font-serif text-[15px] font-bold text-gray-900 tracking-tight mb-4 pb-3 relative
        before:absolute before:bottom-0 before:left-0 before:w-7 before:h-[2px] before:bg-red-600 before:rounded-full
        ${className}`}
    >
      {children}
    </h3>
  );
}

function LinkRow({ href = "#", children }) {
  return (
    <li>
      <a
        href={href}
        className="group flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-red-600
          py-[5px] transition-all duration-200"
      >
        <ArrowRight
          className="w-3 h-3 text-red-500 opacity-0 -translate-x-2 group-hover:opacity-100
            group-hover:translate-x-0 transition-all duration-200 flex-shrink-0"
          strokeWidth={2.5}
        />
        <span className="group-hover:translate-x-0.5 transition-transform duration-200 leading-snug">
          {children}
        </span>
      </a>
    </li>
  );
}

/* ─── MAIN ──────────────────────────────────────────── */
export default function Footer_Top() {
  return (
    <div className="relative bg-white font-sans overflow-hidden ">
      {/* Animated shimmer on top border */}
      <style>{`
        @keyframes ftShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .ft-shimmer {
          background: linear-gradient(90deg, #dc2626, #f87171, #dc2626);<div className="ft-shimmer
          background-size: 200% 100%;
          animation: ftShimmer 4s linear infinite;
        }
      `}</style>
      {/* --- màu viền ----------------------------------------------------------- */}
      {/* <div className="ft-shimmer absolute top-0 left-0 right-0 h-[3px]" /> */}

      {/* Dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage: "radial-gradient(rgba(220,38,38,0.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* ── Grid ── */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8 pt-12 pb-10
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">

        {/* ── Col 1: Hotline + Payment ── */}
        <div className="lg:pr-8 lg:border-r lg:border-red-100">
          <SectionHeading>Tổng đài hỗ trợ miễn phí</SectionHeading>

          <ul className="space-y-3 mb-8">
            {hotlines.map(({ Icon, label, number, hours }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-red-50 border border-red-100
                  flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-[15px] h-[15px] text-red-600" strokeWidth={2} />
                </div>
                <div className="text-[13px] leading-snug">
                  <span className="font-medium text-gray-900">{label}</span>{" "}
                  <span className="text-gray-700">{number}</span>
                  <br />
                  <span className="text-[11px] text-gray-400">{hours}</span>
                </div>
              </li>
            ))}
          </ul>

          <SectionHeading>Phương thức thanh toán</SectionHeading>
          <div className="flex flex-wrap gap-[7px]">
            {payments.map(({ src, alt }) => (
              <a
                key={alt}
                href="#"
                className="flex items-center justify-center bg-white border border-gray-100 rounded-lg
                  px-2 py-[5px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]
                  hover:border-red-200 hover:shadow-[0_3px_10px_rgba(220,38,38,0.1)]
                  hover:-translate-y-0.5 transition-all duration-200"
              >
                <img src={src} alt={alt} className="h-[22px] w-[44px] object-contain" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Col 2: Policy ── */}
        <div className="lg:px-8 lg:border-r lg:border-red-100">
          <SectionHeading>Thông tin &amp; chính sách</SectionHeading>
          <ul className="space-y-0.5">
            {policies.map((p) => <LinkRow key={p}>{p}</LinkRow>)}
          </ul>
        </div>

        {/* ── Col 3: Service ── */}
        <div className="lg:px-8 lg:border-r lg:border-red-100">
          <SectionHeading>Dịch vụ &amp; thông tin khác</SectionHeading>
          <ul className="space-y-0.5">
            {services.map((s) => <LinkRow key={s}>{s}</LinkRow>)}
          </ul>
        </div>

        {/* ── Col 4: Social + Brand ── */}
        <div className="lg:pl-8">
          <SectionHeading>Kết nối với LongtyJR Phone</SectionHeading>
          <p className="text-[12px] text-gray-400 -mt-2 mb-4 leading-snug">
            Theo dõi để nhận ưu đãi mới nhất
          </p>

          <div className="flex flex-col gap-2 mb-7">
            {socials.map(({ Icon, name, iconBg, iconColor }) => (
              <a
                key={name}
                href="#"
                className="group flex items-center gap-3 px-3 py-[9px] rounded-xl bg-white
                  border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]
                  hover:bg-red-50/60 hover:border-red-100 hover:translate-x-1
                  hover:shadow-[0_3px_10px_rgba(220,38,38,0.08)]
                  transition-all duration-200"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  <Icon className={`w-[15px] h-[15px] ${iconColor}`} strokeWidth={2} />
                </div>
                <span className="text-[13px] text-gray-600 group-hover:text-red-600
                  font-[450] transition-colors duration-200">
                  {name}
                </span>
              </a>
            ))}
          </div>

          {/* Brand stamp */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl
            bg-gradient-to-br from-red-50 to-white border border-red-100/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-500
              flex items-center justify-center flex-shrink-0
              shadow-[0_4px_12px_rgba(220,38,38,0.25)]">
              <Smartphone className="w-[18px] h-[18px] text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="font-serif text-[13.5px] font-bold text-gray-900 leading-none mb-[5px]">
                LongtyJR Phone
              </div>
              <div className="text-[11px] text-red-600 font-medium tracking-wide leading-none">
                Nền tảng số 1 Việt Nam
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}