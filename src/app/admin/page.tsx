'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Check,
  X,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Moon,
  Sun,
  Inbox,
  TrendingUp,
  DollarSign,
  Save
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  userId: string;
  userPhone: string;
  type: 'Deposit' | 'Withdraw' | 'Swap';
  amount: number;
  inrAmount: number;
  rate: number;
  status: 'Pending' | 'Success' | 'Failed';
  remarks: string;
  createdAt: string;
}

export default function AdminPortal() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Success' | 'Failed'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Deposit' | 'Withdraw' | 'Swap'>('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for remarks input per pending transaction
  const [remarksInputs, setRemarksInputs] = useState<{ [txId: string]: string }>({});
  
  // State for submit actions loading state per transaction
  const [processingTx, setProcessingTx] = useState<{ [txId: string]: 'approve' | 'reject' | null }>({});

  // Exchange Rate State
  const [currentRate, setCurrentRate] = useState<number>(111.00);
  const [newRateInput, setNewRateInput] = useState<string>('111.00');
  const [currentMinDeposit, setCurrentMinDeposit] = useState<number>(10);
  const [newMinDepositInput, setNewMinDepositInput] = useState<string>('10');
  const [currentMinWithdraw, setCurrentMinWithdraw] = useState<number>(10);
  const [newMinWithdrawInput, setNewMinWithdrawInput] = useState<string>('10');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchTransactions = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTransactions(data.transactions);
        } else {
          showToast(data.error || 'Failed to fetch transactions', 'error');
        }
      } else {
        showToast('Server error while loading transactions', 'error');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      showToast('Network error while loading transactions', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchRate = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentRate(data.usdtRate);
          setNewRateInput(data.usdtRate.toString());
          setCurrentMinDeposit(data.minDeposit);
          setNewMinDepositInput(data.minDeposit.toString());
          setCurrentMinWithdraw(data.minWithdraw);
          setNewMinWithdrawInput(data.minWithdraw.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    const rate = parseFloat(newRateInput);
    const minDep = parseFloat(newMinDepositInput);
    const minWd = parseFloat(newMinWithdrawInput);

    if (isNaN(rate) || rate <= 0) {
      showToast('Please enter a valid positive rate', 'error');
      return;
    }
    if (isNaN(minDep) || minDep <= 0) {
      showToast('Please enter a valid minimum deposit', 'error');
      return;
    }
    if (isNaN(minWd) || minWd <= 0) {
      showToast('Please enter a valid minimum withdrawal', 'error');
      return;
    }

    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usdtRate: rate, minDeposit: minDep, minWithdraw: minWd })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentRate(data.usdtRate);
        setCurrentMinDeposit(data.minDeposit);
        setCurrentMinWithdraw(data.minWithdraw);
        showToast('Settings saved successfully');
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Network error while saving settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchRate();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAction = async (transactionId: string, action: 'approve' | 'reject') => {
    const remarks = remarksInputs[transactionId] || '';
    
    // Set processing state
    setProcessingTx(prev => ({ ...prev, [transactionId]: action }));

    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId,
          action,
          remarks
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Transaction ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        // Clear remarks input for this transaction
        setRemarksInputs(prev => {
          const updated = { ...prev };
          delete updated[transactionId];
          return updated;
        });
        // Refetch to get updated list and user balances
        await fetchTransactions(true);
      } else {
        showToast(data.error || `Failed to ${action} transaction`, 'error');
      }
    } catch (err) {
      console.error(`Error during transaction ${action}:`, err);
      showToast(`Network error while trying to ${action} transaction`, 'error');
    } finally {
      setProcessingTx(prev => ({ ...prev, [transactionId]: null }));
    }
  };

  const handleRemarkChange = (txId: string, val: string) => {
    setRemarksInputs(prev => ({ ...prev, [txId]: val }));
  };

  // Calculations for Admin Stats Card
  const pendingDeposits = transactions.filter(t => t.type === 'Deposit' && t.status === 'Pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'Withdraw' && t.status === 'Pending');
  
  const pendingDepositsSum = pendingDeposits.reduce((acc, t) => acc + t.amount, 0);
  const pendingWithdrawalsSum = pendingWithdrawals.reduce((acc, t) => acc + t.amount, 0);

  const totalSuccessCount = transactions.filter(t => t.status === 'Success').length;
  const uniqueUsersCount = new Set(transactions.map(t => t.userPhone)).size;

  // Filtered transactions list
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.userPhone?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.userId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesType = typeFilter === 'All' || t.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] text-zinc-800 dark:text-[#fafafa] flex flex-col transition-colors duration-300 pb-20">
      
      {/* Admin Navbar */}
      <header className="bg-white dark:bg-[#121417] border-b border-black/[0.05] dark:border-white/5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-full text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <h1 className="text-lg font-bold font-display tracking-tight text-zinc-900 dark:text-white">
              Coinmitra Admin Panel
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <button
              onClick={() => fetchTransactions(true)}
              disabled={isRefreshing || isLoading}
              className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-zinc-500 dark:text-zinc-400 cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Transactions"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 flex flex-col space-y-6">
        
        {/* System Settings Card */}
        <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#007aff] to-[#a855f7]" />
          
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#007aff]/10 dark:bg-[#007aff]/15 text-[#007aff] flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white">
                System Settings
              </h3>
              <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">
                Live rate: <span className="text-[#007aff]">₹{currentRate.toFixed(2)}</span> &middot; Min Deposit: <span className="text-amber-500">{currentMinDeposit} USDT</span> &middot; Min Withdraw: <span className="text-rose-500">{currentMinWithdraw} USDT</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Exchange Rate Input */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">Exchange Rate (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 select-none">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-[#f7f7f7] dark:bg-[#0a0b0d] border border-black/[0.06] dark:border-white/5 rounded-xl text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#007aff] transition-colors"
                  placeholder="111.00"
                />
              </div>
            </div>

            {/* Min Deposit Input */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">Min Deposit (USDT)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={newMinDepositInput}
                onChange={(e) => setNewMinDepositInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f7f7f7] dark:bg-[#0a0b0d] border border-black/[0.06] dark:border-white/5 rounded-xl text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="10"
              />
            </div>

            {/* Min Withdraw Input */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">Min Withdraw (USDT)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={newMinWithdrawInput}
                onChange={(e) => setNewMinWithdrawInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f7f7f7] dark:bg-[#0a0b0d] border border-black/[0.06] dark:border-white/5 rounded-xl text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="10"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-5 py-2.5 rounded-xl bg-[#007aff] hover:bg-[#0063d1] active:scale-95 text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSavingSettings ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>Save All Settings</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Pending Deposits Stat */}
          <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Pending Deposits
            </span>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-xl font-bold font-display text-zinc-900 dark:text-white">
                {pendingDeposits.length}
              </span>
              <span className="text-xs font-semibold text-zinc-400">requests</span>
            </div>
            <p className="text-xs font-bold text-amber-500 mt-1">
              {pendingDepositsSum.toFixed(2)} USDT
            </p>
          </div>

          {/* Pending Withdrawals Stat */}
          <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Pending Withdrawals
            </span>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-xl font-bold font-display text-zinc-900 dark:text-white">
                {pendingWithdrawals.length}
              </span>
              <span className="text-xs font-semibold text-zinc-400">requests</span>
            </div>
            <p className="text-xs font-bold text-rose-500 mt-1">
              {pendingWithdrawalsSum.toFixed(2)} USDT
            </p>
          </div>

          {/* Total Success Transactions */}
          <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Success Transactions
            </span>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-xl font-bold font-display text-zinc-900 dark:text-white">
                {totalSuccessCount}
              </span>
              <span className="text-xs font-semibold text-zinc-400">completed</span>
            </div>
            <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Ready & Swapped
            </p>
          </div>

          {/* Unique Active Users */}
          <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Total Users Logged
            </span>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-xl font-bold font-display text-zinc-900 dark:text-white">
                {uniqueUsersCount}
              </span>
              <span className="text-xs font-semibold text-zinc-400">active</span>
            </div>
            <p className="text-xs font-bold text-blue-500 mt-1">
              Coinmitra Network
            </p>
          </div>

        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center shadow-xs">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by phone number, transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f7f7f7] dark:bg-[#0a0b0d] border border-black/[0.04] dark:border-white/5 rounded-xl text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#007aff] transition-colors"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Status Selector */}
            <div className="flex items-center space-x-1.5 bg-[#f7f7f7] dark:bg-[#0a0b0d] p-1 border border-black/[0.04] dark:border-white/5 rounded-xl text-xs font-bold">
              <span className="text-zinc-400 dark:text-zinc-500 pl-2 pr-1 select-none">Status:</span>
              {(['All', 'Pending', 'Success', 'Failed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${statusFilter === status ? 'bg-[#007aff] text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Type Selector */}
            <div className="flex items-center space-x-1.5 bg-[#f7f7f7] dark:bg-[#0a0b0d] p-1 border border-black/[0.04] dark:border-white/5 rounded-xl text-xs font-bold">
              <span className="text-zinc-400 dark:text-zinc-500 pl-2 pr-1 select-none">Type:</span>
              {(['All', 'Deposit', 'Withdraw', 'Swap'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${typeFilter === type ? 'bg-[#007aff] text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Transactions Table/List Container */}
        <div className="bg-white dark:bg-[#121417] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
          
          <div className="px-5 py-4 border-b border-black/[0.05] dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white">
              Transactions Log ({filteredTransactions.length})
            </h3>
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tight font-mono select-none">
              Sorted by date
            </span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin" />
                <span className="text-zinc-400 animate-pulse text-sm font-bold">Fetching logs...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Inbox className="w-12 h-12 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 select-none">
                  No matching transaction records found.
                </span>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.03]">
                {filteredTransactions.map(tx => {
                  const isPending = tx.status === 'Pending';
                  
                  const statusColors = 
                    tx.status === 'Success' 
                      ? { text: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-500/20' }
                      : tx.status === 'Pending'
                        ? { text: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-400/15 border-amber-500/20' }
                        : { text: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-400/15 border-rose-500/20' };

                  let IconComponent = ArrowDown;
                  let iconBgClass = 'bg-blue-500/10 dark:bg-[#007aff]/15 text-[#007aff]';
                  let amountDisplay = `${tx.amount} USDT`;

                  if (tx.type === 'Deposit') {
                    IconComponent = ArrowDown;
                    iconBgClass = 'bg-emerald-500/10 dark:bg-[#10b981]/15 text-emerald-500';
                    amountDisplay = `+${tx.amount.toFixed(2)} USDT`;
                  } else if (tx.type === 'Withdraw') {
                    IconComponent = ArrowUp;
                    iconBgClass = 'bg-rose-500/10 dark:bg-[#f43f5e]/15 text-rose-500';
                    amountDisplay = `-${tx.amount.toFixed(2)} USDT`;
                  } else if (tx.type === 'Swap') {
                    IconComponent = ArrowUpDown;
                    iconBgClass = 'bg-orange-500/10 dark:bg-[#f59e0b]/15 text-orange-500';
                    amountDisplay = `${tx.amount.toFixed(2)} USDT`;
                  }

                  const txTime = new Date(tx.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  const currentProcessing = processingTx[tx.id] || null;

                  return (
                    <div key={tx.id} className="p-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Transaction Core info */}
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-xl ${iconBgClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <IconComponent className="w-5 h-5 stroke-[2.5]" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="font-bold text-sm text-zinc-950 dark:text-white">
                                {tx.type} Request
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 border font-bold rounded-full uppercase tracking-wider ${statusColors.text} ${statusColors.bg}`}>
                                {tx.status}
                              </span>
                            </div>

                            <div className="flex flex-col text-xs text-zinc-500 space-y-0.5">
                              <p className="font-semibold text-zinc-400">
                                User Phone: <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">{tx.userPhone}</span>
                              </p>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                ID: <span className="font-mono">{tx.id}</span> &middot; {txTime}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-col items-end justify-center text-right space-y-1">
                          <span className="text-[16px] font-bold text-zinc-900 dark:text-white font-display">
                            {amountDisplay}
                          </span>
                          
                          {/* INR value for Swap or Deposit */}
                          {tx.inrAmount > 0 && (
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                              &asymp; ₹{tx.inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Pending Actions Block */}
                      {isPending && (
                        <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.03] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/10 p-3 rounded-xl">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={remarksInputs[tx.id] || ''}
                              onChange={(e) => handleRemarkChange(tx.id, e.target.value)}
                              placeholder="Add admin remarks/reference ID (optional)..."
                              disabled={currentProcessing !== null}
                              className="w-full px-3 py-1.5 bg-white dark:bg-[#0a0b0d] border border-black/5 dark:border-white/5 rounded-lg text-xs font-semibold placeholder-zinc-400 focus:outline-none focus:border-[#007aff]"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Reject Button */}
                            <button
                              onClick={() => handleAction(tx.id, 'reject')}
                              disabled={currentProcessing !== null}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {currentProcessing === 'reject' ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Reject</span>
                                </>
                              )}
                            </button>

                            {/* Approve Button */}
                            <button
                              onClick={() => handleAction(tx.id, 'approve')}
                              disabled={currentProcessing !== null}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {currentProcessing === 'approve' ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Approve</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Stored Remarks */}
                      {!isPending && tx.remarks && (
                        <div className="mt-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-800/5 px-2.5 py-1.5 rounded-lg inline-block">
                          Remarks: <span className="text-zinc-600 dark:text-zinc-400 font-semibold">{tx.remarks}</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-full shadow-lg text-white font-bold text-xs flex items-center space-x-2 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
