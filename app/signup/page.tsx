'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import GoogleOneTap from '@/components/GoogleOneTap';

export default function StudentSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Student Sign Up</h1>
      <p className="mt-1 text-sm text-gray-600">Create an account to order food in CK Village.</p>

      {error && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSignup} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Ibrahim Abubakar"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">Your full name for order pickup verification.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            placeholder="e.g. student@buk.edu.ng"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">Your email address.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full rounded border border-gray-300 p-2.5 text-sm pr-16"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <GoogleOneTap redirectTo={redirectTo} />

      <p className="mt-4 text-center text-xs text-gray-600">
        Already have an account?{' '}
        <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-emerald-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
