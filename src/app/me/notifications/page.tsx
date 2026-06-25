'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Home,
  ArrowDown,
  ArrowUpDown,
  Zap,
  User
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpSupportPage() {
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'How to deposit USDT?',
      answer: 'To deposit USDT, go to the Deposit tab on the bottom navigation. Choose your network (TRC20/ERC20), copy the deposit address or scan the QR code, and send USDT from your external wallet or exchange. The deposit will be credited after network confirmation.'
    },
    {
      question: 'How to swap USDT to INR?',
      answer: 'Go to the Swap tab. Enter the amount of USDT you wish to sell. Select an active payment method (Bank Account or UPI), then review the exchange rate and confirm the swap. Once a peer matching is found, the funds will be transferred to your selected account.'
    },
    {
      question: 'How long does withdrawal take?',
      answer: 'Withdrawals are processed automatically. Under normal network conditions, USDT withdrawals take 5-15 minutes to be confirmed on the blockchain. INR bank/UPI transfers are settled instantly once the matching buyer confirms the payment.'
    },
    {
      question: 'What are the transaction fees?',
      answer: 'We offer zero-fee transactions for standard peer-to-peer USDT/INR swaps. For external blockchain deposits or withdrawals, standard network gas fees apply depending on the selected blockchain (TRON/Ethereum).'
    },
    {
      question: 'How to contact support?',
      answer: 'You can click the "Open Live Support" button below to start a live chat session with our 24/7 customer support agents. We are here to assist you with any order disputes or account issues.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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
            Help & Support
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

        {/* FAQ Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left flex flex-col space-y-4">
          {/* FAQ Header Row */}
          <div className="flex items-center space-x-3.5 pb-1 border-b border-black/[0.03] dark:border-white/[0.03]">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-4.5 h-4.5 text-[#007aff]" />
            </div>
            <h2 className="font-bold text-[15px] text-zinc-900 dark:text-white">
              FAQ
            </h2>
          </div>

          {/* Accordion List */}
          <div className="flex flex-col divide-y divide-black/[0.03] dark:divide-white/[0.03] pt-1">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex flex-col">
                  {/* Header/Question */}
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center text-left text-[13px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 flex-shrink-0 ml-4 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Body/Answer */}
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-2.5' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[11.5px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] text-left flex flex-col space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/10 dark:border-blue-500/30">
              <MessageSquare className="w-4.5 h-4.5 text-[#007aff] fill-[#007aff]/10" />
            </div>
            <div>
              <h4 className="font-bold text-[14px] text-zinc-900 dark:text-white leading-tight">
                Contact Support
              </h4>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 leading-normal">
                Need help? Click below to chat with our support team.
              </p>
            </div>
          </div>

          <button className="w-full py-3.5 bg-[#007aff] hover:bg-blue-600 active:scale-[0.99] text-white font-bold rounded-[16px] shadow-sm transition-all flex items-center justify-center space-x-2 text-[13px] cursor-pointer">
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            <span>Open Live Support</span>
          </button>
        </div>

        {/* Version Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/[0.03] dark:border-white/[0.03] rounded-[20px] py-4 px-5 shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex justify-center items-center">
          <span className="text-[11.5px] font-bold text-zinc-400 dark:text-zinc-500 select-none">
            Version 1.0.0
          </span>
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
