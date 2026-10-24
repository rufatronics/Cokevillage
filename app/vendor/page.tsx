import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import VendorToggleOpen from './VendorToggleOpen';

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user?.id)
    .single();

  if (!shop) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">No shop found for your account.</p>
        <Link href="/vendor/signup" className="mt-2 inline-block text-emerald-700 underline">
          Register Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
          <p className="text-sm text-gray-500">{shop.location_text}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            shop.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : shop.status === 'suspended'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {shop.status.toUpperCase()}
        </span>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Shop Controls</h2>
        <VendorToggleOpen shopId={shop.id} initialIsOpen={shop.is_open} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/vendor/menu"
          className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow"
        >
          <h3 className="font-semibold text-gray-900">Manage Menu</h3>
          <p className="mt-1 text-xs text-gray-500">
            Add categories, menu items, prices, and options.
          </p>
        </Link>

        <Link
          href="/s/[slug]"
          as={`/s/${shop.slug}`}
          className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow"
        >
          <h3 className="font-semibold text-gray-900">View Live Shop Page</h3>
          <p className="mt-1 text-xs text-gray-500">
            See how your shop appears to students.
          </p>
        </Link>
      </div>
    </div>
  );
}
