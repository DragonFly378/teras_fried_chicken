"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const AUTH_KEY = "tfc_pos_auth";
const SIDEBAR_COLLAPSED_KEY = "tfc_sidebar_collapsed";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/order", label: "Order", icon: ShoppingCart },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const isAuthed = sessionStorage.getItem(AUTH_KEY) === "1";
    if (!isAuthed) {
      router.replace("/login");
      return;
    }
    setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    setHydrated(true);
  }, [router]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    router.replace("/login");
  };

  const pageTitle =
    sidebarItems.find((item) => pathname.startsWith(item.href))?.label ??
    "Dashboard";

  if (!hydrated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-tfc-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-tfc-brown flex flex-col transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[68px]" : "lg:w-64"} w-64`}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/images/logo_bg.svg"
              alt="TFC"
              width={36}
              height={36}
              className="rounded"
            />
          </div>
          <div
            className={`min-w-0 transition-all duration-300 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <h2 className="font-body text-lg text-white font-bold leading-tight truncate">
              Teras FC
            </h2>
            <p className="text-[11px] font-body text-white/50">
              Management System
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${
                  isActive
                    ? "bg-white/10 text-tfc-orange"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span
                  className={`transition-all duration-300 ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block px-3 py-2">
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors w-full ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="w-5 h-5 shrink-0" />
                <span>Minimize</span>
              </>
            )}
          </button>
        </div>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium text-white/60 hover:bg-white/5 hover:text-red-400 transition-colors w-full ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span
              className={`transition-all duration-300 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-tfc-brown/10 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-tfc-brown hover:text-tfc-orange transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-body text-xl text-tfc-brown font-bold">
              {pageTitle}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="hidden lg:flex items-center gap-2 text-sm font-body font-medium text-tfc-muted hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
