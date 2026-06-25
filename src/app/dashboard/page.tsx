'use client';

import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  ChevronDown,
  Eye,
  EyeOff,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Zap,
  Home,
  User,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; phone: string; balance: number; isVerified: boolean } | null>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [liveRate, setLiveRate] = useState(111.00);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchRecentRecords() {
      try {
        const res = await fetch('/api/records');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRecentRecords(data.records.slice(0, 2));
          }
        }
      } catch (err) {
        console.error('Failed to load recent activity:', err);
      } finally {
        setRecordsLoading(false);
      }
    }
    fetchRecentRecords();
  }, []);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLiveRate(data.usdtRate);
          }
        }
      } catch (err) {
        console.error('Failed to fetch rate:', err);
      }
    }
    fetchRate();
  }, []);

  const displayId = user ? user.id.slice(-6) : '562520';
  const balance = user ? user.balance.toFixed(2) : '10.00';
  const inrEquivalent = user ? (user.balance * liveRate).toLocaleString('en-IN') : (10 * liveRate).toLocaleString('en-IN');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div>
      {/* Container wrapper */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col space-y-4">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-start">
          {/* User profile & Security ID block */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              {/* Profile Avatar (Burgundy Gradient with Overlapping Rings) */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3a061c] to-[#9c3a3c] flex items-center justify-center relative shadow-sm select-none">
                <div className="w-4 h-4 border border-white/95 rounded-full opacity-90 absolute" />
                <div className="w-4 h-4 border border-white/95 rounded-full opacity-90 translate-x-0.5 translate-y-0.5 absolute" />
              </div>

              {/* Security ID Badge (Purple with Green Shield) */}
              <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#8c3df5] text-white text-[9px] font-bold shadow-xs select-none">
                <ShieldCheck className="w-2.5 h-2.5 text-green-400 fill-green-400/10 stroke-[2.5]" />
                <span>Security ID</span>
              </div>
            </div>
            
            {/* Driller ID (Positioned under Avatar and Badge) */}
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold tracking-tight pl-0.5 select-none font-mono">
              Driller - #{displayId}
            </span>
          </div>

          {/* Top right actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle (Circular Container Button) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#121417] border border-black/[0.04] dark:border-white/5 flex items-center justify-center shadow-xs hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-0.5 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer"
              >
                <span>{selectedLang}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-20 bg-white dark:bg-[#121417] border border-black/5 dark:border-white/10 rounded-lg shadow-lg py-1 text-xs text-zinc-700 dark:text-zinc-300 z-50">
                  {['EN', 'IN'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-zinc-800 font-bold"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Support Help chat bubble (Circular Container Button) */}
            <button
              className="w-8 h-8 rounded-full bg-white dark:bg-[#121417] border border-black/[0.04] dark:border-white/5 flex items-center justify-center shadow-xs hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
              aria-label="Support Chat"
            >
              <MessageCircle className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Card 1: Live Rate Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-[24px] p-5 shadow-sm text-center">
          <h2 className="text-[26px] font-bold font-display tracking-tight text-zinc-900 dark:text-white leading-none">
            1 USDT = ₹{liveRate.toFixed(2)}
          </h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold mt-1.5">
            Live rate - Swap Rate
          </p>

          {/* Divider */}
          <div className="h-[1px] bg-black/[0.04] dark:bg-white/[0.04] my-4" />

          <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center mb-3.5">
            Tier Bonus
          </div>

          {/* 2x2 Tier Bonus Grid */}
          <div className="grid grid-cols-2 gap-y-4">
            {/* Tier 1 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-cm-2xs text-secondary-soft dash-tier-final">
                ₹1,00,000-2,00,000
              </span>
              <span className="text-cm-2xs text-secondary-soft dash-tier-final">
                +₹0.25
              </span>
              <span className="text-cm-2xs text-secondary-soft dash-tier-final">
                Final ₹{(liveRate + 0.25).toFixed(2)}
              </span>
            </div>

            {/* Tier 2 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-cm-2xs text-secondary-soft dash-tier-final">
                ₹2,00,000-3,00,000
              </span>
              <span className="text-[13px] font-bold text-emerald-500 dark:text-emerald-400 mt-0.5">
                +₹0.50
              </span>
              <span className="text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-0.5">
                Final ₹{(liveRate + 0.50).toFixed(2)}
              </span>
            </div>

            {/* Tier 3 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold">
                ₹3,00,000-5,00,000
              </span>
              <span className="text-[13px] font-bold text-emerald-500 dark:text-emerald-400 mt-0.5">
                +₹1.00
              </span>
              <span className="text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-0.5">
                Final ₹112.00
              </span>
            </div>

            {/* Tier 4 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold">
                ₹5,00,000+
              </span>
              <span className="text-[13px] font-bold text-emerald-500 dark:text-emerald-400 mt-0.5">
                +₹1.50
              </span>
              <span className="text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-0.5">
                Final ₹112.50
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: TRC20 USDT Balance Card */}
        <div className="bg-gradient-to-r from-[#007aff] to-[#005ecb] text-white rounded-[24px] p-5 shadow-md relative overflow-hidden">
          {/* Header Row */}
          <div className="flex justify-between items-center text-[12px] font-bold tracking-tight opacity-95">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>TRC20 USDT Balance</span>
            </div>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Balance */}
          <div className="flex items-baseline space-x-2 mt-4 mb-3">
            <span className="text-[34px] font-bold leading-none tracking-tight font-display">
              {hideBalance ? '••••' : balance}
            </span>
            <span className="text-[14px] font-bold tracking-wide">USDT</span>
          </div>

          {/* Rate / INR equivalent */}
          <div className="inline-flex items-center bg-white/15 backdrop-blur-md rounded-full px-3.5 py-1 text-[11px] font-bold select-none">
            = {hideBalance ? '••••' : `₹${inrEquivalent}`} @ ₹{liveRate.toFixed(2)}
          </div>
        </div>

        {/* Card 3: Deposit Card */}
        <Link href="/deposit" className="block cursor-pointer">
          <div className="bg-gradient-to-r from-[#e6f0fa] to-[#f4f8fc] dark:from-[#132c49]/30 dark:to-[#0a1b2e]/30 border border-blue-500/10 dark:border-blue-400/15 rounded-[24px] p-4 flex items-center justify-between shadow-xs hover:opacity-95 transition-opacity">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#007aff] flex items-center justify-center shadow-xs">
                <ArrowDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-zinc-900 dark:text-white leading-tight">
                  Deposit
                </h4>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold mt-1">
                  Receive USDT · TRC20
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Grid: Swap and Smart Swap Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Swap Card */}
          <Link href="/swap" className="block cursor-pointer">
            <div className="bg-gradient-to-br from-[#fff7f0] to-[#fffcf9] dark:from-[#211812] dark:to-[#0f0b08] border border-orange-500/10 rounded-[24px] p-5 flex flex-col space-y-4 shadow-xs hover:opacity-95 transition-opacity h-full">
              <div className="w-10 h-10 rounded-2xl bg-[#ffe8d6] dark:bg-[#3d2414] flex items-center justify-center shadow-xs">
                <ArrowUpDown className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-tight">
                  Swap
                </h4>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold mt-1">
                  USDT → INR
                </p>
              </div>
            </div>
          </Link>

          {/* Smart Swap Card */}
          <Link href="/smart" className="block cursor-pointer">
            <div className="bg-gradient-to-br from-[#f4faf7] to-[#fafdfc] dark:from-[#0e1c17] dark:to-[#070e0b] border border-emerald-500/10 rounded-[24px] p-5 flex flex-col space-y-4 shadow-xs hover:opacity-95 transition-opacity h-full">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-tight">
                  Smart Swap
                </h4>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold mt-1">
                  Auto Swap
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Withdraw Card */}
        <Link
          href="/withdraw"
          className="w-full bg-white dark:bg-[#121417] border border-black/[0.06] dark:border-white/10 rounded-[16px] py-3.5 hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] font-bold text-[13px] text-zinc-700 dark:text-zinc-300 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs block text-center"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Withdraw</span>
        </Link>

        {/* Exchange Rates */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white">
              Exchange Rates
            </h3>
            <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-500 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* WazirX */}
            <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-[20px] p-4 text-center shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-cyan-500" />
              <h4 className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tight">
                WazirX
              </h4>
              <p className="text-[18px] font-bold text-zinc-900 dark:text-white mt-1.5 leading-none">
                ₹99.82
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1">
                P2P
              </p>
            </div>

            {/* Binance */}
            <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-[20px] p-4 text-center shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
              <h4 className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tight">
                Binance
              </h4>
              <p className="text-[18px] font-bold text-zinc-900 dark:text-white mt-1.5 leading-none">
                ₹103.50
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1">
                P2P
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white">
              Recent Activity
            </h3>
            <Link href="/dashboard/records" className="text-[11px] font-bold text-[#007aff] hover:opacity-80 cursor-pointer">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {recordsLoading ? (
              <div className="text-center py-4 text-xs text-zinc-400 animate-pulse font-bold">
                Loading activities...
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-[20px] p-8 text-center shadow-xs">
                <span className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 select-none">
                  No recent activities
                </span>
              </div>
            ) : (
              recentRecords.map((record) => {
                let IconComponent = ArrowDown;
                let iconColorClass = 'text-blue-500';
                let iconBgClass = 'bg-blue-50 dark:bg-blue-950/20';
                let amountColorClass = 'text-[#198754] dark:text-[#8ce99a]';

                if (record.type === 'Deposit') {
                  IconComponent = ArrowDown;
                  iconColorClass = 'text-emerald-500';
                  iconBgClass = 'bg-emerald-50 dark:bg-emerald-950/20';
                  amountColorClass = 'text-[#198754] dark:text-[#8ce99a]';
                } else if (record.type === 'Withdraw') {
                  IconComponent = ArrowUp;
                  iconColorClass = 'text-rose-500';
                  iconBgClass = 'bg-red-50 dark:bg-red-950/20';
                  amountColorClass = 'text-rose-500 dark:text-rose-400';
                } else if (record.type === 'Swap') {
                  IconComponent = ArrowUpDown;
                  iconColorClass = 'text-orange-500';
                  iconBgClass = 'bg-orange-50 dark:bg-orange-950/20';
                  amountColorClass = 'text-orange-500 dark:text-orange-400';
                }

                if (record.status === 'Failed') {
                  amountColorClass = 'text-rose-500 dark:text-rose-400';
                }

                const getRecordTitle = (type: string, status: string) => {
                  if (status === 'Failed') return `${type} failed`;
                  if (status === 'Pending') return `${type} pending`;
                  return `${type} success`;
                };

                const dateTimeStr = new Date(record.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });

                return (
                  <div key={record.id} className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-[20px] p-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full ${iconBgClass} flex items-center justify-center`}>
                        <IconComponent className={`w-4 h-4 ${iconColorClass}`} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-[13px] text-zinc-900 dark:text-white leading-tight">
                          {getRecordTitle(record.type, record.status)}
                        </h4>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1">
                          {dateTimeStr}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[13px] font-bold ${amountColorClass}`}>
                      {record.displayAmount}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>

      {/* Floating Bottom Nav Bar */}
      <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 px-4">
        <div className="w-full max-w-md bg-white/70 dark:bg-[#121417]/70 backdrop-blur-lg border border-black/[0.04] dark:border-white/10 rounded-full px-3 py-2 flex justify-between items-center shadow-lg">
          {/* Home Tab (Active) */}
          <button className="flex flex-col items-center justify-center flex-1 py-1 text-[#007aff] cursor-pointer">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Home</span>
          </button>

          {/* Deposit Tab */}
          <Link href="/deposit" className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">
            <ArrowDown className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Deposit</span>
          </Link>

          {/* Swap Tab */}
          <Link href="/swap" className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">
            <ArrowUpDown className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Swap</span>
          </Link>

          {/* Smart Tab */}
          <Link href="/smart" className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Smart</span>
          </Link>

          {/* Me Tab */}
          <Link href="/me" className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Me</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

