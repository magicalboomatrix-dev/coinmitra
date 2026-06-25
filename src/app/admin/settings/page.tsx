'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import AdminShell from '../AdminShell';

export default function AdminSettingsPage() {
  const [usdtRate, setUsdtRate] = useState('111');
  const [minDeposit, setMinDeposit] = useState('10');
  const [minWithdraw, setMinWithdraw] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSettings = async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load settings');
      setUsdtRate(String(data.usdtRate));
      setMinDeposit(String(data.minDeposit));
      setMinWithdraw(String(data.minWithdraw));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdtRate: Number(usdtRate),
          minDeposit: Number(minDeposit),
          minWithdraw: Number(minWithdraw),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save settings');
      setUsdtRate(String(data.usdtRate));
      setMinDeposit(String(data.minDeposit));
      setMinWithdraw(String(data.minWithdraw));
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Settings">
      <div className="space-y-5">
        {message && (
          <div className={`rounded-2xl p-4 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#121722] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-black/10 pb-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#007aff]">Live controls</p>
              <h3 className="mt-1 text-2xl font-black">Platform settings</h3>
            </div>
            <button type="button" onClick={loadSettings} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-black/5 px-4 text-sm font-black dark:bg-white/10">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-black uppercase text-zinc-500">USDT to INR rate</label>
              <div className="mt-2 flex items-center rounded-2xl border border-black/10 bg-[#f6f7fb] px-3 dark:border-white/10 dark:bg-[#090b10]">
                <span className="text-sm font-black text-zinc-400">INR</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={usdtRate}
                  onChange={(event) => setUsdtRate(event.target.value)}
                  className="h-12 w-full bg-transparent px-3 text-sm font-black outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-500">Minimum deposit</label>
              <div className="mt-2 flex items-center rounded-2xl border border-black/10 bg-[#f6f7fb] px-3 dark:border-white/10 dark:bg-[#090b10]">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={minDeposit}
                  onChange={(event) => setMinDeposit(event.target.value)}
                  className="h-12 w-full bg-transparent text-sm font-black outline-none"
                  required
                />
                <span className="text-sm font-black text-zinc-400">USDT</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-zinc-500">Minimum withdrawal</label>
              <div className="mt-2 flex items-center rounded-2xl border border-black/10 bg-[#f6f7fb] px-3 dark:border-white/10 dark:bg-[#090b10]">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={minWithdraw}
                  onChange={(event) => setMinWithdraw(event.target.value)}
                  className="h-12 w-full bg-transparent text-sm font-black outline-none"
                  required
                />
                <span className="text-sm font-black text-zinc-400">USDT</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#007aff] text-sm font-black text-white disabled:opacity-60 sm:w-auto sm:px-6">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save settings
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#121722]">
          <p className="text-sm font-bold text-zinc-500">
            These values are used by the public app and backend APIs. Swap execution uses the database rate, while deposit and withdrawal APIs enforce the saved minimums.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
