'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to login');
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-zinc-900 dark:bg-[#090b10] dark:text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <form onSubmit={handleSubmit} className="w-full rounded-3xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#121722] sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007aff] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#007aff]">Admin Login</p>
              <h1 className="text-2xl font-black">Coinmitra Control</h1>
            </div>
          </div>

          {error && <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{error}</div>}

          <label className="text-xs font-black uppercase text-zinc-500">Email</label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-[#f6f7fb] px-3 dark:border-white/10 dark:bg-[#090b10]">
            <Mail className="h-4 w-4 text-zinc-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full bg-transparent text-sm font-bold outline-none"
              placeholder="admin@coinmitra.com"
              autoComplete="email"
              required
            />
          </div>

          <label className="mt-5 block text-xs font-black uppercase text-zinc-500">Password</label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-[#f6f7fb] px-3 dark:border-white/10 dark:bg-[#090b10]">
            <LockKeyhole className="h-4 w-4 text-zinc-400" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full bg-transparent text-sm font-bold outline-none"
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="mt-7 h-12 w-full rounded-2xl bg-[#007aff] text-sm font-black text-white disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-xs font-semibold text-zinc-500">
            Create credentials with <span className="font-mono">npm run create-admin</span>
          </p>
        </form>
      </div>
    </main>
  );
}
