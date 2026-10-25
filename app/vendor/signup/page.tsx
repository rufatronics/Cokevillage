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
  const [showPassword, setShowPassword] = useState(false);
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

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

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
            placeholder="e.g. Amina Musa"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Your full legal or operating name.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            placeholder="e.g. amina@gmail.com"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Used to sign in to your vendor dashboard.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full rounded border border-gray-300 p-2.5 text-sm pr-16"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Shop Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Mama Put Kitchen"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={formData.shopName}
            onChange={(e) => handleShopNameChange(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">The public name of your shop in CK Village.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Shop URL Slug</label>
          <input
            type="text"
            required
            placeholder="e.g. mama-put-kitchen"
            className="mt-1 w-full rounded border border-gray-300 bg-gray-50 p-2.5 text-sm"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">URL path: /s/mama-put-kitchen</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Location in CK Village</label>
          <input
            type="text"
            required
            placeholder="e.g. Beside the main gate, shop 12"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={formData.locationText}
            onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Clear address for students to find your shop.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">WhatsApp Phone Number</label>
          <input
            type="tel"
            required
            placeholder="e.g. 08012345678"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            value={formData.whatsappNumber}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Accepts 0801..., +234..., or 234...</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Shop Description</label>
          <textarea
            placeholder="e.g. Rice, beans, jollof and cold drinks"
            className="mt-1 w-full rounded border border-gray-300 p-2.5 text-sm"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">Short summary of what your shop sells.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 min-h-[44px]"
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
