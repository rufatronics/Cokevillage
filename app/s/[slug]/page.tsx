import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp';
import ShopMenuViewer from './ShopMenuViewer';

export const revalidate = 60;

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch shop from public_shops view
  const { data: shop } = await supabase
    .from('public_shops')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!shop) {
    notFound();
  }

  // Fetch categories and items
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('shop_id', shop.id)
    .order('sort_order', { ascending: true });

  const { data: items } = await supabase
    .from('menu_items')
    .select('*, option_groups(*, options(*))')
    .eq('shop_id', shop.id)
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
            <p className="text-sm text-gray-500">{shop.location_text}</p>
          </div>
          <span
            className={`rounded px-3 py-1 text-xs font-semibold ${
              shop.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {shop.is_open ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        {shop.description && <p className="mt-3 text-sm text-gray-700">{shop.description}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={formatWhatsAppUrl(shop.whatsapp_number, `Hello! I want to make an order at ${shop.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Chat to order (WhatsApp)
          </a>
        </div>
      </div>

      <ShopMenuViewer
        shop={shop}
        categories={categories || []}
        items={items || []}
      />
    </div>
  );
}
