import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  BarChart3,
  Pickaxe,
  SlidersHorizontal,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  User,
  AlertTriangle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Intelligence Hub", path: "/" },
  { icon: BarChart3, label: "Market Analysis", path: "/market" },
  { icon: Pickaxe, label: "Asset & Cost Curves", path: "/assets" },
  { icon: SlidersHorizontal, label: "Scenarios", path: "/scenarios" },
  { icon: AlertTriangle, label: "Alerts", path: "/alerts" },
  { icon: Database, label: "Data & Exports", path: "/exports" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col bg-white border-r border-[#E5E5E5] transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[#E5E5E5]">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#171717] truncate">Nexus AI</div>
              <div className="text-[10px] text-[#525252] truncate">Metals & Mining</div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-[#EFF6FF] text-[#3B82F6] border-l-[3px] border-[#3B82F6]"
                  : "text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717] border-l-[3px] border-transparent"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-[#3B82F6]" : "text-[#525252] group-hover:text-[#171717]"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* AI Chat Button */}
      <div className="px-2 pb-2">
        <Link
          to="/chat"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
            location.pathname === "/chat"
              ? "bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white"
              : "bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white hover:shadow-lg hover:shadow-blue-500/25"
          )}
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">LensAI Copilot</span>}
        </Link>
      </div>

      {/* User Section */}
      <div className="border-t border-[#E5E5E5] p-3">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#525252]" />
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-[#171717] truncate">{user?.name || "Guest"}</div>
              <button
                onClick={logout}
                className="text-xs text-[#525252] hover:text-[#3B82F6] flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-[#525252]" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-[#525252]" />
        )}
      </button>
    </aside>
  );
}
