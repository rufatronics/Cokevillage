import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CK Village Ordering - BUK Campus Food & Vendor Ordering',
  description: 'Browse vendors in CK Village (BUK Kano) and order/pay online or via WhatsApp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="sticky top-0 z-50 bg-emerald-700 text-white shadow">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight">
              CK Village Ordering
            </Link>
            <nav className="flex items-center space-x-4 text-sm font-medium">
              <Link href="/search" className="hover:underline">
                Search
              </Link>
              <Link href="/cart" className="hover:underline">
                Cart
              </Link>
              <Link href="/vendor" className="rounded bg-emerald-800 px-3 py-1 hover:bg-emerald-900">
                Vendor Portal
              </Link>
            </nav>
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
