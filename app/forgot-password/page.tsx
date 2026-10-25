'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetErr) {
      setError('If that account exists, a reset link will be sent.');
    } else {
      setMessage('If an account exists for that email, password reset instructions have been sent.');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
      <p className="mt-1 text-sm text-gray-600">Enter your email to receive password reset instructions.</p>

      {message && <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <div className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

      <form onSubmit={handleReset} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            placeholder="e.g. name@gmail.com"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">We will send a password reset link if registered.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Sending link...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-600">
        Remembered your password?{' '}
        <Link href="/login" className="text-emerald-700 hover:underline">
          Back to Sign in
        </Link>
      </p>
    </div>
  );
}
