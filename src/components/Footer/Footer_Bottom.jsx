import {
  Smartphone,
  Headphones,
  ShieldCheck,
  Building2,
  ChevronRight,
  Star,
  Users,
  Package,
  Facebook,
  Youtube,
  MessageCircle,
} from "lucide-react";

const footerData = [
  {
    Icon: Smartphone,
    title: "Điện thoại",
    items: [
      "iPhone – Samsung – Xiaomi – OPPO",
      "Realme – Vivo – Tecno – Nokia",
      "Điện thoại cũ giá tốt",
      "So sánh điện thoại",
    ],
  },
  {
    Icon: Headphones,
    title: "Phụ kiện",
    items: [
      "Tai nghe – Sạc – Cáp",
      "Ốp lưng – Dán màn hình",
      "Đồng hồ thông minh",
      "Sạc dự phòng – Vòng đeo tay",
    ],
  },
  {
    Icon: ShieldCheck,
    title: "Chính sách",
    items: [
      "Chính sách bảo hành & đổi trả",
      "Giao hàng nhanh toàn quốc",
      "Hướng dẫn mua hàng online",
      "Trả góp 0% – Thanh toán linh hoạt",
    ],
  },
  {
    Icon: Building2,
    title: "Về chúng tôi",
    items: [
      "Giới thiệu LongtyJR Phone",
      "Hệ thống cửa hàng",
      "Liên hệ – Hợp tác kinh doanh",
      "Tuyển dụng nhân sự",
    ],
  },
];

const stats = [
  { Icon: Users, num: "50K+", label: "Khách hàng" },
  { Icon: Package, num: "500+", label: "Sản phẩm" },
  { Icon: Star, num: "4.9", label: "Đánh giá" },
];

const socials = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Youtube, href: "#", label: "YouTube" },
  { Icon: MessageCircle, href: "#", label: "Zalo" },
];

const bottomLinks = ["Điều khoản", "Bảo mật", "Cookie", "Sitemap"];

export default function Footer_Bottom() {
  return (
    <footer className="relative bg-[#0c0c0e] overflow-hidden font-sans">

      {/* Subtle red glow ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[300px] rounded-full bg-red-700/[0.06] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full bg-red-600/[0.04] blur-3xl" />
      </div>

      {/* Micro-grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Top glow line */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg,transparent 0%,rgba(220,38,38,0.25) 20%,rgba(239,68,68,0.55) 50%,rgba(220,38,38,0.25) 80%,transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8 pt-10 pb-7">

        {/* ── Brand + Stats ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

          {/* Brand identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-700/30">
              <Smartphone className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-white font-serif text-[17px] font-bold tracking-tight leading-none mb-1">
                LongtyJR Phone
              </p>
              <p className="text-gray-500 text-[11.5px] leading-none">
                Hệ thống bán lẻ điện thoại &amp; phụ kiện chính hãng
              </p>
            </div>
          </div>

          {/* Stats pill */}
          <div className="flex items-center gap-0 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-3 self-start sm:self-auto">
            {stats.map(({ Icon, num, label }, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center px-4 sm:px-5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="w-3.5 h-3.5 text-red-500/60" strokeWidth={2} />
                    <span className="text-red-500 font-bold text-[15px] font-serif leading-none">
                      {num}
                    </span>
                  </div>
                  <span className="text-gray-600 text-[10px] tracking-wider uppercase leading-none">
                    {label}
                  </span>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-8 bg-white/[0.07] mx-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="h-px w-full mb-8"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",
          }}
        />

        {/* ── Link Grid ── */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-7 mb-8">
          {footerData.map(({ Icon, title, items }) => (
            <div key={title}>
              {/* Column header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-semibold text-gray-300 tracking-[0.12em] uppercase">
                  {title}
                </span>
              </div>

              {/* Link list */}
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group flex items-center gap-1 text-[12.5px] text-gray-600 hover:text-red-400 py-[4.5px] transition-all duration-200 pl-1 border-l-2 border-transparent hover:border-red-600 hover:pl-3"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 -ml-1 transition-opacity duration-200 flex-shrink-0 text-red-500" />
                      <span className="leading-snug">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div
          className="h-px w-full mb-6"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",
          }}
        />

        {/* ── Bottom Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">

          {/* Copyright */}
          <p className="text-gray-600 text-[11.5px] order-2 sm:order-1">
            © 2026 <span className="text-gray-500">LongtyJR Phone</span> — Tất cả quyền được bảo lưu.
          </p>

          {/* Socials + links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-gray-600 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
              ))}
            </div>

            {/* Divider (desktop only) */}
            <div className="hidden sm:block w-px h-4 bg-white/[0.07]" />

            {/* Policy links */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {bottomLinks.map((link, i) => (
                <span key={link} className="flex items-center gap-3">
                  <a
                    href="#"
                    className="text-gray-600 hover:text-red-400 text-[11.5px] transition-colors duration-200"
                  >
                    {link}
                  </a>
                  {i < bottomLinks.length - 1 && (
                    <span className="text-gray-800 text-[10px]">·</span>
                  )}
                </span>
              ))}
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}