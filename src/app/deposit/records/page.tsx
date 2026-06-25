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

interface DepositRecord {
  id: string;
  type: string;
  dateTime: string;
  amount: string;
  status: 'Failed' | 'Success' | 'Pending';
}

export default function DepositRecordsPage() {
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [records, setRecords] = useState<DepositRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch('/api/deposit');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const formatted = data.deposits.map((tx: any) => ({
              id: tx.id,
              type: tx.type,
              dateTime: new Date(tx.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              amount: `+${tx.amount.toFixed(2)} USDT`,
              status: tx.status
            }));
            setRecords(formatted);
          }
        }
      } catch (err) {
        console.error('Failed to load deposit records:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecords();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] text-zinc-800 dark:text-[#fafafa] flex flex-col transition-colors duration-300 pb-24">
      {/* Container wrapper */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center w-full mb-5">
          {/* Blue Back Arrow pointing to /deposit */}
          <Link
            href="/deposit"
            className="p-2 -ml-2 rounded-full text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          {/* Centered Title */}
          <h1 className="text-[17px] font-bold text-zinc-900 dark:text-white font-display select-none">
            Deposit Records
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

        {/* Scrollable Records List */}
        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-zinc-400 animate-pulse text-sm">Loading records...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-12 flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.015)] min-h-[14rem]">
              <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 select-none">
                No deposit records
              </span>
            </div>
          ) : (
            records.map((record) => {
              const statusColors = 
                record.status === 'Success' 
                  ? { text: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500 dark:bg-emerald-400' }
                  : record.status === 'Pending'
                    ? { text: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500 dark:bg-amber-400' }
                    : { text: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500 dark:bg-rose-400' };

              return (
                <div
                  key={record.id}
                  className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] p-4 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.015)]"
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Left Downward Icon */}
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-[#007aff]/15 flex items-center justify-center text-[#007aff] flex-shrink-0">
                      <ArrowDown className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    
                    {/* Transaction details */}
                    <div className="text-left">
                      <h4 className="font-bold text-[15px] text-zinc-800 dark:text-white leading-tight">
                        {record.type}
                      </h4>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                        {record.dateTime}
                      </p>
                    </div>
                  </div>

                  {/* Amount and Status details */}
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-emerald-500 dark:text-emerald-400 tracking-wide block leading-none font-display">
                      {record.amount}
                    </span>
                    <span className={`text-[11px] font-semibold ${statusColors.text} mt-1.5 inline-flex items-center select-none`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors.bg} mr-1 inline-block`} />
                      {record.status}
                    </span>
                  </div>
                </div>
              );
            })
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

          {/* Deposit Tab (Active) */}
          <Link href="/deposit" className="flex flex-col items-center justify-center flex-1 py-1 text-[#007aff] cursor-pointer">
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
