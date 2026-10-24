import { createClient } from '@/lib/supabase/server';
import VendorMenuEditor from './VendorMenuEditor';

export default async function VendorMenuPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name')
    .eq('owner_id', user?.id)
    .single();

  if (!shop) {
    return <div className="p-4 text-center">Shop not found.</div>;
  }

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <p className="text-sm text-gray-500">Manage categories, items, pricing, and availability for {shop.name}.</p>
      </div>

      <VendorMenuEditor
        shopId={shop.id}
        initialCategories={categories || []}
        initialItems={items || []}
      />
    </div>
  );
}
