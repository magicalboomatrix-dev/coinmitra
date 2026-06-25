'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ArrowDown,
  ArrowUpDown,
  Zap,
  Home,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('0.00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [minDeposit, setMinDeposit] = useState(10);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMinDeposit(data.minDeposit);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    }
    fetchSettings();
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

  // Handle focus behavior for cleaner input handling
  const handleFocus = () => {
    if (amount === '0.00' || amount === '0') {
      setAmount('');
    }
  };

  const handleBlur = () => {
    if (amount.trim() === '') {
      setAmount('0.00');
    } else {
      // Formats the value as 2 decimal points if it represents a valid number
      const parsed = parseFloat(amount);
      if (!isNaN(parsed)) {
        setAmount(parsed.toFixed(2));
      }
    }
  };

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < minDeposit) {
      setToast({ message: `Minimum deposit is ${minDeposit} USDT`, type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val.toString() })
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || 'Failed to submit deposit', type: 'error' });
      } else {
        setToast({ message: 'Deposit request created. Pending admin verification.', type: 'success' });
        setAmount('0.00');
      }
    } catch (err) {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] text-zinc-800 dark:text-[#fafafa] flex flex-col transition-colors duration-300 pb-24">
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
          {/* Blue Back Arrow */}
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-full text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          {/* Centered Title */}
          <h1 className="text-[17px] font-bold text-zinc-900 dark:text-white font-display select-none">
            Deposit USDT
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

        {/* View Records Row */}
        <Link
          href="/deposit/records"
          className="bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-[16px] px-4 py-3 flex items-center justify-between transition-colors cursor-pointer mb-5 block"
        >
          <div className="flex items-center space-x-2">
            <span className="text-[14px] leading-none select-none">📄</span>
            <span className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-400">
              View Records
            </span>
          </div>
          <span className="text-zinc-400 text-sm font-semibold select-none">&gt;</span>
        </Link>

        {/* Network Selection */}
        <div className="mb-5">
          <span className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5 block text-left">
            Network
          </span>
          <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-4 flex items-center space-x-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            {/* Tron TRC20 Token Icon */}
            <div className="w-11 h-11 rounded-xl bg-[#007aff] flex items-center justify-center font-display text-lg font-extrabold text-white flex-shrink-0 select-none shadow-sm shadow-[#007aff]/20">
              T
            </div>
            <div className="text-left flex-1">
              <h4 className="font-bold text-[15px] text-zinc-800 dark:text-white leading-tight">
                TRC20
              </h4>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                TRON network - low fees
              </p>
            </div>
          </div>
        </div>

        {/* Amount Input Card */}
        <div className="mb-6">
          <span className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5 block text-left">
            Amount
          </span>
          <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-left">
            {/* Input field */}
            <input
              type="text"
              value={amount}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setAmount(val);
                }
              }}
              className="w-full bg-transparent border-0 text-[38px] font-bold text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 focus:outline-none focus:ring-0 p-0 mb-4 font-display tracking-tight"
              placeholder="0.00"
            />

            {/* Quick Pills */}
            <div className="flex space-x-2">
              {['50', '100', '500'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(parseFloat(amt).toFixed(2))}
                  className="px-6 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-[12px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer select-none"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDeposit}
          disabled={isProcessing}
          className="w-full py-4 bg-[#5da2f8] hover:bg-blue-600 active:scale-[0.99] text-white font-semibold rounded-[16px] shadow-sm transition-all text-[15px] cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Deposit'}
        </button>

        {/* Helper subtext */}
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 text-center mt-3 block select-none">
          Minimum deposit: {minDeposit} USDT
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

          {/* Deposit Tab (Active) */}
          <button className="flex flex-col items-center justify-center flex-1 py-1 text-[#007aff] cursor-pointer">
            <ArrowDown className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Deposit</span>
          </button>

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
