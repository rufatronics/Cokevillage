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

  return (
    <nav className="flex items-center space-x-3 text-sm font-medium">
      <Link href="/search" className="hover:underline min-h-[44px] flex items-center px-1">
        Search
      </Link>

      {!user ? (
        <>
          <Link href="/login" className="hover:underline min-h-[44px] flex items-center px-1">
            Sign In
          </Link>
          <Link
            href="/vendor/signup"
            className="rounded bg-emerald-800 px-3 py-1.5 hover:bg-emerald-900 min-h-[44px] flex items-center"
          >
            Become a Vendor
          </Link>
        </>
      ) : (
        <>
          {role === 'admin' && (
            <Link href="/admin" className="hover:underline min-h-[44px] flex items-center px-1">
              Admin
            </Link>
          )}

          {(role === 'vendor' || role === 'admin') && (
            <Link href="/vendor" className="hover:underline min-h-[44px] flex items-center px-1">
              My Shop
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="rounded bg-emerald-800 px-3 py-1.5 hover:bg-emerald-900 min-h-[44px] flex items-center"
          >
            Sign Out
          </button>
        </>
      )}
    </nav>
  );
}
