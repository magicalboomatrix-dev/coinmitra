'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BanknoteArrowDown, BanknoteArrowUp, RefreshCw, ShieldCheck } from 'lucide-react';
import AdminShell from './AdminShell';

type AdminTransaction = {
  id: string;
  userPhone: string;
  type: 'Deposit' | 'Withdraw' | 'Swap';
  amount: number;
  status: 'Pending' | 'Success' | 'Failed';
  createdAt: string;
};

function statCount(transactions: AdminTransaction[], type: AdminTransaction['type'], status?: AdminTransaction['status']) {
  return transactions.filter((tx) => tx.type === type && (!status || tx.status === status));
}

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (res.ok && data.success) setTransactions(data.transactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, []);

  const cards = useMemo(() => {
    const pendingDeposits = statCount(transactions, 'Deposit', 'Pending');
    const pendingWithdrawals = statCount(transactions, 'Withdraw', 'Pending');
    const successful = transactions.filter((tx) => tx.status === 'Success');

    return [
      {
        label: 'Pending deposits',
        value: pendingDeposits.length,
        amount: `${pendingDeposits.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)} USDT`,
        href: '/admin/deposits',
        icon: BanknoteArrowDown,
        color: 'text-emerald-500',
      },
      {
        label: 'Pending withdrawals',
        value: pendingWithdrawals.length,
        amount: `${pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)} USDT`,
        href: '/admin/withdrawals',
        icon: BanknoteArrowUp,
        color: 'text-rose-500',
      },
      {
        label: 'Successful requests',
        value: successful.length,
        amount: `${successful.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)} USDT`,
        href: '/admin/deposits',
        icon: ShieldCheck,
        color: 'text-[#007aff]',
      },
    ];
  }, [transactions]);

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl bg-zinc-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-white/50">Operations</p>
            <h3 className="mt-1 text-2xl font-black">Review money movement from one place</h3>
          </div>
          <button type="button" onClick={loadDashboard} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-zinc-950">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} className="rounded-3xl border border-black/10 bg-white p-5 transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#121722]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-500">{card.label}</p>
                    <p className="mt-3 text-4xl font-black">{card.value}</p>
                    <p className={`mt-2 text-sm font-black ${card.color}`}>{card.amount}</p>
                  </div>
                  <div className="rounded-2xl bg-black/[0.04] p-3 dark:bg-white/[0.06]">
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-black text-zinc-500">
                  Open queue <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#121722]">
          <div className="border-b border-black/10 p-5 dark:border-white/10">
            <h3 className="text-lg font-black">Latest activity</h3>
          </div>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {transactions.slice(0, 8).map((tx) => (
              <div key={tx.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black">{tx.type} - {tx.userPhone}</p>
                  <p className="mt-1 font-mono text-xs text-zinc-500">{tx.id}</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="font-black">{tx.amount.toFixed(2)} USDT</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : tx.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
            {!loading && transactions.length === 0 && (
              <div className="p-8 text-center text-sm font-bold text-zinc-500">No transactions found.</div>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
