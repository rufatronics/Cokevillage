'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import GoogleOneTap from '@/components/GoogleOneTap';

export default function VendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/vendor');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <div className="text-center">
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
          Vendor Portal
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Login</h1>
        <p className="mt-1 text-xs text-gray-500">Log in to manage your CK Village shop menu and status.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            placeholder="e.g. vendor@gmail.com"
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm pr-16"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-700 py-3 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Logging in...' : 'Log In as Vendor'}
        </button>
      </form>

      <GoogleOneTap redirectTo="/vendor" />

      <div className="pt-2 border-t border-gray-100 text-center space-y-2 text-xs text-gray-600">
        <p>
          Don&apos;t have a shop registered?{' '}
          <Link href="/vendor/signup" className="text-amber-700 font-semibold hover:underline">
            Register shop
          </Link>
        </p>
        <p>
          Looking for student login?{' '}
          <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
            Student Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
