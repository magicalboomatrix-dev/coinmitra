'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Users,
  Home,
  ArrowDown,
  ArrowUpDown,
  Zap,
  User,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function AgentCenterPage() {
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteCode = 'eps7gXRhWz22';
  const shareLink = 'https://angelx.exchange?code=eps7gXRhWz22';

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const commissionLevels = [
    { level: 'L1', description: 'Your direct friend', rate: '0.1%' },
    { level: 'L2', description: 'Friend of your friend', rate: '0.03%' },
    { level: 'L3', description: "Friend's friend's friend", rate: '0.02%' },
    { level: 'L4', description: 'One level deeper', rate: '0.01%' },
    { level: 'L5', description: 'Two levels deeper', rate: '0.01%' }
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] text-zinc-800 dark:text-[#fafafa] flex flex-col transition-colors duration-300 pb-28">
      {/* Container wrapper */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col space-y-4">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center w-full mb-2">
          {/* Blue Back Arrow pointing to /me */}
          <Link
            href="/me"
            className="p-2 -ml-2 rounded-full text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          {/* Centered Title */}
          <h1 className="text-[17px] font-bold text-zinc-900 dark:text-white font-display select-none">
            Agent Center
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

        {/* My Invite Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left flex flex-col space-y-4">
          <h2 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-tight">
            My Invite
          </h2>

          {/* Mock QR Code Frame */}
          <div className="flex justify-center py-2">
            <div className="p-3 bg-white border border-black/[0.04] dark:border-white/10 rounded-2xl shadow-sm flex items-center justify-center">
              {/* Premium Vector SVG QR Code */}
              <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-800 dark:text-zinc-900">
                {/* Finder pattern Top-Left */}
                <rect x="0" y="0" width="36" height="36" fill="currentColor" />
                <rect x="4" y="4" width="28" height="28" fill="white" />
                <rect x="10" y="10" width="16" height="16" fill="currentColor" />

                {/* Finder pattern Top-Right */}
                <rect x="92" y="0" width="36" height="36" fill="currentColor" />
                <rect x="96" y="4" width="28" height="28" fill="white" />
                <rect x="102" y="10" width="16" height="16" fill="currentColor" />

                {/* Finder pattern Bottom-Left */}
                <rect x="0" y="92" width="36" height="36" fill="currentColor" />
                <rect x="4" y="96" width="28" height="28" fill="white" />
                <rect x="102" y="102" width="1" height="1" fill="white" /> {/* spacer */}
                <rect x="10" y="102" width="16" height="16" fill="currentColor" />

                {/* Alignment block */}
                <rect x="84" y="84" width="10" height="10" fill="currentColor" />
                <rect x="86" y="86" width="6" height="6" fill="white" />
                <rect x="88" y="88" width="2" height="2" fill="currentColor" />

                {/* Random QR pixels for detail */}
                <rect x="44" y="4" width="8" height="8" fill="currentColor" />
                <rect x="60" y="8" width="8" height="12" fill="currentColor" />
                <rect x="48" y="20" width="12" height="8" fill="currentColor" />
                <rect x="76" y="12" width="8" height="8" fill="currentColor" />
                
                <rect x="4" y="44" width="8" height="8" fill="currentColor" />
                <rect x="16" y="52" width="12" height="12" fill="currentColor" />
                <rect x="4" y="72" width="8" height="8" fill="currentColor" />
                <rect x="24" y="76" width="8" height="12" fill="currentColor" />

                <rect x="116" y="44" width="8" height="8" fill="currentColor" />
                <rect x="104" y="56" width="12" height="8" fill="currentColor" />
                <rect x="112" y="72" width="12" height="12" fill="currentColor" />
                <rect x="96" y="76" width="8" height="8" fill="currentColor" />

                <rect x="44" y="96" width="12" height="8" fill="currentColor" />
                <rect x="68" y="92" width="8" height="12" fill="currentColor" />
                <rect x="52" y="112" width="16" height="8" fill="currentColor" />
                <rect x="76" y="108" width="8" height="16" fill="currentColor" />

                {/* Center randomized blocks */}
                <rect x="44" y="44" width="12" height="12" fill="currentColor" />
                <rect x="68" y="44" width="8" height="8" fill="currentColor" />
                <rect x="80" y="48" width="8" height="16" fill="currentColor" />
                <rect x="44" y="68" width="16" height="8" fill="currentColor" />
                <rect x="64" y="60" width="12" height="12" fill="currentColor" />
                <rect x="80" y="72" width="8" height="8" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Invite Code Row */}
          <div className="bg-[#f2f3f5] dark:bg-[#1b1d22]/50 border border-black/[0.01] dark:border-white/[0.02] rounded-[16px] px-4 py-3.5 flex justify-between items-center shadow-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                Invite Code
              </span>
              <span className="text-[14px] font-bold text-zinc-800 dark:text-white mt-1">
                {inviteCode}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(inviteCode, 'code')}
              className="p-2.5 bg-white dark:bg-[#121417] hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.04] dark:border-white/10 rounded-xl transition-all cursor-pointer text-zinc-500 dark:text-zinc-400 relative active:scale-95"
              aria-label="Copy Invite Code"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Share Link Row */}
          <div className="bg-[#f2f3f5] dark:bg-[#1b1d22]/50 border border-black/[0.01] dark:border-white/[0.02] rounded-[16px] px-4 py-3.5 flex justify-between items-center shadow-xs">
            <div className="flex flex-col flex-1 min-w-0 pr-4">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                Share Link
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate mt-1">
                {shareLink}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(shareLink, 'link')}
              className="p-2.5 bg-white dark:bg-[#121417] hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.04] dark:border-white/10 rounded-xl transition-all cursor-pointer text-zinc-500 dark:text-zinc-400 relative active:scale-95 flex-shrink-0"
              aria-label="Copy Share Link"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Invited Footer */}
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 text-center block select-none">
            0 invited
          </span>
        </div>

        {/* Commission Rate Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left flex flex-col space-y-3.5">
          <h2 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-tight">
            Commission Rate
          </h2>

          <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-normal font-medium">
            Every time someone you invited (or someone they invited) makes a trade, you earn commission.
          </p>

          {/* Example Box */}
          <div className="bg-[#fcf8f2] dark:bg-[#201d18] border border-amber-500/5 rounded-xl p-3.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            <span className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Example:</span>
            You invited Bob. Bob invited Carol.<br />
            Carol trades 1000 USDT → you are Carol's L2.<br />
            You earn L2 0.03% commission = 0.30 USDT
          </div>

          {/* Levels List */}
          <div className="flex flex-col divide-y divide-black/[0.03] dark:divide-white/[0.03] pt-1">
            {commissionLevels.map((lvl) => (
              <div key={lvl.level} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold font-display">
                    {lvl.level}
                  </span>
                  <span className="text-[12.5px] font-bold text-zinc-700 dark:text-zinc-300">
                    {lvl.description}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-[#ff5e00] dark:text-[#ff7626]">
                  {lvl.rate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* My Partners Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left flex flex-col space-y-4">
          <div className="flex items-center space-x-3.5 pb-1 border-b border-black/[0.03] dark:border-white/[0.03]">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4.5 h-4.5 text-[#007aff]" />
            </div>
            <h2 className="font-bold text-[14px] text-zinc-900 dark:text-white">
              My Partners
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 select-none text-center">
              No partners yet
            </span>
          </div>
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
