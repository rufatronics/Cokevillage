'use client';

import { useState } from 'react';
import { getPublicImageUrl } from '@/lib/storage';

interface Shop {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price_kobo: number;
  is_available: boolean;
  image_path?: string | null;
}

export default function ShopMenuViewer({
  shop,
  items,
}: {
  shop: Shop;
  categories: unknown[];
  items: MenuItem[];
}) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, reason }),
      });

      if (!res.ok) throw new Error('Failed to submit report');

      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReason('');
      }, 2000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Report submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold text-gray-900">Menu</h2>
        <button
          onClick={() => setReportModalOpen(true)}
          className="text-xs text-red-600 hover:underline"
        >
          Report Shop
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">This shop has no menu items listed yet.</p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                <p className="text-sm font-bold text-emerald-700">₦{(item.price_kobo / 100).toLocaleString()}</p>
                {!item.is_available && (
                  <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                    Sold Out
                  </span>
                )}
              </div>

              {item.image_path && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={getPublicImageUrl(item.image_path) || ''}
                  alt={item.name}
                  className="h-16 w-16 rounded object-cover ml-4"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900">Report {shop.name}</h3>

            {reportSuccess ? (
              <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-700">
                Thank you. Report submitted to admin.
              </div>
            ) : (
              <form onSubmit={handleReport} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Reason for Report</label>
                  <textarea
                    required
                    minLength={5}
                    rows={3}
                    placeholder="Describe the issue (e.g., incorrect pricing, inappropriate content)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
