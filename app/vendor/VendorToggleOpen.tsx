'use client';

import { useState } from 'react';

export default function VendorToggleOpen({
  initialIsOpen,
}: {
  shopId: string;
  initialIsOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpen = async () => {
    setLoading(true);
    const nextState = !isOpen;

    try {
      const res = await fetch('/api/vendor/shop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: nextState }),
      });

      if (!res.ok) throw new Error('Failed to update shop status');

      setIsOpen(nextState);
    } catch {
      alert('Error updating shop status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        Status: <strong className={isOpen ? 'text-green-600' : 'text-red-600'}>{isOpen ? 'OPEN' : 'CLOSED'}</strong>
      </span>
      <button
        onClick={toggleOpen}
        disabled={loading}
        className={`rounded px-4 py-1.5 text-xs font-semibold text-white ${
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
        } disabled:opacity-50`}
      >
        {loading ? 'Updating...' : isOpen ? 'Close Shop' : 'Open Shop'}
      </button>
    </div>
  );
}
