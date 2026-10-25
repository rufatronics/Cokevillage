import AdminShopList from './AdminShopList';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Portal - Shop Approvals</h1>
        <p className="mt-1 text-sm text-gray-600">Review vendor applications and manage shop statuses across CK Village.</p>
      </div>

      <AdminShopList />
    </div>
  );
}
