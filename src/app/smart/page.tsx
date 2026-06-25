'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ArrowDown,
  ArrowUpDown,
  Zap,
  Home,
  User,
  EyeOff,
  Plus,
  Inbox,
  FileText,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function SmartSwapPage() {
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [autoSwapEnabled, setAutoSwapEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'how-it-works' | 'dispute-guide'>('how-it-works');
  
  // Data states
  const [balance, setBalance] = useState(0.00);
  const [banks, setBanks] = useState<any[]>([]);
  const [upis, setUpis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const rate = 110.00;

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch smart swap config
        const smartRes = await fetch('/api/smart');
        if (smartRes.ok) {
          const smartData = await smartRes.json();
          if (smartData.success) {
            setAutoSwapEnabled(smartData.smartSwapEnabled);
          }
        }

        // Fetch user balance
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success) {
            setBalance(userData.user.balance);
          }
        }

        // Fetch payment methods
        const payRes = await fetch('/api/payment-methods');
        if (payRes.ok) {
          const payData = await payRes.json();
          if (payData.success) {
            setBanks(payData.banks);
            setUpis(payData.upis);
          }
        }
      } catch (err) {
        console.error('Failed to load data for smart page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggleAutoSwap = async () => {
    const newState = !autoSwapEnabled;
    try {
      const res = await fetch('/api/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || 'Failed to update smart swap status', type: 'error' });
      } else {
        setAutoSwapEnabled(newState);
        setToast({ 
          message: `Smart Swap successfully ${newState ? 'enabled' : 'disabled'}!`, 
          type: 'success' 
        });
      }
    } catch (err) {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  const totalPaymentMethods = banks.length + upis.length;

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] text-zinc-800 dark:text-[#fafafa] flex flex-col transition-colors duration-300 pb-28">
      {/* Toast Notification */}
      {toast && (
        <div className={`auth-toast auth-toast--${toast.type}`}>
          <div className="auth-toast-icon">
            {toast.type === 'success' ? '✓' : '!'}
          </div>
          <div className="auth-toast-text">{toast.message}</div>
        </div>
      )}

      {/* Container wrapper */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center w-full mb-5">
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
            Smart Swap
          </h1>

          {/* Right actions: Guide & Language */}
          <div className="flex items-center space-x-1.5">
            {/* Guide Button */}
            <button className="flex items-center space-x-0.5 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Guide</span>
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
          </div>
        </div>

        {/* View Records Row */}
        <Link
          href="/smart/records"
          className="bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-[16px] px-4 py-3 flex items-center justify-between transition-colors cursor-pointer mb-5 block"
        >
          <div className="flex items-center space-x-2">
            <span className="text-[14px] leading-none select-none">📒</span>
            <span className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-400">
              View Records
            </span>
          </div>
          <span className="text-zinc-400 text-sm font-semibold select-none">&gt;</span>
        </Link>

        {/* Smart Swap Toggle Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left mb-4 flex justify-between items-center">
          <div>
            <span className="text-[15px] font-bold text-zinc-900 dark:text-white block leading-tight">
              Smart Swap
            </span>
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 block">
              Auto Swap
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleAutoSwap}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              autoSwapEnabled ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
            aria-label="Toggle Auto Swap"
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                autoSwapEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Swap Rate Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left mb-4">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 block">
            Swap Rate
          </span>
          <span className="text-[17px] font-bold text-orange-500 dark:text-orange-400 mt-1 block">
            1 USDT = ₹{rate.toFixed(2)}
          </span>
        </div>

        {/* USDT Balance Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left mb-4">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 block">
            USDT Balance
          </span>
          <span className="text-[26px] font-bold text-zinc-900 dark:text-white font-display mt-1 block">
            {balance.toFixed(2)} USDT
          </span>
        </div>

        {/* Payment Methods Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white">
              Payment Methods
            </h3>
            <div className="flex items-center space-x-2">
              <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">
                <EyeOff className="w-4 h-4" />
              </button>
              <Link href="/me/payment-methods" className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:opacity-85 cursor-pointer">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-zinc-400 animate-pulse text-xs">Loading methods...</span>
            </div>
          ) : totalPaymentMethods === 0 ? (
            <div className="flex flex-col items-center justify-center py-7 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-100/50 dark:bg-zinc-800/50 mb-3">
                <Inbox className="w-6 h-6 text-zinc-400 dark:text-zinc-500 stroke-[1.5]" />
              </div>
              <span className="text-[13px] text-zinc-400 dark:text-zinc-500 select-none">
                No payment methods
              </span>
              <Link href="/me/payment-methods" className="text-[13px] text-blue-600 dark:text-blue-400 mt-4 font-semibold hover:underline cursor-pointer block">
                + Add Payment Method
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {banks.map((b) => (
                <div key={b.id} className="p-3 bg-zinc-55 dark:bg-[#1c1d21]/20 rounded-xl flex items-center justify-between border border-black/[0.02] dark:border-white/[0.02]">
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-white leading-none">{b.accountHolder}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">Bank: {b.accountNumber.slice(-4)}</p>
                  </div>
                  <span className="text-[9px] font-bold text-[#007aff] bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full select-none">Bank</span>
                </div>
              ))}
              {upis.map((u) => (
                <div key={u.id} className="p-3 bg-zinc-55 dark:bg-[#1c1d21]/20 rounded-xl flex items-center justify-between border border-black/[0.02] dark:border-white/[0.02]">
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-white leading-none font-mono">{u.upiId}</p>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full select-none">UPI</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guide / Instruction Tabs Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left mb-6">
          {/* Tab Headers */}
          <div className="bg-[#e9e9eb] dark:bg-zinc-800/80 p-0.5 rounded-[12px] flex mb-4">
            <button
              onClick={() => setActiveTab('how-it-works')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-[10px] transition-all cursor-pointer ${
                activeTab === 'how-it-works'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => setActiveTab('dispute-guide')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-[10px] transition-all cursor-pointer ${
                activeTab === 'dispute-guide'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Dispute Guide
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'how-it-works' ? (
            <div>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                Smart Swap auto-matches exchanges. When enabled, if a buyer needs INR, the system matches your selected bank or UPI and completes the swap. INR is credited and the equivalent USDT is deducted from your balance.
              </p>

              {/* Step 1 */}
              <div className="mb-4">
                <h4 className="text-[13px] font-bold text-zinc-850 dark:text-zinc-200 flex items-center mb-1 select-none">
                  ① Add Payment Methods
                </h4>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Go to Me — Payment Methods, switch to Bank or UPI tab, and add your accounts. Toggle the green switch to select them for Smart Swap.
                </p>
              </div>

              {/* Step 2 */}
              <div className="mb-4">
                <h4 className="text-[13px] font-bold text-zinc-850 dark:text-zinc-200 flex items-center mb-1 select-none">
                  ① Turn On Smart Swap
                </h4>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Tap the toggle at the top to enable. A minimum USDT balance is required (see amount shown when you try to enable).
                </p>
              </div>

              {/* Step 3 */}
              <div className="mb-4">
                <h4 className="text-[13px] font-bold text-zinc-850 dark:text-zinc-200 flex items-center mb-1 select-none">
                  ① Auto-Matching
                </h4>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  No action needed once enabled. The system auto-matches your payment methods when buyers are detected. View history under View Records.
                </p>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-2.5">
                  Tap the toggle again to disable. No further auto matching occurs. Completed swaps are unaffected.
                </p>
              </div>

              {/* Notes Block */}
              <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-4 mt-4">
                <div className="flex items-center space-x-1.5 text-amber-500 dark:text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4 fill-amber-500/10 stroke-[2]" />
                  <span className="font-bold text-[12px] uppercase tracking-wide">Notes</span>
                </div>
                <ul className="space-y-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium pl-1 list-none">
                  <li className="relative pl-3.5 before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                    Sufficient USDT balance is required during the enabled period
                  </li>
                  <li className="relative pl-3.5 before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                    Payment methods can be added, removed, selected, or deselected at any time
                  </li>
                  <li className="relative pl-3.5 before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                    Exchange rates are identical to manual swap, with the same VIP and tier pricing benefits
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                If a Smart Swap order is delayed or disputed, open View Records, select the transaction, and contact support via Help with your order ID.
              </p>

              <ul className="space-y-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium pl-1 list-none">
                <li className="relative pl-3.5 before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                  Check order status under View Records before raising a dispute.
                </li>
                <li className="relative pl-3.5 before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                  Keep your UTR / reference details ready when contacting support.
                </li>
              </ul>
            </div>
          )}
        </div>

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

          {/* Smart Tab (Active) */}
          <button className="flex flex-col items-center justify-center flex-1 py-1 text-[#007aff] cursor-pointer">
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Smart</span>
          </button>

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
