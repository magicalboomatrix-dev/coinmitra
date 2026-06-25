'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Eye, RefreshCw, Search, X } from 'lucide-react';

type TransactionStatus = 'Pending' | 'Success' | 'Failed';
type TransactionType = 'Deposit' | 'Withdraw';

type AdminTransaction = {
  id: string;
  userId: string;
  userPhone: string;
  type: TransactionType | 'Swap';
  amount: number;
  inrAmount: number;
  rate: number;
  status: TransactionStatus;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    phone: string;
    balance: number;
    isVerified: boolean;
    createdAt?: string;
  } | null;
};

const statusOptions: Array<'All' | TransactionStatus> = ['All', 'Pending', 'Success', 'Failed'];

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function TransactionManager({ type }: { type: TransactionType }) {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [status, setStatus] = useState<'All' | TransactionStatus>('Pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [selected, setSelected] = useState<AdminTransaction | null>(null);
  const [remarks, setRemarks] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const title = type === 'Deposit' ? 'Deposit' : 'Withdrawal';

  const loadTransactions = async () => {
    await Promise.resolve();
    setLoading(true);
    const params = new URLSearchParams({ type });
    if (status !== 'All') params.set('status', status);
    if (search.trim()) params.set('search', search.trim());

    try {
      const res = await fetch(`/api/admin/transactions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load transactions');
      setTransactions(data.transactions);
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load transactions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const pendingCount = useMemo(
    () => transactions.filter((tx) => tx.status === 'Pending').length,
    [transactions]
  );

  const handleAction = async (tx: AdminTransaction, action: 'approve' | 'reject') => {
    setProcessingId(tx.id);

    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: tx.id, action, remarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to update transaction');

      setToast({ type: 'success', message: data.message });
      setSelected(null);
      setRemarks('');
      await loadTransactions();
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to update transaction' });
    } finally {
      setProcessingId('');
    }
  };

  const openDetails = async (tx: AdminTransaction) => {
    setSelected(tx);
    setRemarks(tx.remarks || '');

    try {
      const res = await fetch(`/api/admin/transactions?id=${tx.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSelected(data.transaction);
        setRemarks(data.transaction.remarks || '');
      }
    } catch {
      setSelected(tx);
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full px-4 py-3 text-xs font-bold text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {toast.message}
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#121722]">
          <p className="text-xs font-bold uppercase text-zinc-500">Showing</p>
          <p className="mt-1 text-2xl font-black">{transactions.length}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#121722]">
          <p className="text-xs font-bold uppercase text-zinc-500">Pending</p>
          <p className="mt-1 text-2xl font-black text-amber-500">{pendingCount}</p>
        </div>
        <button
          type="button"
          onClick={loadTransactions}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#007aff] p-4 text-sm font-black text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh {title}s
        </button>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-[#121722] sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && loadTransactions()}
              placeholder="Search phone, transaction ID, user ID"
              className="h-11 w-full rounded-xl border border-black/10 bg-[#f6f7fb] pl-10 pr-3 text-sm font-semibold outline-none focus:border-[#007aff] dark:border-white/10 dark:bg-[#090b10]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-xl px-3 py-2 text-xs font-black ${status === item ? 'bg-[#007aff] text-white' : 'bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'}`}
              >
                {item}
              </button>
            ))}
            <button type="button" onClick={loadTransactions} className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-zinc-950">
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#121722]">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm font-bold text-zinc-500">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading {title.toLowerCase()}s...
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm font-bold text-zinc-500">
            No {title.toLowerCase()} requests found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/[0.03] text-xs uppercase text-zinc-500 dark:bg-white/[0.04]">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-4 py-4">
                        <p className="font-black">{tx.userPhone}</p>
                        <p className="mt-1 font-mono text-xs text-zinc-500">{tx.id}</p>
                      </td>
                      <td className="px-4 py-4 font-black">{tx.amount.toFixed(2)} USDT</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-black ${tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : tx.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-500">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-4 text-right">
                        <button type="button" onClick={() => openDetails(tx)} className="inline-flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-xs font-black dark:bg-white/10">
                          <Eye className="h-4 w-4" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-black/10 dark:divide-white/10 lg:hidden">
              {transactions.map((tx) => (
                <button key={tx.id} type="button" onClick={() => openDetails(tx)} className="w-full p-4 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{tx.userPhone}</p>
                      <p className="mt-1 text-xs font-semibold text-zinc-500">{formatDate(tx.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : tx.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-black">{tx.amount.toFixed(2)} USDT</p>
                  <p className="mt-1 truncate font-mono text-xs text-zinc-400">{tx.id}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-[#121722] sm:mx-auto sm:max-w-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[#007aff]">{selected.type} Detail</p>
                <h3 className="mt-1 text-2xl font-black">{selected.amount.toFixed(2)} USDT</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-full bg-black/5 p-2 dark:bg-white/10" aria-label="Close details">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Status', selected.status],
                ['User phone', selected.userPhone],
                ['Transaction ID', selected.id],
                ['User ID', selected.userId],
                ['Created', formatDate(selected.createdAt)],
                ['Updated', formatDate(selected.updatedAt)],
                ['User balance', `${selected.user?.balance?.toFixed(2) ?? '0.00'} USDT`],
                ['Verified user', selected.user?.isVerified ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/[0.03] p-3 dark:bg-white/[0.05]">
                  <p className="text-[10px] font-black uppercase text-zinc-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-bold">{value}</p>
                </div>
              ))}
            </div>

            <label className="mt-5 block text-xs font-black uppercase text-zinc-500">Admin remarks / reference</label>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              disabled={selected.status !== 'Pending'}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f6f7fb] p-3 text-sm font-semibold outline-none focus:border-[#007aff] disabled:opacity-70 dark:border-white/10 dark:bg-[#090b10]"
              placeholder="Add UTR, wallet note, rejection reason, or internal reference"
            />

            {selected.status === 'Pending' ? (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={processingId === selected.id}
                  onClick={() => handleAction(selected, 'reject')}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-500 text-sm font-black text-white disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={processingId === selected.id}
                  onClick={() => handleAction(selected, 'approve')}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-sm font-black text-white disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-black/[0.03] p-3 text-sm font-bold text-zinc-500 dark:bg-white/[0.05]">
                This request has already been processed.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
