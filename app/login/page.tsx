'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import GoogleOneTap from '@/components/GoogleOneTap';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

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
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <div className="text-center">
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
          Student Portal
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Student Sign In</h1>
        <p className="mt-1 text-xs text-gray-500">Sign in to order food, track orders, or pay online.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            placeholder="e.g. student@gmail.com"
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

        <div className="flex items-center justify-between text-xs">
          <Link href="/forgot-password" className="text-emerald-700 font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Signing in...' : 'Sign In as Student'}
        </button>
      </form>

      <GoogleOneTap redirectTo={redirectTo} />

      <div className="pt-2 border-t border-gray-100 text-center space-y-2 text-xs text-gray-600">
        <p>
          Need a student account?{' '}
          <Link href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-emerald-700 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
        <p>
          Are you a vendor?{' '}
          <Link href="/vendor/login" className="text-amber-700 font-semibold hover:underline">
            Vendor Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
