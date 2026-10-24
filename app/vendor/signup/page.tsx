'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    shopName: '',
    slug: '',
    description: '',
    locationText: '',
    whatsappNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShopNameChange = (name: string) => {
    const slugified = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, shopName: name, slug: slugified }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/vendor/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(data.message || 'Signup submitted! Waiting for admin approval.');
      setTimeout(() => {
        router.push('/vendor/login');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Vendor Registration</h1>
      <p className="mt-1 text-sm text-gray-600">Register your CK Village shop to start listing items.</p>

      {error && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Shop Name</label>
          <input
            type="text"
            required
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={formData.shopName}
            onChange={(e) => handleShopNameChange(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Shop URL Slug</label>
          <input
            type="text"
            required
            className="mt-1 w-full rounded border border-gray-300 bg-gray-50 p-2 text-sm"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Location in CK Village</label>
          <input
            type="text"
            required
            placeholder="e.g. Block A, Shop 4"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={formData.locationText}
            onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">WhatsApp Phone Number</label>
          <input
            type="tel"
            required
            placeholder="08012345678"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            value={formData.whatsappNumber}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Shop Description</label>
          <textarea
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Register Shop'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-600">
        Already registered?{' '}
        <Link href="/vendor/login" className="text-emerald-700 hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  );
}
