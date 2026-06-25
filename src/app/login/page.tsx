'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill phone number if redirected back with query params
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      // Remove any country code and keep last 10 digits
      const cleaned = phoneParam.replace(/\D/g, '');
      const last10 = cleaned.slice(-10);
      setPhone(last10);
    }
  }, [searchParams]);

  // Handle toast auto-dismissal
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;

    // Simulate validation/API dispatch failure
    if (phone === '9999999999' || phone.startsWith('0')) {
      setErrorMsg('Failed to send OTP: Invalid phone number');
      return;
    }

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: '+91' + phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to send OTP');
        return;
      }

      // Redirect to verify page
      router.push(`/login/verify?phone=${encodeURIComponent('+91 ' + phone)}`);
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    }
  };

  return (
    <div className="page-shell auth-page-shell">
      {/* Visual Toast Notification for Errors */}
      {errorMsg && (
        <div className="auth-toast auth-toast--error">
          <div className="auth-toast-icon">!</div>
          <div className="auth-toast-text">{errorMsg}</div>
        </div>
      )}

      <div className="page-inner auth-page-inner shadow-rig">
        <div className="rig-grid" aria-hidden="true"></div>
        <div className="bg-gradient-glow" aria-hidden="true"></div>
        <div className="page-content">
          <main className="auth-main">
            {/* Top Back Row */}
            <Link href="/" className="auth-top-back" aria-label="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
            </Link>

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
              <label className="auth-label" htmlFor="phone">Phone number</label>
              <div className="auth-input-shell glass">
                {/* Country Selector block */}
                <div className="auth-country-wrap">
                  <select className="auth-country-select font-mono" aria-label="Country code" defaultValue="91">
                    <option value="91">+91 India</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down auth-country-chevron" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </div>

                <div className="auth-input-divider"></div>

                {/* Input Text block */}
                <div className="auth-input-field-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone auth-input-icon" aria-hidden="true">
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                  </svg>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98xxxxxx12"
                    className="auth-input font-mono"
                    value={phone}
                    onChange={(e) => {
                      // Filter non-digits and cap at 10 chars
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) {
                        setPhone(val);
                      }
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Next CTA button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={phone.length < 10}
              >
                Next
              </button>

              {/* Legal Info */}
              <p className="auth-legal text-cm-2xs text-muted">
                By continuing you agree to Coinmitra <a href="#">Terms</a> &amp; <a href="#">Privacy</a>.
              </p>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#0a0b0d] flex items-center justify-center">
        <span className="text-zinc-400 animate-pulse text-sm">Loading...</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
