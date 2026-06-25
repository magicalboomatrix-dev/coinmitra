'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BanknoteArrowDown, BanknoteArrowUp, LogOut, Settings } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/deposits', label: 'Deposits', icon: BanknoteArrowDown },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: BanknoteArrowUp },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadAdmin() {
      const res = await fetch('/api/admin/auth/me');
      if (!res.ok) {
        router.replace('/admin/login');
        return;
      }
      const data = await res.json();
      setEmail(data.admin.email);
    }

    loadAdmin();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-zinc-900 dark:bg-[#090b10] dark:text-white">
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-2 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-[#11151d]/95 lg:inset-y-0 lg:left-0 lg:right-auto lg:w-64 lg:border-r lg:border-t-0 lg:px-4 lg:py-5">
        <div className="hidden lg:block">
          <h1 className="text-xl font-black tracking-tight">Coinmitra Admin</h1>
          <p className="mt-1 truncate text-xs font-semibold text-zinc-500">{email || 'Loading admin...'}</p>
        </div>

        <nav className="grid grid-cols-4 gap-1 lg:mt-8 lg:flex lg:flex-col lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-bold transition-colors lg:min-h-0 lg:flex-row lg:justify-start lg:px-3 lg:py-3 lg:text-sm ${
                  active
                    ? 'bg-[#007aff] text-white'
                    : 'text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 hidden w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5 lg:flex"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="pb-24 lg:ml-64 lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#090b10]/90 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#007aff]">Admin</p>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300 lg:hidden"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
