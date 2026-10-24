'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/image-compression';
import { uploadShopImage, getPublicImageUrl } from '@/lib/storage';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  price_kobo: number;
  is_available: boolean;
  image_path?: string | null;
}

export default function VendorMenuEditor({
  shopId,
  initialCategories,
  initialItems,
}: {
  shopId: string;
  initialCategories: Category[];
  initialItems: MenuItem[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  const [itemName, setItemName] = useState('');
  const [itemPriceNaira, setItemPriceNaira] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/vendor/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCategories((prev) => [...prev, data.category]);
      setNewCatName('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagePath: string | null = null;

      if (imageFile) {
        const compressed = await compressImage(imageFile);
        imagePath = await uploadShopImage(shopId, compressed);
      }

      const priceKobo = Math.round(parseFloat(itemPriceNaira) * 100);

      const res = await fetch('/api/vendor/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName,
          description: itemDesc,
          priceKobo,
          categoryId: selectedCatId || null,
          imagePath,
          isAvailable: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => [...prev, data.item]);
      setItemName('');
      setItemPriceNaira('');
      setItemDesc('');
      setImageFile(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch('/api/vendor/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          priceKobo: item.price_kobo,
          isAvailable: !item.is_available,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle availability');
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Category Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800">Menu Categories</h2>
        <form onSubmit={addCategory} className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="New Category Name (e.g. Drinks, Rice)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 rounded border border-gray-300 p-2 text-sm"
            required
          />
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
            Add Category
          </button>
        </form>
      </div>

      {/* Add Menu Item Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800">Add Menu Item</h2>
        <form onSubmit={addItem} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">Item Name</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Price (₦ Naira)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="1500"
                value={itemPriceNaira}
                onChange={(e) => setItemPriceNaira(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Category</label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Description</label>
            <textarea
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">Photo (Compressed in browser &lt;80KB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1 block text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Item'}
          </button>
        </form>
      </div>

      {/* Menu List */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Current Menu</h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No items added yet.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {item.image_path && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getPublicImageUrl(item.image_path) || ''}
                      alt={item.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">₦{(item.price_kobo / 100).toLocaleString()}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleAvailability(item)}
                  className={`rounded px-3 py-1 text-xs font-semibold ${
                    item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.is_available ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
