import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface Shop {
  id: string;
  name: string;
  slug: string;
  location_text: string;
}

interface MenuItem {
  id: string;
  name: string;
  price_kobo: number;
  shops?: {
    name: string;
    slug: string;
  } | null;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  const supabase = await createClient();

  let shops: Shop[] = [];
  let items: MenuItem[] = [];

  if (query) {
    const { data: shopResults } = await supabase
      .from('public_shops')
      .select('id, name, slug, location_text')
      .ilike('name', `%${query}%`);

    shops = (shopResults as Shop[]) || [];

    const { data: itemResults } = await supabase
      .from('menu_items')
      .select('id, name, price_kobo, shops:shop_id(name, slug)')
      .ilike('name', `%${query}%`);

    items = (itemResults as unknown as MenuItem[]) || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search CK Village</h1>
        <p className="text-sm text-gray-500">Find shops and menu items across campus.</p>
      </div>

      <form method="GET" action="/search" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search for 'Rice', 'Juice', 'Shop Name'..."
          className="flex-1 rounded border border-gray-300 p-2.5 text-sm"
        />
        <button type="submit" className="rounded bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          Search
        </button>
      </form>

      {query && (
        <div className="space-y-8">
          <div>
            <h2 className="text-base font-bold text-gray-800">Shops ({shops.length})</h2>
            {shops.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">No matching shops found.</p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shops.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/s/${shop.slug}`}
                    className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-emerald-500"
                  >
                    <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                    <p className="text-xs text-gray-500">{shop.location_text}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-800">Dishes & Menu Items ({items.length})</h2>
            {items.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">No matching menu items found.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500">
                        At{' '}
                        <Link href={`/s/${item.shops?.slug}`} className="text-emerald-700 underline">
                          {item.shops?.name}
                        </Link>
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      ₦{(item.price_kobo / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
