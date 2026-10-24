'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function VendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Vendor Login</h1>
      <p className="mt-1 text-sm text-gray-600">Log in to manage your CK Village shop menu.</p>

      {error && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-600">
        Don&apos;t have a shop yet?{' '}
        <Link href="/vendor/signup" className="text-emerald-700 hover:underline">
          Register shop
        </Link>
      </p>
    </div>
  );
}
