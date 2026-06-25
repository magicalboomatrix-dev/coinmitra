'use client';

import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  ChevronDown,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const [selectedMode, setSelectedMode] = useState<'swap' | 'smart'>('smart');
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Pricing constants based on selection
  const [baseRate, setBaseRate] = useState(111.00);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBaseRate(data.usdtRate);
          }
        }
      } catch (err) {
        console.error('Failed to fetch rate:', err);
      }
    }
    fetchRate();
  }, []);

  const Tiers = [
    { range: '₹1,00,000-2,00,000', bonus: 0.25 },
    { range: '₹2,00,000-3,00,000', bonus: 0.50 },
    { range: '₹3,00,000-5,00,000', bonus: 1.00 },
    { range: '₹5,00,000+', bonus: 1.50 },
  ];

  const exchangeRates = [
    { name: 'WazirX', label: '1 USDT · P2P', rate: '₹99.81', avatar: 'W' },
    { name: 'Binance', label: '1 USDT · P2P', rate: '₹103.48', avatar: 'B' },
  ];

  const chainVitals = [
    { symbol: 'BTC', price: '$65,683', change: '+2.10%', isPositive: true },
    { symbol: 'ETH', price: '$1,716.47', change: '+2.34%', isPositive: true },
    { symbol: 'USDT', price: '$0.9993', change: '-0.02%', isPositive: false },
    { symbol: 'BNB', price: '$615.82', change: '+1.03%', isPositive: true },
    { symbol: 'SOL', price: '$70.95', change: '+3.97%', isPositive: true },
    { symbol: 'TRX', price: '$0.3204', change: '+1.44%', isPositive: true },
  ];

  const whyUs = [
    {
      title: 'Instant INR Settlement',
      desc: 'Withdraw to any Indian bank in under 5 minutes.',
      icon: <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400 fill-blue-500/20" />,
    },
    {
      title: 'Rig-Grade Security',
      desc: 'Cold storage and multi-sig for every barrel of USDT.',
      icon: <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400 fill-blue-500/20" />,
    },
    {
      title: 'Best Market Rate',
      desc: 'Aggregated from Binance, OKX, Bybit & more.',
      icon: <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
    },
  ];

  const tickerItems = [
    { symbol: 'ETH', price: '$1,673.14', change: '-0.15%', isPositive: false },
    { symbol: 'USDT', price: '$1', change: '-0.00%', isPositive: false },
    { symbol: 'BNB', price: '$611.76', change: '+0.88%', isPositive: true },
    { symbol: 'BTC', price: '$64,536', change: '+0.87%', isPositive: true },
    { symbol: 'SOL', price: '$68.11', change: '-0.96%', isPositive: false },
    { symbol: 'TRX', price: '$0.3178', change: '+0.48%', isPositive: true },
  ];

  // Repeat the list to ensure smooth continuous marquee
  const doubleTickerItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] text-zinc-800 dark:text-[#fafafa] flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3.5 bg-[#f7f7f7] dark:bg-[#0a0b0d] border-b border-black/[0.03] dark:border-white/[0.03] transition-colors duration-300  w-full max-w-md mx-auto">
        <div className="flex items-center space-x-2.5">
          {/* SVG Overlapping Ring Logo */}
          <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-rose-600 shadow-md">
            <div className="w-5 h-5 border-2 border-white rounded-full opacity-90 absolute" />
            <div className="w-5 h-5 border-2 border-white rounded-full opacity-90 translate-x-1 translate-y-0.5 absolute" />
          </div>
          <div>
            <h1 className="font-display text-[15px] leading-tight text-zinc-900 dark:text-[#fafafa]">Coinmitra</h1>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">Trade · Exchange · Earn</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sign In button */}
          <Link
            href="/login"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-sm transition-all hover:shadow cursor-pointer"
          >
            Sign In
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              <span>{selectedLang}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-20 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-lg shadow-lg py-1 text-xs text-zinc-700 dark:text-zinc-300 z-50">
                {['EN', 'IN'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setLangDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-black/5 dark:hover:bg-zinc-800"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto pb-6">
        <div className="px-4 pt-3">
          <div className="relative rounded-[20px] overflow-hidden border border-border/60 shadow-rig">
            <img
              src="/hero_banner.png"
              alt="USDT INR Cosmos Swap"
              width={1280}
              height={832}
              className="w-full h-[260px] object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-[26px] md:text-[28px] font-semibold leading-[1.15] tracking-tight text-white">
                Instant Swap · Best Rates
              </p>

              <p className="mt-1 text-lg font-medium text-white/80">
                Seconds to Bank · Safe & Reliable
              </p>

              <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
                TRC20 USDT → INR, lightning-fast at low fees
              </p>
            </div>
          </div>
        </div>

        {/* Swap Rate & Selector Cards */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Swap Card (Static Unselected) */}
            <div
              className="p-5 rounded-[24px] text-left border border-transparent bg-white dark:bg-[#121417]/40"
            >
              <div className="flex items-center space-x-2 text-[13px] font-semibold text-blue-500 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#007aff]" />
                <span>Swap</span>
              </div>
              <div className="text-[28px] font-bold font-display leading-none tracking-tight text-zinc-900 dark:text-white">
                ₹{baseRate.toFixed(2)}
              </div>
            </div>

            {/* Smart Card (Static Selected) */}
            <div
              className="p-5 rounded-[24px] text-left border border-emerald-500/30 bg-white dark:bg-[#121417] shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/10"
            >
              <div className="flex items-center space-x-1.5 text-[13px] font-semibold text-emerald-500 mb-4">
                <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                <span>Smart</span>
              </div>
              <div className="text-[28px] font-bold font-display leading-none tracking-tight text-emerald-500 dark:text-emerald-400">
                ₹{(baseRate + 2).toFixed(2)}
              </div>
              <div className="text-[11px] font-semibold mt-1.5 leading-none text-emerald-500 dark:text-emerald-400">
                +₹2.00 Higher
              </div>
            </div>
          </div>
        </div>

        {/* Tier Bonus Grid Box */}
        <div className="px-4 pt-3.5">
          <div className="p-2 bg-[#f4f4f6] dark:bg-[#1c1d22]/40 border border-black/[0.03] dark:border-white/[0.02] rounded-[24px] shadow-xs">
            <div className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mb-4">
              Tier Bonus
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Tiers.map((tier, idx) => {
                const finalValue = (baseRate + tier.bonus).toFixed(2);
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center bg-white dark:bg-[#121417] py-3.5 px-4 rounded-[20px] shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)]"
                  >
                    <span className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
                      {tier.range}
                    </span>
                    <span className="text-[14px] font-bold text-[#10b981] dark:text-emerald-400 mt-1">
                      +₹{tier.bonus.toFixed(2)}
                    </span>
                    <span className="text-[13px] font-semibold text-orange-500 dark:text-orange-400 mt-1">
                      Final ₹{finalValue}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-[12px] text-zinc-400 dark:text-zinc-500 text-center mt-5 font-medium">
              Final rate depends on order amount
            </div>
          </div>
        </div>

        {/* Start Trading Button */}
        <div className="px-4 pt-4">
          <Link
            href="/login"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-full shadow-md shadow-blue-500/10 transition-all flex items-center justify-center space-x-2 text-[13px] cursor-pointer"
          >
            <span>Start Trading</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Token Rates Marquee Ticker */}
        <div className="py-2 bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/[0.03] dark:border-white/[0.03] overflow-hidden relative mt-5">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {doubleTickerItems.map((item, idx) => (
              <div key={idx} className="inline-flex items-center space-x-1.5 mx-5 text-[11px] font-medium">
                <span className={item.isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                  {item.change}
                </span>
                <span className="text-zinc-800 dark:text-[#fafafa] font-bold">
                  {item.symbol}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange Rates List */}
        <div className="px-4 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[17px] font-bold text-zinc-900 dark:text-white">
              Exchange Rates
            </h3>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>

          <div className="space-y-3">
            {exchangeRates.map((exch, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-[18px] bg-white dark:bg-[#121417] border border-black/[0.04] dark:border-white/5 rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-[12px] bg-[#f0f2f5] dark:bg-[#1c1d21] flex items-center justify-center font-semibold text-[16px] text-blue-600 dark:text-blue-400">
                    {exch.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[15px] text-zinc-900 dark:text-white leading-tight">
                      {exch.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                      {exch.label}
                    </p>
                  </div>
                </div>
                <div className="text-[18px] font-bold text-orange-500 dark:text-orange-400">
                  {exch.rate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chain Vitals Grid */}
        <section className="px-4 mt-8">
          <h2 className="font-display text-[17px] font-semibold tracking-tight mb-4">
            Chain vitals
          </h2>

          <div className="grid grid-cols-3 gap-2.5">
            {chainVitals.map((vital, idx) => (
              <div
                key={idx}
                className="glass rounded-xl p-3"
              >
                <p className="font-display font-bold text-xs text-primary">
                  {vital.symbol}
                </p>
                <p className="font-mono text-sm mt-1">
                  {vital.price}
                </p>
                <p className={`text-cm-3xs font-semibold ${
                  vital.isPositive ? 'text-success' : 'text-destructive'
                }`}>
                  {vital.change}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Coinmitra Feature Row List */}
        <div className="px-4 pt-5 pb-2">
          <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3.5">
            Why Coinmitra
          </h3>

          <div className="space-y-3">
            {whyUs.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3.5 p-4 bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/10 dark:border-blue-500/30">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-zinc-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footers */}
        <div className="px-4 pb-4 pt-4 bg-[#f7f7f7] dark:bg-[#0a0b0d] border-t border-black/[0.03] dark:border-white/[0.03] transition-colors duration-300">
          <Link
            href="/login"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-full shadow-md shadow-blue-500/10 transition-all flex items-center justify-center space-x-2 text-[13px] mb-4.5 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center font-medium">
            © 2026 Coinmitra · Mobile H5 preview
          </div>
        </div>

      </main>
    </div>
  );
}
