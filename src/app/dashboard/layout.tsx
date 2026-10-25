'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  PenSquare,
  Calendar,
  Users,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useSidebarStore, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/post', label: 'Buat Post', icon: PenSquare },
  { href: '/dashboard/scheduler', label: 'Scheduler', icon: Calendar },
  { href: '/dashboard/accounts', label: 'Akun Sosmed', icon: Users },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/post': 'Buat Post',
  '/dashboard/scheduler': 'Scheduler',
  '/dashboard/accounts': 'Akun Sosmed',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, toggle, setCollapsed } = useSidebarStore();
  const { user, logout, loadUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    fetch('/api/supabase/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.configured && data.tablesReady) {
          setSupabaseReady(true);
        }
      })
      .catch(() => setSupabaseReady(false));
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    // Check auth after load
    const stored = localStorage.getItem('socialhub_user');
    if (!stored) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    logout();
    toast.success('Logout berhasil!');
    router.push('/login');
  };

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d1117]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#30363d] bg-[#161b22] transition-all duration-300 lg:relative lg:z-auto
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
          ${mobileOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#30363d] px-4">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-lg bg-[#58a6ff]/10 text-lg">
              📱
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-[#e6edf3] whitespace-nowrap">
                SocialHub
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              toggle();
              setMobileOpen(false);
            }}
            className="hidden rounded-lg p-1.5 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] lg:block"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#58a6ff]/10 text-[#58a6ff]'
                      : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
                  }
                  ${collapsed ? 'lg:justify-center lg:px-0' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[#30363d] p-3">
          <div
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-full bg-[#58a6ff]/20 text-sm font-bold text-[#58a6ff]">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[#e6edf3]">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-xs text-[#8b949e]">
                  {user?.email || 'user@email.com'}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-[#8b949e] hover:bg-[#21262d] hover:text-[#da3633]"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center justify-center rounded-xl py-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#da3633]"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-[#e6edf3]">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {supabaseReady && (
              <div
                title="Database Supabase terhubung & siap menyimpan konten secara cloud!"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#3fb950]/30 bg-[#3fb950]/10 px-3 py-1 text-xs text-[#3fb950] font-medium"
              >
                <span className="h-2 w-2 rounded-full bg-[#3fb950] animate-pulse" />
                Supabase Cloud Connected
              </div>
            )}
            <button className="relative rounded-lg p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#da3633]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#58a6ff]/20 text-sm font-bold text-[#58a6ff]">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
