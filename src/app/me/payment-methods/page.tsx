'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Trash2,
  Home,
  User,
  ArrowDown,
  ArrowUpDown,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BankMethod {
  id: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  selectedForSmartSwap: boolean;
}

interface UpiMethod {
  id: string;
  upiId: string;
  selectedForSmartSwap: boolean;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'upi'>('bank');
  const [addingType, setAddingType] = useState<'bank' | 'upi' | null>(null);

  // Form states
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  // Payment methods list state
  const [banks, setBanks] = useState<BankMethod[]>([]);
  const [upis, setUpis] = useState<UpiMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'bank' || tabParam === 'upi') {
        setActiveTab(tabParam as 'bank' | 'upi');
      }
    }
    fetchPaymentMethods();
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

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBanks(data.banks);
          setUpis(data.upis);
        }
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'bank') {
      if (!accountHolder.trim() || !accountNumber.trim() || !ifsc.trim()) {
        setToast({ message: 'Please fill in all bank details', type: 'error' });
        return;
      }
    } else {
      if (!upiId.trim()) {
        setToast({ message: 'Please enter a UPI ID', type: 'error' });
        return;
      }
    }

    try {
      const payload = activeTab === 'bank' 
        ? { type: 'bank', accountHolder, accountNumber, ifsc }
        : { type: 'upi', upiId };

      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || 'Failed to save payment method', type: 'error' });
      } else {
        setToast({ message: 'Payment method saved successfully!', type: 'success' });
        // Reset form
        setAccountHolder('');
        setAccountNumber('');
        setIfsc('');
        setUpiId('');
        setAddingType(null);
        // Refresh list
        fetchPaymentMethods();
      }
    } catch (err) {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  const handleDelete = async (id: string, type: 'bank' | 'upi') => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      const res = await fetch(`/api/payment-methods?id=${id}&type=${type}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || 'Failed to delete payment method', type: 'error' });
      } else {
        setToast({ message: 'Payment method deleted successfully!', type: 'success' });
        fetchPaymentMethods();
      }
    } catch (err) {
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
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
          {/* Dynamic back arrow */}
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Centered Title */}
          <h1 className="text-[17px] font-bold text-zinc-900 dark:text-white font-display select-none">
            Payment Methods
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

        {/* Tab Selection Row */}
        <div className="bg-[#e9e9eb] dark:bg-zinc-800 p-0.5 rounded-[14px] flex mb-6 shadow-xs">
          <button
            onClick={() => { setActiveTab('bank'); setAddingType(null); }}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-[12px] transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Bank Accounts
          </button>
          <button
            onClick={() => { setActiveTab('upi'); setAddingType(null); }}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-[12px] transition-all cursor-pointer ${
              activeTab === 'upi'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            UPI
          </button>
        </div>

        {/* Tab Content Body */}
        {activeTab === 'bank' ? (
          addingType === 'bank' ? (
            <form onSubmit={handleSave} className="flex flex-col text-left">
              <span className="text-[13px] font-semibold text-zinc-400 dark:text-zinc-500 mb-4 block">
                Add bank account
              </span>

              {/* Account Holder Input */}
              <div className="bg-white dark:bg-[#121417] border border-black/[0.04] dark:border-white/10 rounded-[16px] px-4 py-3.5 flex flex-col mb-4 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider select-none">
                  ACCOUNT HOLDER
                </span>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="bg-transparent border-none outline-none p-0 text-[14px] font-semibold text-zinc-800 dark:text-white mt-1.5 w-full focus:ring-0 focus:outline-none"
                  aria-label="Account Holder Name"
                  required
                />
              </div>

              {/* Account Number Input */}
              <div className="bg-white dark:bg-[#121417] border border-black/[0.04] dark:border-white/10 rounded-[16px] px-4 py-3.5 flex flex-col mb-4 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider select-none">
                  ACCOUNT NUMBER
                </span>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="bg-transparent border-none outline-none p-0 text-[14px] font-semibold text-zinc-800 dark:text-white mt-1.5 w-full focus:ring-0 focus:outline-none"
                  aria-label="Account Number"
                  required
                />
              </div>

              {/* IFSC Input */}
              <div className="bg-white dark:bg-[#121417] border border-black/[0.04] dark:border-white/10 rounded-[16px] px-4 py-3.5 flex flex-col mb-6 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider select-none">
                  IFSC
                </span>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="bg-transparent border-none outline-none p-0 text-[14px] font-semibold text-zinc-800 dark:text-white mt-1.5 w-full focus:ring-0 focus:outline-none"
                  aria-label="IFSC Code"
                  required
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-4 bg-[#5da2f8] hover:bg-blue-600 active:scale-[0.99] text-white font-bold rounded-[16px] shadow-sm transition-all text-[15px] cursor-pointer mb-3.5"
              >
                Save
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setAddingType(null)}
                className="w-full py-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 font-bold rounded-[16px] transition-all text-[15px] cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex flex-col space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-zinc-400 animate-pulse text-sm">Loading accounts...</span>
                </div>
              ) : banks.length === 0 ? (
                <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-12 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.015)] min-h-[10rem]">
                  <span className="text-[14px] font-bold text-zinc-500 dark:text-zinc-400 select-none text-center">
                    No bank accounts yet
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {banks.map((bank) => (
                    <div
                      key={bank.id}
                      className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-4 flex items-center justify-between shadow-sm text-left"
                    >
                      <div>
                        <h4 className="font-bold text-[14px] text-zinc-850 dark:text-white leading-tight">
                          {bank.accountHolder}
                        </h4>
                        <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
                          A/C: {bank.accountNumber} &middot; IFSC: {bank.ifsc}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(bank.id, 'bank')}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete Bank Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Bank Account Button */}
              <button
                onClick={() => setAddingType('bank')}
                className="w-full py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[16px] text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 hover:bg-zinc-100/30 active:scale-[0.99] transition-all cursor-pointer"
              >
                + Add bank account
              </button>
            </div>
          )
        ) : (
          addingType === 'upi' ? (
            <form onSubmit={handleSave} className="flex flex-col text-left">
              <span className="text-[13px] font-semibold text-zinc-400 dark:text-zinc-500 mb-4 block">
                Add UPI account
              </span>

              {/* UPI ID Input */}
              <div className="bg-white dark:bg-[#121417] border border-black/[0.04] dark:border-white/10 rounded-[16px] px-4 py-3.5 flex flex-col mb-6 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider select-none">
                  UPI ID (VPA)
                </span>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="bg-transparent border-none outline-none p-0 text-[14px] font-semibold text-zinc-800 dark:text-white mt-1.5 w-full focus:ring-0 focus:outline-none"
                  aria-label="UPI ID"
                  placeholder="name@upi"
                  required
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-4 bg-[#5da2f8] hover:bg-blue-600 active:scale-[0.99] text-white font-bold rounded-[16px] shadow-sm transition-all text-[15px] cursor-pointer mb-3.5"
              >
                Save
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setAddingType(null)}
                className="w-full py-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 font-bold rounded-[16px] transition-all text-[15px] cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex flex-col space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-zinc-400 animate-pulse text-sm">Loading UPI IDs...</span>
                </div>
              ) : upis.length === 0 ? (
                <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-12 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.015)] min-h-[10rem]">
                  <span className="text-[14px] font-bold text-zinc-500 dark:text-zinc-400 select-none text-center">
                    No UPI IDs yet
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {upis.map((upi) => (
                    <div
                      key={upi.id}
                      className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-4 flex items-center justify-between shadow-sm text-left"
                    >
                      <div>
                        <h4 className="font-bold text-[14px] text-zinc-850 dark:text-white leading-tight font-mono">
                          {upi.upiId}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDelete(upi.id, 'upi')}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete UPI ID"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add UPI Account Button */}
              <button
                onClick={() => setAddingType('upi')}
                className="w-full py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[16px] text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 hover:bg-zinc-100/30 active:scale-[0.99] transition-all cursor-pointer"
              >
                + Add UPI account
              </button>
            </div>
          )
        )}

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
          <Link href="/me" className="flex flex-col items-center justify-center flex-1 py-1 text-[#007aff] cursor-pointer">
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5">Me</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
