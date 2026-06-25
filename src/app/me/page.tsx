'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Send,
  CreditCard,
  MapPin,
  ArrowDown,
  ArrowUpDown,
  ArrowUp,
  Clock,
  Users,
  Bell,
  LogOut,
  Home,
  Zap,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyAccountPage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; phone: string; balance: number; isVerified: boolean } | null>(null);

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

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const getMaskedPhone = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '');
    const local = digits.slice(-10);
    if (local.length < 10) return phoneStr;
    return `${local.slice(0, 3)}****${local.slice(-3)}`;
  };

  const phoneDigits = user?.phone ? user.phone.replace(/\D/g, '').slice(-3) : '546';
  const displayId = user ? user.id.slice(-6) : '562520';
  const maskedPhone = user ? getMaskedPhone(user.phone) : '822****546';

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] text-zinc-800 dark:text-[#fafafa] flex flex-col transition-colors duration-300 pb-28">
      {/* Container wrapper */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col space-y-4">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center w-full mb-2">
          {/* Blue Back Arrow pointing to /dashboard */}
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-full text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          {/* Centered Title */}
          <h1 className="text-[17px] font-bold text-zinc-900 dark:text-white font-display select-none">
            My Account
          </h1>

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
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex items-center space-x-4">
          {/* Blue 546 Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-[#007aff] flex items-center justify-center font-display text-[22px] font-bold text-white shadow-sm select-none">
            {phoneDigits}
          </div>
          
          {/* User Details */}
          <div className="flex flex-col text-left">
            <span className="text-[17px] font-bold text-zinc-900 dark:text-white leading-tight font-mono">
              {displayId}
            </span>
            <span className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 block">
              {maskedPhone}
            </span>
            <div className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold w-max select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
              {user?.isVerified ? 'Verified' : 'Verified'}
            </div>
          </div>
        </div>

        {/* Telegram Notifications Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left flex flex-col space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/10 dark:border-blue-500/30">
              <Send className="w-4 h-4 text-[#007aff] fill-[#007aff]/15" />
            </div>
            <div>
              <h4 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-tight">
                Telegram Notifications
              </h4>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 leading-normal">
                Receive real-time order updates on Telegram after binding
              </p>
            </div>
          </div>

          <button className="w-full py-3.5 bg-[#007aff] hover:bg-blue-600 active:scale-[0.99] text-white font-bold rounded-[16px] shadow-sm transition-all flex items-center justify-center space-x-2 text-[13px] cursor-pointer">
            <Send className="w-3.5 h-3.5 fill-white stroke-[2.5]" />
            <span>Bind Telegram</span>
          </button>
        </div>

        {/* Navigation Menu List Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col divide-y divide-black/[0.03] dark:divide-white/[0.03]">
          {/* Item 1: My Bank Accounts */}
          <Link href="/me/payment-methods?tab=bank" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <CreditCard className="w-4.5 h-4.5 text-blue-500 stroke-[2]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">My Bank Accounts</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>

          {/* Item 2: My Addresses */}
          <Link href="/smart" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <MapPin className="w-4.5 h-4.5 text-blue-500 stroke-[2]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">My Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>

          {/* Item 3: Deposit Records */}
          <Link href="/deposit/records" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <ArrowDown className="w-4.5 h-4.5 text-blue-500 stroke-[2.5]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Deposit Records</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>

          {/* Item 4: Swap Records */}
          <Link href="/swap/records" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <ArrowUpDown className="w-4.5 h-4.5 text-blue-500 stroke-[2]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Swap Records</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>

          {/* Item 5: Withdraw Records */}
          <Link href="/withdraw/records" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <ArrowUp className="w-4.5 h-4.5 text-blue-500 stroke-[2.5]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Withdraw Records</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>

          {/* Item 6: Recent Activity */}
          <Link href="/dashboard/records" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <Clock className="w-4.5 h-4.5 text-blue-500 stroke-[2]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Recent Activity</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>

          {/* Item 7: Agent Center */}
          <Link href="/me/agent-center" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <Users className="w-4.5 h-4.5 text-blue-500 stroke-[2]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Agent Center</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>
        </div>


        {/* Notifications Row Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden">
          <Link href="/me/notifications" className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer w-full text-left">
            <div className="flex items-center space-x-3.5">
              <Bell className="w-4.5 h-4.5 text-blue-500 stroke-[2]" />
              <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650" />
          </Link>
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={handleSignOut}
          className="w-full py-4 bg-red-500/5 hover:bg-red-500/10 active:scale-[0.99] border border-red-500/15 dark:border-red-500/30 text-red-500 dark:text-red-400 font-bold rounded-[20px] transition-all flex items-center justify-center space-x-2 text-[14px] cursor-pointer"
        >
          <LogOut className="w-4 h-4 rotate-180" />
          <span>Sign Out</span>
        </button>

        {/* Version Footer */}
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 text-center select-none block pt-2 pb-4">
          Coinmitra v1.0.1 - Mobile H5
        </span>

      </main>

      {/* Floating Bottom Nav Bar */}
      <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 px-4">
        <div className="w-full max-w-md bg-white/80 dark:bg-[#121417]/80 backdrop-blur-lg border border-black/[0.04] dark:border-white/10 rounded-full px-3 py-2 flex justify-between items-center shadow-lg">
          {/* Home Tab */}
          <Link href="/dashboard" className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Home</span>
          </Link>

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

          {/* Me Tab (Active) */}
          <button className="flex flex-col items-center justify-center flex-1 py-1 text-[#007aff] cursor-pointer">
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Me</span>
          </button>
        </div>
      </div>
    </div>
  );
}
