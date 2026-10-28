import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp';

export const revalidate = 60; // Cache for 60 seconds

interface ShopDisplay {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  location_text: string;
  whatsapp_number: string;
  is_open: boolean;
  tags?: string[];
}

const SAMPLE_VENDORS: ShopDisplay[] = [
  {
    id: 'sample-1',
    name: 'Mama Put Kitchen',
    slug: 'mama-put-kitchen',
    description: 'Freshly cooked Nigerian dishes: Jollof rice, fried rice, pounded yam, egusi, and fried chicken.',
    location_text: 'CK Village, Block A, Shop 4',
    whatsapp_number: '2348012345678',
    is_open: true,
    tags: ['Jollof Rice', 'Swallow', 'Grills'],
  },
  {
    id: 'sample-2',
    name: 'BUK Chill & Juice Bar',
    slug: 'buk-chill-juice-bar',
    description: 'Freshly squeezed fruit juices, smoothies, zobo, ice cream, and cold soft drinks.',
    location_text: 'CK Village, Kiosk 12 (Near Main Gate)',
    whatsapp_number: '2348087654321',
    is_open: true,
    tags: ['Juices', 'Zobo', 'Pastries'],
  },
  {
    id: 'sample-3',
    name: 'Kano Suya & Shawarma Express',
    slug: 'kano-suya-shawarma',
    description: 'Spicy beef suya, chicken shawarma, grilled fish, and chips made fresh on order.',
    location_text: 'CK Village, Shop 8',
    whatsapp_number: '2348099887766',
    is_open: false,
    tags: ['Suya', 'Shawarma', 'Grills'],
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: dbShops } = await supabase
    .from('public_shops')
    .select('*')
    .order('name', { ascending: true });

  const activeShops: ShopDisplay[] = dbShops && dbShops.length > 0 ? dbShops : SAMPLE_VENDORS;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-600 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-block rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-semibold text-emerald-200">
            Official BUK Campus Vendor Area
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            CK Village Food & Vendor Ordering
          </h1>
          <p className="text-sm sm:text-base text-emerald-100">
            Browse campus shops, chat on WhatsApp to order, or add items to your cart and pay online!
          </p>

          {/* Search Box */}
          <form action="/search" method="GET" className="mt-4 flex max-w-md gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search 'Jollof', 'Shawarma', 'Zobo'..."
              className="flex-1 rounded-lg border-0 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-300"
            />
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-amber-400 min-h-[44px]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Quick Category Filter Pills */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Popular Categories</h3>
        <div className="flex flex-wrap gap-2">
          {['All Vendors', 'Rice & Swallow', 'Cold Drinks & Juices', 'Shawarma & Pastries', 'Suya & Grills'].map((cat, idx) => (
            <Link
              key={idx}
              href={cat === 'All Vendors' ? '/' : `/search?q=${encodeURIComponent(cat.split(' ')[0])}`}
              className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:border-emerald-500 hover:text-emerald-700 min-h-[36px] flex items-center"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Vendor Cards Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Featured CK Village Shops</h2>
          <span className="text-xs text-gray-500">{activeShops.length} vendor(s) available</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeShops.map((shop) => (
            <div
              key={shop.id}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/s/${shop.slug}`} className="text-lg font-bold text-gray-900 hover:text-emerald-700">
                      {shop.name}
                    </Link>
                    <p className="text-xs text-gray-500">{shop.location_text}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      shop.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {shop.is_open ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{shop.description}</p>

                {shop.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {shop.tags.map((tag, i) => (
                      <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center space-x-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/s/${shop.slug}`}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center justify-center"
                >
                  View Menu
                </Link>

                <a
                  href={formatWhatsAppUrl(
                    shop.whatsapp_number,
                    `Hello! I would like to make an order at ${shop.name}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg bg-green-600 py-2 text-center text-xs font-semibold text-white hover:bg-green-700 min-h-[44px] flex items-center justify-center"
                >
                  Chat to order
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 text-center">How Ordering Works in CK Village</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
          <div className="p-3 space-y-1">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-base">
              1
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Find a Shop</h3>
            <p className="text-xs text-gray-500">Browse menus, dishes, prices, and opening status across campus.</p>
          </div>

          <div className="p-3 space-y-1">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-base">
              2
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Choose Order Method</h3>
            <p className="text-xs text-gray-500">Tap &quot;Chat to order&quot; via WhatsApp or add items to your cart to pay online.</p>
          </div>

          <div className="p-3 space-y-1">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-base">
              3
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Fast Pickup</h3>
            <p className="text-xs text-gray-500">Receive instant order updates and pick up your meal at CK Village.</p>
          </div>
        </div>
      </section>

      {/* Vendor Call-to-Action */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-amber-900">Are you a shop vendor in CK Village?</h3>
          <p className="text-xs text-amber-800 mt-0.5">
            List your menu items, accept online or WhatsApp orders, and reach thousands of BUK students.
          </p>
        </div>
        <Link
          href="/vendor/signup"
          className="rounded-lg bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700 min-h-[44px] flex items-center whitespace-nowrap"
        >
          Register Your Shop
        </Link>
      </section>
    </div>
  );
}
