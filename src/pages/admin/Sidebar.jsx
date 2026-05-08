import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  BarChart3,
  Star,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  ChevronRight,
} from "lucide-react";

/* ── Nav config ── */
const NAV_MAIN = [
  { to: "/admin",           icon: LayoutDashboard, label: "Dashboard",   end: true },
  { to: "/admin/users",     icon: Users,           label: "Người dùng"            },
  { to: "/admin/products",  icon: Package,         label: "Sản phẩm"              },
  { to: "/admin/orders",    icon: FileText,        label: "Đơn hàng",  hasBadge: true },
  { to: "/admin/analytics", icon: BarChart3,       label: "Thống kê"              },
  { to: "/admin/reviews",   icon: Star,            label: "Đánh giá"              },
];

const NAV_SYS = [
  { to: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

/* ── Tooltip ── */
function Tooltip({ label, children, collapsed }) {
  const [show, setShow] = useState(false);
  if (!collapsed) return children;
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl animate-[fadeIn_0.12s_ease]">
            {label}
          </div>
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </div>
  );
}

/* ── Section label ── */
function SectionLabel({ children }) {
  return (
    <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-400 select-none">
      {children}
    </p>
  );
}

/* ── Nav link ── */
function NavItem({ item, collapsed, badge }) {
  const Icon = item.icon;
  return (
    <Tooltip label={item.label} collapsed={collapsed}>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          [
            "group relative flex items-center gap-3 rounded-xl text-[13.5px] font-medium transition-all duration-150 mb-0.5 select-none",
            collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
            isActive
              ? "bg-red-50 text-red-600 shadow-[inset_0_0_0_1px_rgba(220,38,38,0.15)]"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            {/* Icon box */}
            <span
              className={[
                "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-150",
                isActive
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600",
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={2} />
            </span>

            {/* Label + badge */}
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.hasBadge && badge > 0 && (
                  <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
                    {badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight size={13} className="text-red-400 shrink-0" />
                )}
              </>
            )}

            {/* Badge dot (collapsed) */}
            {collapsed && item.hasBadge && badge > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            )}
          </>
        )}
      </NavLink>
    </Tooltip>
  );
}

/* ── Sidebar ── */
export default function Sidebar({ collapsed = false, onClose, isMobile = false }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    axiosClient
      .get("/orders")
      .then((res) => {
        const pending = (res.data.data || []).filter((o) => o.status === "pending").length;
        setPendingCount(pending);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={[
        "relative flex flex-col h-screen bg-white border-r border-gray-100 shadow-[2px_0_20px_rgba(0,0,0,0.04)] z-50 overflow-hidden transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[68px] items-center" : "w-[252px] items-stretch",
      ].join(" ")}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-red-400 to-transparent" />

      {/* ── Logo ── */}
      <div
        className={[
          "flex items-center border-b border-red-50 shrink-0 min-h-[68px]",
          collapsed ? "justify-center px-0 py-5" : "justify-between px-4 py-5",
        ].join(" ")}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 flex-1 min-w-0 group"
          title="Về trang chủ"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] shrink-0 transition-transform duration-200 group-hover:scale-105">
            <ShieldCheck size={18} strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[15px] font-bold text-gray-900 leading-tight whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
                LongtyJR
              </p>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-red-500 mt-0.5 whitespace-nowrap">
                Admin Panel
              </p>
            </div>
          )}
        </button>

        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors shrink-0"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        className={[
          "flex-1 flex flex-col overflow-y-auto overflow-x-hidden py-2 scroll-smooth",
          collapsed ? "px-2 items-center" : "px-2.5",
        ].join(" ")}
      >
        {!collapsed ? (
          <SectionLabel>Menu chính</SectionLabel>
        ) : (
          <div className="w-8 h-px bg-gray-100 my-3" />
        )}

        {NAV_MAIN.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} badge={pendingCount} />
        ))}

        {!collapsed ? (
          <>
            <div className="h-px bg-gray-100 mx-1 my-2" />
            <SectionLabel>Hệ thống</SectionLabel>
          </>
        ) : (
          <div className="w-8 h-px bg-gray-100 my-3" />
        )}

        {NAV_SYS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div
        className={[
          "border-t border-red-50 flex flex-col gap-2 shrink-0",
          collapsed ? "px-2 py-3 items-center" : "px-2.5 py-3",
        ].join(" ")}
      >
        {collapsed ? (
          <Tooltip label={displayName} collapsed>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(220,38,38,0.25)] mb-1 mx-auto">
              {initial}
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-br from-red-50 to-white border border-red-100 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(220,38,38,0.25)] shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-800 truncate">{displayName}</p>
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-0.5">
                Admin
              </span>
            </div>
          </div>
        )}

        <Tooltip label="Đăng xuất" collapsed={collapsed}>
          <button
            onClick={handleLogout}
            title={collapsed ? "Đăng xuất" : ""}
            className={[
              "group flex items-center gap-2.5 border border-red-100 text-red-500 text-[13px] font-medium bg-transparent cursor-pointer transition-all duration-150 hover:bg-red-50 hover:border-red-200",
              collapsed
                ? "w-11 h-11 justify-center rounded-full"
                : "w-full px-3.5 py-2.5 rounded-xl justify-start",
            ].join(" ")}
          >
            <LogOut size={15} strokeWidth={2} className="shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </Tooltip>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
    </aside>
  );
}