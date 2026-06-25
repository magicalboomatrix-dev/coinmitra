'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '+91 9876543210';

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Show success toast on component mount
  useEffect(() => {
    setToast({
      message: 'OTP sent successfully.',
      type: 'success'
    });
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({
          message: data.error || 'Failed to send OTP.',
          type: 'error'
        });
        return;
      }

      setTimer(60);
      setToast({
        message: 'OTP sent successfully.',
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: 'An error occurred. Please try again.',
        type: 'error'
      });
    }
  };

  const handleBackToLogin = () => {
    // Navigate back to login page, passing current phone in query param for pre-filling
    router.push(`/login?phone=${encodeURIComponent(phone)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({
          message: data.error || 'Invalid OTP. Please try again.',
          type: 'error'
        });
        return;
      }

      // Directs to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setToast({
        message: 'An error occurred. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="page-shell auth-page-shell">
      {/* Toast Notification block */}
      {toast && (
        <div className={`auth-toast auth-toast--${toast.type}`}>
          <div className="auth-toast-icon">
            {toast.type === 'success' ? '✓' : '!'}
          </div>
          <div className="auth-toast-text">{toast.message}</div>
        </div>
      )}

      <div className="page-inner auth-page-inner shadow-rig">
        <div className="rig-grid" aria-hidden="true"></div>
        <div className="bg-gradient-glow" aria-hidden="true"></div>
        <div className="page-content">
          <main className="auth-main">
            {/* Top Back Row */}
            <button
              onClick={handleBackToLogin}
              className="auth-top-back"
              aria-label="Go back"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
            </button>

            {/* Brand Branding Area */}
            <div className="auth-brand">
              <div className="auth-brand-logo-wrap shadow-rig">
                <div className="auth-brand-glow" aria-hidden="true"></div>
                <img
                  alt="Coinmitra logo"
                  width="72"
                  height="72"
                  className="auth-brand-logo"
                  src="/assets/coinmitra-icon.png"
                />
              </div>
              <p className="auth-brand-title font-display">Coinmitra</p>
              <p className="auth-brand-tagline text-cm-sm text-muted">Tap your phone · drill the chain</p>
            </div>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Back to phone option */}
              <button
                type="button"
                className="auth-phone-back"
                onClick={handleBackToLogin}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                <span>{phone}</span>
              </button>

              <label className="auth-label" htmlFor="otp">Verification code</label>
              
              <div className="auth-input-shell glass">
                <div className="auth-input-field-wrap auth-input-field-wrap--otp">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key auth-input-icon" aria-hidden="true">
                    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                  <input
                    id="otp"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="••••••"
                    className="auth-input auth-input--otp font-mono"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      // Allow only digits and cap at 6 digits
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) {
                        setOtp(val);
                      }
                    }}
                    autoFocus
                  />
                </div>

                {/* Countdown Badge / Resend Button */}
                <button
                  type="button"
                  className="auth-timer-btn font-mono"
                  disabled={timer > 0}
                  onClick={handleResend}
                >
                  {timer > 0 ? `${timer}s` : 'Resend'}
                </button>
              </div>

              {/* Verify CTA button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={otp.length < 6}
              >
                Verify
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] flex items-center justify-center">
        <span className="text-zinc-400 animate-pulse text-sm">Loading...</span>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
