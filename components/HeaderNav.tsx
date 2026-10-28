'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface HeaderNavProps {
  user: { id: string; email?: string } | null;
  role: 'student' | 'vendor' | 'admin' | null;
}

export default function HeaderNav({ user, role }: HeaderNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const roleBadgeColor =
    role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-300'
      : role === 'vendor'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <nav className="flex items-center space-x-3 text-sm font-medium">
      <Link href="/search" className="hover:underline min-h-[44px] flex items-center px-1">
        Search
      </Link>

      {!user ? (
        <>
          <Link href="/login" className="hover:underline min-h-[44px] flex items-center px-1">
            Student Sign In
          </Link>
          <Link
            href="/vendor/signup"
            className="rounded bg-emerald-800 px-3 py-1.5 hover:bg-emerald-900 min-h-[44px] flex items-center text-xs sm:text-sm font-semibold"
          >
            Become a Vendor
          </Link>
        </>
      ) : (
        <>
          <div className="hidden sm:flex items-center space-x-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${roleBadgeColor}`}
            >
              {role || 'Student'}
            </span>
          </div>

          <Link href="/cart" className="hover:underline min-h-[44px] flex items-center px-1">
            Cart
          </Link>

          {role === 'student' && (
            <Link href="/orders" className="hover:underline min-h-[44px] flex items-center px-1">
              My Orders
            </Link>
          )}

          {role === 'admin' && (
            <Link href="/admin" className="hover:underline min-h-[44px] flex items-center px-1">
              Admin Portal
            </Link>
          )}

          {(role === 'vendor' || role === 'admin') && (
            <Link href="/vendor" className="hover:underline min-h-[44px] flex items-center px-1">
              Vendor Dashboard
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="rounded bg-emerald-800 px-3 py-1.5 hover:bg-emerald-900 min-h-[44px] flex items-center text-xs sm:text-sm font-semibold"
          >
            Sign Out
          </button>
        </>
      )}
    </nav>
  );
}
