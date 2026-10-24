import { createClient } from '@/lib/supabase/server';
import AdminShopList from './AdminShopList';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from('shops')
    .select('*, profiles:owner_id(full_name, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Portal - Shop Approvals</h1>
        <p className="mt-1 text-sm text-gray-600">Review vendor applications and manage shop statuses.</p>
      </div>

      <AdminShopList initialShops={shops || []} />
    </div>
  );
}
