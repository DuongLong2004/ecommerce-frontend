import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axios";
import {
  Search, Trash2, Check, X, Users, Shield, User,
  ChevronDown, RefreshCw, AlertTriangle, Calendar,
  MoreVertical, ArrowUpDown
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════ */
const AVATAR_COLORS = [
  "from-rose-500 to-orange-400",
  "from-violet-500 to-purple-400",
  "from-cyan-500 to-sky-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-yellow-400",
  "from-pink-500 to-rose-400",
  "from-indigo-500 to-blue-400",
  "from-fuchsia-500 to-pink-400",
];

function Avatar({ name, isAdmin, size = "md" }) {
  const char = (name || "?").charAt(0).toUpperCase();
  const idx = char.charCodeAt(0) % AVATAR_COLORS.length;
  const gradient = isAdmin ? "from-violet-600 to-purple-500" : AVATAR_COLORS[idx];
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}>
      {char}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROLE BADGE / SELECT
══════════════════════════════════════════════════════ */
function RoleSelect({ value, onChange, disabled }) {
  const isAdmin = value === "admin";
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`
          appearance-none pl-2.5 pr-7 py-1.5 rounded-lg text-xs font-semibold
          border cursor-pointer outline-none transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isAdmin
            ? "bg-violet-50 border-violet-200 text-violet-700 focus:ring-2 focus:ring-violet-200"
            : "bg-blue-50 border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-200"
          }
        `}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <ChevronDown
        size={12}
        className={`absolute right-2 pointer-events-none ${isAdmin ? "text-violet-500" : "text-blue-500"}`}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`
      fixed top-5 right-5 z-50 flex items-center gap-3
      px-4 py-3 rounded-xl text-sm font-semibold shadow-lg
      border animate-[slideIn_0.25s_ease]
      ${type === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-red-50 border-red-200 text-red-700"
      }
    `}
      style={{ animation: "slideIn 0.25s ease forwards" }}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
        {type === "success" ? <Check size={13} /> : <X size={12} />}
      </div>
      <span>{msg}</span>
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════════════ */
function ConfirmDialog({ user, onConfirm, onCancel }) {
  const name = user.name || user.fullName || user.email?.split("@")[0] || "người dùng này";
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
      style={{ animation: "fadeIn 0.18s ease forwards" }}
    >
      <div
        className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-2xl border border-gray-100"
        onClick={e => e.stopPropagation()}
        style={{ animation: "slideUp 0.22s cubic-bezier(0.4,0,0.2,1) forwards" }}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 ring-8 ring-red-50/60 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={20} className="text-red-500" />
        </div>

        <h3 className="text-center text-[17px] font-bold text-gray-900 mb-2">Xóa tài khoản?</h3>
        <p className="text-center text-sm text-gray-500 leading-relaxed mb-6">
          Bạn sắp xóa tài khoản <span className="font-semibold text-gray-800">{name}</span>.
          <br />
          <span className="text-xs text-gray-400">Hành động này không thể hoàn tác.</span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-600 transition-all duration-150 cursor-pointer"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-red-200 transition-all duration-150 cursor-pointer"
          >
            <Trash2 size={14} />
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════ */
function StatCard({ label, value, icon: Icon, color }) {
  const styles = {
    red:    { wrap: "bg-red-50 border-red-100",    icon: "bg-red-100 text-red-600",    value: "text-red-700" },
    blue:   { wrap: "bg-blue-50 border-blue-100",  icon: "bg-blue-100 text-blue-600",  value: "text-blue-700" },
    violet: { wrap: "bg-violet-50 border-violet-100", icon: "bg-violet-100 text-violet-600", value: "text-violet-700" },
  };
  const s = styles[color];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.wrap}`}>
      <div className={`w-8 h-8 rounded-lg ${s.icon} flex items-center justify-center flex-shrink-0`}>
        <Icon size={15} />
      </div>
      <div>
        <div className={`text-lg font-extrabold leading-none ${s.value}`}>{value}</div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   FILTER TABS
══════════════════════════════════════════════════════ */
function FilterTabs({ active, onChange, counts }) {
  const tabs = [
    { key: "all",   label: "Tất cả", count: counts.all },
    { key: "user",  label: "User",   count: counts.user },
    { key: "admin", label: "Admin",  count: counts.admin },
  ];
  return (
    <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl">
      {tabs.map(t => {
        const isActive = active === t.key;
        const badgeColor = {
          all:   isActive ? "bg-red-500 text-white"    : "bg-gray-200 text-gray-400",
          user:  isActive ? "bg-blue-500 text-white"   : "bg-gray-200 text-gray-400",
          admin: isActive ? "bg-violet-500 text-white" : "bg-gray-200 text-gray-400",
        }[t.key];
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`
              flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-150 whitespace-nowrap cursor-pointer
              ${isActive
                ? "bg-white shadow-sm text-gray-900 font-semibold"
                : "text-gray-400 hover:text-gray-600"
              }
            `}
          >
            {t.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${badgeColor}`}>
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SKELETON ROW
══════════════════════════════════════════════════════ */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
      <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3 bg-gray-100 animate-pulse rounded-full w-32" />
        <div className="h-2.5 bg-gray-100 animate-pulse rounded-full w-48" />
      </div>
      <div className="h-3 bg-gray-100 animate-pulse rounded-full w-20 hidden md:block" />
      <div className="h-7 bg-gray-100 animate-pulse rounded-lg w-20" />
      <div className="h-8 bg-gray-100 animate-pulse rounded-lg w-16" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   USER ROW
