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
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function SwapPage() {
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('0.00');
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [balance, setBalance] = useState(10.00);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [rate, setRate] = useState(111.00);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRate(data.usdtRate);
          }
        }
      } catch (err) {
        console.error('Failed to fetch rate:', err);
      }
    }
    fetchRate();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBalance(data.user.balance);
          }
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    }
    loadUser();
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

  // Calculate dynamic swap conversion whenever You Pay amount changes
  useEffect(() => {
    const val = parseFloat(payAmount);
    if (isNaN(val) || val <= 0) {
      setReceiveAmount(0);
    } else {
      setReceiveAmount(val * rate);
    }
  }, [payAmount, rate]);

  // Handle focus behavior for cleaner input handling
  const handleFocus = () => {
    if (payAmount === '0.00' || payAmount === '0') {
      setPayAmount('');
    }
  };

  const handleBlur = () => {
    if (payAmount.trim() === '') {
      setPayAmount('0.00');
    } else {
      // Formats the value as 2 decimal points if it represents a valid number
      const parsed = parseFloat(payAmount);
      if (!isNaN(parsed)) {
        setPayAmount(parsed.toFixed(2));
      }
    }
  };

  const handlePreset = (preset: string) => {
    if (preset === 'MAX') {
      setPayAmount(balance.toFixed(2));
    } else {
      setPayAmount(parseFloat(preset).toFixed(2));
    }
  };

  const handleSwap = async () => {
    const val = parseFloat(payAmount);
    if (isNaN(val) || val <= 0) {
      setToast({ message: 'Enter a valid swap amount', type: 'error' });
      return;
    }
    if (val > balance) {
      setToast({ message: 'Insufficient balance', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val.toString() })
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || 'Failed to execute swap', type: 'error' });
      } else {
        setToast({ message: 'Swap completed successfully!', type: 'success' });
        setBalance(prev => prev - val);
        setPayAmount('0.00');
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
            Swap
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
          href="/swap/records"
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

        {/* Swap Rate Card */}
        <div className="mb-4">
          <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-4 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
            <div className="text-left">
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 block">
                Swap Rate
              </span>
              <span className="text-[17px] font-bold text-zinc-800 dark:text-white mt-1 block">
                1 USDT = ₹{rate.toFixed(2)}
              </span>
            </div>
            <RefreshCw className="w-5 h-5 text-zinc-400 dark:text-zinc-500 stroke-[1.8] cursor-pointer hover:rotate-180 transition-transform duration-300" />
          </div>
        </div>

        {/* You Pay Card (Focused Outline Ring) */}
        <div className="mb-4">
          <div className="bg-white dark:bg-[#121417] border-2 border-blue-500 rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,74,250,0.08)] text-left">
            {/* Card Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500">
                You pay
              </span>
              <span className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500">
                Balance: {balance.toFixed(2)} USDT
              </span>
            </div>

            {/* Input Row */}
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                value={payAmount}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) {
                    setPayAmount(val);
                  }
                }}
                className="bg-transparent border-0 text-[38px] font-bold text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 focus:outline-none focus:ring-0 p-0 font-display tracking-tight flex-1"
                placeholder="0.00"
              />
              <span className="text-[14px] font-bold text-zinc-400 dark:text-zinc-500 select-none ml-2">
                USDT
              </span>
            </div>

            {/* Quick Pills */}
            <div className="flex space-x-2">
              {['100', '500', 'MAX'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="px-6 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-[12px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer select-none"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* You Receive Card */}
        <div className="mb-6">
          <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left">
            <span className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 block mb-3">
              You receive
            </span>

            {/* Display Row */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[38px] font-bold text-orange-500 dark:text-orange-400 font-display tracking-tight leading-none">
                ₹{receiveAmount === 0 ? '0' : receiveAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[14px] font-bold text-zinc-400 dark:text-zinc-500 select-none">
                INR
              </span>
            </div>

            {/* Dynamic Label Helper text */}
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 block">
              Swap rate 1 USDT = ₹{rate.toFixed(2)}
            </span>
            <span className="text-[11px] font-medium text-zinc-300 dark:text-zinc-600 block mt-1">
              Tap to input
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSwap}
          disabled={isProcessing}
          className="w-full py-4 bg-[#5da2f8] hover:bg-blue-600 active:scale-[0.99] text-white font-semibold rounded-[16px] shadow-sm transition-all text-[15px] cursor-pointer flex items-center justify-center space-x-1 disabled:opacity-50"
        >
          <span>{isProcessing ? 'Processing...' : 'Confirm Swap'}</span>
          <span className="text-lg leading-none font-bold">→</span>
        </button>

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

          {/* Swap Tab (Active) */}
          <button className="flex flex-col items-center justify-center flex-1 py-1 text-[#007aff] cursor-pointer">
            <ArrowUpDown className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Swap</span>
          </button>

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
