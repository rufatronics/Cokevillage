import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function StudentOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Sign In Required</h1>
        <p className="text-xs text-gray-600">Please sign in to view your order history.</p>
        <Link
          href="/login?redirectTo=/orders"
          className="inline-block rounded bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 min-h-[44px] leading-loose"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Fetch student orders from orders table
  const { data: orders } = await supabase
    .from('orders')
    .select('*, shops(name, slug)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-xs text-gray-500">Track and view your past orders in CK Village.</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm space-y-3">
          <div className="text-3xl">📦</div>
          <h2 className="text-base font-semibold text-gray-800">No Orders Yet</h2>
          <p className="text-xs text-gray-500">
            You have not placed any online orders yet. Online payments and orders will be enabled in Phase 4!
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block rounded bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 min-h-[44px] leading-loose"
            >
              Browse Vendors
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">{order.shops?.name}</span>
                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Ordered on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