══════════════════════════════════════════════════════ */
function UserRow({ user, index, onDelete, onRoleChange, updating }) {
  const displayName = user.name || user.fullName || user.email?.split("@")[0] || "—";
  const isAdmin = user.role === "admin";
  const isBusy  = updating === user.id;
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  return (
    <div
      className={`group border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors duration-100 ${isBusy ? "opacity-60" : ""}`}
      style={{ animation: `fadeUp 0.3s ${index * 0.04}s ease both` }}
    >
      {/* Desktop: same 4-col grid as thead */}
      <div className="hidden md:grid md:grid-cols-[2fr_1fr_120px_80px] gap-4 items-center px-6 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={displayName} isAdmin={isAdmin} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 truncate">{displayName}</span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[9px] font-bold tracking-wider border border-violet-100 flex-shrink-0">
                  <Shield size={8} /> ADMIN
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 truncate mt-0.5">{user.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={11} className="text-gray-300 flex-shrink-0" />
          <span className="whitespace-nowrap">{joinDate}</span>
        </div>
        <div>
          <RoleSelect value={user.role || "user"} onChange={role => onRoleChange(user.id, role)} disabled={isBusy} />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onDelete(user)}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-100 bg-white hover:bg-red-50 hover:border-red-200 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100 whitespace-nowrap"
          >
            <Trash2 size={12} /> Xóa
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-3 px-4 py-3">
        <Avatar name={displayName} isAdmin={isAdmin} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{displayName}</span>
            {isAdmin && <Shield size={9} className="text-violet-500 flex-shrink-0" />}
          </div>
          <div className="text-xs text-gray-400 truncate">{user.email}</div>
        </div>
        <RoleSelect value={user.role || "user"} onChange={role => onRoleChange(user.id, role)} disabled={isBusy} />
        <button onClick={() => onDelete(user)} disabled={isBusy}
          className="p-2 rounded-lg text-red-400 hover:bg-red-50 border border-transparent hover:border-red-100 disabled:opacity-40 transition-all cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function UserManage() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [toast,      setToast]      = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [updating,   setUpdating]   = useState(null);
  const searchRef = useRef(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const fetchUsers = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await axiosClient.get("/users");
      setUsers(res.data.data || []);
    } catch {
      showToast("Không thể tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleDelete = async () => {
    if (!confirm) return;
    const { user } = confirm;
    setConfirm(null);
    setUpdating(user.id);
    try {
      await axiosClient.delete(`/users/${user.id}`);
      showToast(`Đã xóa tài khoản ${user.name || user.email}`);
      fetchUsers(true);
    } catch {
      showToast("Không thể xóa người dùng", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleRoleChange = async (id, role) => {
    setUpdating(id);
    try {
      await axiosClient.patch(`/users/${id}/role`, { role });
      showToast(`Đã cập nhật vai trò thành ${role === "admin" ? "Admin" : "User"}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể thay đổi vai trò", "error");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter(u => {
    const name  = (u.name || u.fullName || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const q     = search.toLowerCase().trim();
    const matchQ = !q || name.includes(q) || email.includes(q);
    const matchF = filter === "all" || u.role === filter || (filter === "user" && !u.role);
    return matchQ && matchF;
  });

  const counts = {
    all:   users.length,
    user:  users.filter(u => u.role !== "admin").length,
    admin: users.filter(u => u.role === "admin").length,
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes slideIn  { from { opacity:0; transform:translateX(14px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideUp  { from { opacity:0; transform:translateY(16px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes spin     { to { transform: rotate(360deg) } }
        .animate-spin-slow  { animation: spin 0.8s linear infinite; }
      `}</style>

      {toast   && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog user={confirm.user} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}

      <div className="w-full max-w-5xl font-sans" style={{ animation: "fadeUp 0.4s ease both" }}>

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-300" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quản trị hệ thống</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
              Người dùng
            </h1>
            <p className="text-sm text-gray-400">Quản lý tài khoản và phân quyền hệ thống</p>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <StatCard label="Tổng"  value={counts.all}   icon={Users}  color="red"    />
            <StatCard label="User"  value={counts.user}  icon={User}   color="blue"   />
            <StatCard label="Admin" value={counts.admin} icon={Shield} color="violet" />
          </div>
        </div>

        {/* ═══ TOOLBAR ═══ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3"
          style={{ animation: "fadeUp 0.4s 0.06s ease both" }}
        >
          <FilterTabs active={filter} onChange={setFilter} counts={counts} />

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                ref={searchRef}
                placeholder="Tìm tên, email… (Ctrl+K)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="
                  h-9 w-full sm:w-56 pl-8 pr-8 rounded-xl bg-white
                  border border-gray-200 text-sm text-gray-800 placeholder-gray-300
                  outline-none transition-all duration-200
                  focus:border-red-300 focus:ring-2 focus:ring-red-100 focus:w-full sm:focus:w-64
                  shadow-sm
                "
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={9} className="text-gray-500" />
                </button>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchUsers(true)}
              disabled={loading || refreshing}
              title="Làm mới"
              className="
                w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm
                flex items-center justify-center text-gray-400
                hover:border-red-200 hover:text-red-500 hover:bg-red-50
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150 flex-shrink-0 cursor-pointer
              "
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin-slow" : ""} />
            </button>
          </div>
        </div>

        {/* Result info */}
        {!loading && (
          <div className="mb-2.5 px-0.5 text-xs text-gray-400">
            <span className="font-medium text-gray-500">{filtered.length}</span> / {users.length} người dùng
            {search && (
              <> · tìm kiếm "<span className="font-semibold text-gray-700">{search}</span>"</>
            )}
          </div>
        )}

        {/* ═══ TABLE CARD ═══ */}
        <div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          style={{ animation: "fadeUp 0.4s 0.12s ease both" }}
        >
          {/* Table head */}
          {!loading && filtered.length > 0 && (
            <div className="hidden md:grid md:grid-cols-[2fr_1fr_120px_80px] gap-4 px-6 py-3 bg-gray-50/60 border-b border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Người dùng</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngày tham gia</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vai trò</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</span>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div>
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center py-16 px-6 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-1">
                <Users size={22} />
              </div>
              <div className="text-[15px] font-bold text-gray-700">
                {search ? "Không tìm thấy kết quả" : "Chưa có người dùng"}
              </div>
              <div className="text-sm text-gray-400 max-w-xs leading-relaxed">
                {search
                  ? `Không có người dùng nào khớp với "${search}"`
                  : "Danh sách người dùng sẽ hiển thị tại đây"
                }
              </div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-1 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-600 transition-all duration-150 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            /* Rows */
            <div>
              {filtered.map((u, i) => (
                <UserRow
                  key={u.id}
                  user={u}
                  index={i}
                  onDelete={user => setConfirm({ user })}
                  onRoleChange={handleRoleChange}
                  updating={updating}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center gap-2 px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
              <span>Hiển thị <span className="font-medium text-gray-500">{filtered.length}</span> người dùng</span>
              <span className="text-gray-200">·</span>
              <span>Tổng <span className="font-medium text-gray-500">{users.length}</span> tài khoản</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}