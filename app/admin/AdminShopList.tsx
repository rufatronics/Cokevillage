'use client';

import { useEffect, useState } from 'react';

interface Shop {
  id: string;
  name: string;
  slug: string;
  location_text: string;
  whatsapp_number: string;
  status: 'pending' | 'approved' | 'suspended';
  is_open: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    role: string;
  };
}

export default function AdminShopList() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/shops');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch shops');
      }

      setShops(data.shops || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleAction = async (shopId: string, action: 'approve' | 'reject' | 'suspend') => {
    setActionLoadingId(shopId);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      setMessage(data.message);

      setShops((prev) =>
        prev.map((s) => {
          if (s.id === shopId) {
            const nextStatus = action === 'approve' ? 'approved' : action === 'suspend' ? 'suspended' : 'pending';
            return { ...s, status: nextStatus };
          }
          return s;
        })
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading shops...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Shop</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Location / WhatsApp</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shops.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-sm text-gray-500">
                  No shops registered yet.
                </td>
              </tr>
            ) : (
              shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div>{shop.name}</div>
                    <div className="text-xs text-gray-500">/s/{shop.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{shop.profiles?.full_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{shop.profiles?.email} ({shop.profiles?.role})</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{shop.location_text}</div>
                    <div className="text-xs text-gray-500">{shop.whatsapp_number}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        shop.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : shop.status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {shop.status !== 'approved' && (
                      <button
                        onClick={() => handleAction(shop.id, 'approve')}
                        disabled={actionLoadingId === shop.id}
                        className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {shop.status === 'approved' && (
                      <button
                        onClick={() => handleAction(shop.id, 'suspend')}
                        disabled={actionLoadingId === shop.id}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
