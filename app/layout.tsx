import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import HeaderNav from '@/components/HeaderNav';

export const metadata: Metadata = {
  title: 'CK Village Ordering - BUK Campus Food & Vendor Ordering',
  description: 'Browse vendors in CK Village (BUK Kano) and order/pay online or via WhatsApp.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: 'student' | 'vendor' | 'admin' | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      role = profile.role as 'student' | 'vendor' | 'admin';
    }
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="sticky top-0 z-50 bg-emerald-700 text-white shadow">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight min-h-[44px] flex items-center">
              CK Village Ordering
            </Link>
            <HeaderNav user={user ? { id: user.id, email: user.email } : null} role={role} />
          </div>
        </header>
        <main className="mx-auto max-w-4xl p-4">{children}</main>
        <footer className="mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CK Village Ordering. Built for Bayero University Kano (BUK) students.</p>
        </footer>
      </body>
    </html>
  );
}
