import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Store, ShoppingCart, Users, LogOut,
  BarChart3, Settings, BookOpen, ChefHat,
} from "lucide-react";
import adminService from "../services/adminService";

interface AdminLayoutProps {
  onLogout: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const user = adminService.getUser();

  const sections: NavSection[] = [
    {
      label: "Platform",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Operations",
      items: [
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { name: "Catalog", href: "/admin/catalog", icon: BookOpen },
        { name: "Categories", href: "/admin/menus", icon: ChefHat },
      ],
    },
    {
      label: "Management",
      items: [
        { name: "Vendors", href: "/admin/vendors", icon: Store },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 w-60 h-screen bg-gray-950 text-white flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
              GE
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">GlobalEats</h2>
              <p className="text-[10px] text-blue-400 font-medium uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          {user && (
            <p className="text-gray-400 text-xs mt-3 truncate">
              {user.name || user.email}
            </p>
          )}
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {sections.map(section => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link to={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isActive
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}>
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={onLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg transition-all">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="bg-gray-50 ml-60 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
