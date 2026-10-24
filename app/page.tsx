import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp';

export const revalidate = 60; // Cache for 60 seconds

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch approved public shops via public_shops view
  const { data: shops } = await supabase
    .from('public_shops')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-emerald-50 p-6 text-center border border-emerald-100">
        <h1 className="text-2xl font-bold text-emerald-900 sm:text-3xl">
          Order Food & Drinks in CK Village, BUK
        </h1>
        <p className="mt-2 text-sm text-emerald-800">
          Browse vendors, chat on WhatsApp to order, or pay online for fast pickup.
        </p>
        <div className="mt-4">
          <Link
            href="/search"
            className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Search Vendors & Dishes
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">CK Village Vendors</h2>

        {!shops || shops.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            No active vendors currently listed. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Link href={`/s/${shop.slug}`} className="text-lg font-bold text-gray-900 hover:underline">
                      {shop.name}
                    </Link>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        shop.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {shop.is_open ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{shop.location_text}</p>
                  {shop.description && <p className="mt-2 text-sm text-gray-700 line-clamp-2">{shop.description}</p>}
                </div>

                <div className="mt-4 flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/s/${shop.slug}`}
                    className="flex-1 rounded border border-gray-300 py-1.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    View Menu
                  </Link>

                  <a
                    href={formatWhatsAppUrl(shop.whatsapp_number, `Hello! I would like to order from ${shop.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded bg-green-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Chat to order
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
