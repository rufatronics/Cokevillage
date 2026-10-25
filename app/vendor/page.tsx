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
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-900">No Shop Registered</h1>
        <p className="text-sm text-gray-600">You do not have a shop associated with this account yet.</p>
        <Link
          href="/vendor/signup"
          className="inline-block rounded bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 min-h-[44px] leading-loose"
        >
          Register a Shop
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

      {/* Status Banners */}
      {shop.status === 'pending' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 space-y-2">
          <p className="font-semibold">Your shop is waiting for approval.</p>
          <p className="text-xs">
            We will review your application soon. Below are the details you submitted:
          </p>
          <ul className="mt-2 text-xs space-y-1 list-disc list-inside">
            <li><strong>Name:</strong> {shop.name}</li>
            <li><strong>Location:</strong> {shop.location_text}</li>
            <li><strong>WhatsApp:</strong> {shop.whatsapp_number}</li>
            {shop.description && <li><strong>Description:</strong> {shop.description}</li>}
          </ul>
        </div>
      )}

      {shop.status === 'suspended' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Your shop is currently suspended.</p>
          <p className="text-xs mt-1">Please contact CK Village admin for assistance.</p>
        </div>
      )}

      {shop.status === 'approved' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Shop Controls</h2>
          <VendorToggleOpen shopId={shop.id} initialIsOpen={shop.is_open} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shop.status === 'approved' ? (
          <Link
            href="/vendor/menu"
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow"
          >
            <h3 className="font-semibold text-gray-900">Manage Menu</h3>
            <p className="mt-1 text-xs text-gray-500">
              Add categories, menu items, prices, and options.
            </p>
          </Link>
        ) : (
          <div className="block rounded-lg border border-gray-200 bg-gray-50 p-5 opacity-60">
            <h3 className="font-semibold text-gray-700">Manage Menu</h3>
            <p className="mt-1 text-xs text-gray-500">
              Menu management unlocks once your shop is approved by admin.
            </p>
          </div>
        )}

        <Link
          href={`/s/${shop.slug}`}
          className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow"
        >
          <h3 className="font-semibold text-gray-900">View Public Shop Page</h3>
          <p className="mt-1 text-xs text-gray-500">
            See how your shop appears to students.
          </p>
        </Link>
      </div>
    </div>
  );
}
