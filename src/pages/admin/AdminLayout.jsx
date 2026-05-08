import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Menu } from "lucide-react";

/* ── Page fade transition ── */
function PageTransition({ children, pathname }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
      }}
    >
      {children}
    </div>
  );
}

const SIDEBAR_FULL = 260;
const SIDEBAR_MINI = 72;

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);

  /* Detect mobile breakpoint */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Close mobile drawer on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Scroll content to top on route change */
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  /* Auto-collapse on small desktop */
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 1100 && window.innerWidth >= 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1100) {
        setCollapsed(false);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarWidth = isMobile ? SIDEBAR_FULL : collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Mobile overlay backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`
          fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm
          transition-opacity duration-250 ease-in-out
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-['DM_Sans',sans-serif] relative">

        {/* ── Sidebar Wrapper ── */}
        <div
          className={`
            flex-shrink-0 overflow-hidden
            transition-all duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isMobile ? "fixed top-0 left-0 h-full z-[100]" : "relative z-[50]"}
            ${isMobile && mobileOpen ? "shadow-[8px_0_40px_rgba(0,0,0,0.18)]" : ""}
          `}
          style={{
            width: isMobile ? SIDEBAR_FULL : sidebarWidth,
            transform: isMobile
              ? mobileOpen ? "translateX(0)" : `translateX(-${SIDEBAR_FULL}px)`
              : "translateX(0)",
          }}
        >
          <Sidebar
            collapsed={!isMobile && collapsed}
            onClose={() => setMobileOpen(false)}
            isMobile={isMobile}
          />

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Mở rộng" : "Thu gọn"}
              aria-label="Toggle sidebar"
              className={`
                collapse-btn
                absolute top-[68px] -right-[14px] z-[60]
                w-7 h-7 rounded-full
                bg-white border border-gray-200
                flex items-center justify-center
                text-gray-400 cursor-pointer
                shadow-[0_2px_12px_rgba(0,0,0,0.08)]
                transition-all duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                hover:bg-red-50 hover:border-red-200 hover:text-red-500
                hover:shadow-[0_3px_14px_rgba(220,38,38,0.18)]
              `}
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* ── Main Area ── */}
        <div
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{ marginLeft: isMobile ? 0 : undefined }}
        >
          <Header
            onMenuToggle={() => setMobileOpen((o) => !o)}
            isMobile={isMobile}
          />

          {/* Scrollable Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overflow-x-hidden al-scroll"
          >
            {/* Dot grid background */}
            <div
              className="min-h-[calc(100vh-60px-46px)] px-6 pt-6 pb-8 sm:px-7"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(220,38,38,0.045) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                backgroundAttachment: "local",
              }}
            >
              <PageTransition pathname={location.pathname}>
                <Outlet />
              </PageTransition>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-center flex-wrap gap-2 px-7 py-3 text-[11px] tracking-wide text-gray-400 border-t border-gray-100 bg-white">
              <span>© {new Date().getFullYear()} LongtyJR Admin</span>
              <span className="text-gray-200">·</span>
              <span>v2.0.0</span>
              <span className="text-gray-200">·</span>
              <span className="text-red-500">Made with ♥</span>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    padding-top: 0 !important;
  }

  /* Custom scrollbar */
  .al-scroll::-webkit-scrollbar { width: 4px; }
  .al-scroll::-webkit-scrollbar-track { background: transparent; }
  .al-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
  .al-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
  .al-scroll { scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }

  @media (max-width: 480px) {
    .al-content-inner {
      padding: 14px 14px 24px !important;
    }
  }
`;