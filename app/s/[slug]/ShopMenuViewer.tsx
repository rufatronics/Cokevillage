'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPublicImageUrl } from '@/lib/storage';
import {
  getCart,
  addItemToCart,
  clearCart,
  CartOption,
  calculateCartTotal,
} from '@/lib/cart';
import { formatCurrencyNaira } from '@/lib/utils/format';

interface Option {
  id: string;
  name: string;
  price_delta_kobo: number;
  is_available: boolean;
}

interface OptionGroup {
  id: string;
  name: string;
  min_select: number;
  max_select: number;
  options: Option[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price_kobo: number;
  is_available: boolean;
  image_path?: string | null;
  option_groups?: OptionGroup[];
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  is_open: boolean;
  payments_enabled: boolean;
  whatsapp_number: string;
}

export default function ShopMenuViewer({
  shop,
  items,
}: {
  shop: Shop;
  categories: unknown[];
  items: MenuItem[];
}) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, Option[]>>({});
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const refreshCartState = () => {
    const cart = getCart();
    if (cart) {
      setCartCount(cart.items.reduce((sum, item) => sum + item.quantity, 0));
      setCartTotal(calculateCartTotal(cart));
    } else {
      setCartCount(0);
      setCartTotal(0);
    }
  };

  useEffect(() => {
    refreshCartState();
  }, []);

  const openItemModal = (item: MenuItem) => {
    if (!item.is_available) return;
    setSelectedItem(item);
    setQuantity(1);

    // Initialize option groups selection
    const initMap: Record<string, Option[]> = {};
    if (item.option_groups) {
      item.option_groups.forEach((og) => {
        initMap[og.id] = [];
      });
    }
    setSelectedOptionsMap(initMap);
  };

  const handleOptionToggle = (og: OptionGroup, opt: Option) => {
    const current = selectedOptionsMap[og.id] || [];
    const exists = current.some((o) => o.id === opt.id);

    if (exists) {
      setSelectedOptionsMap({
        ...selectedOptionsMap,
        [og.id]: current.filter((o) => o.id !== opt.id),
      });
    } else {
      // Check max_select constraint
      if (og.max_select === 1) {
        setSelectedOptionsMap({
          ...selectedOptionsMap,
          [og.id]: [opt],
        });
      } else if (current.length < og.max_select) {
        setSelectedOptionsMap({
          ...selectedOptionsMap,
          [og.id]: [...current, opt],
        });
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    // Validate min_select for all option groups
    if (selectedItem.option_groups) {
      for (const og of selectedItem.option_groups) {
        const selected = selectedOptionsMap[og.id] || [];
        if (selected.length < og.min_select) {
          alert(`Please select at least ${og.min_select} option(s) for "${og.name}".`);
          return;
        }
      }
    }

    // Flatten options
    const flatOptions: CartOption[] = [];
    if (selectedItem.option_groups) {
      selectedItem.option_groups.forEach((og) => {
        const selected = selectedOptionsMap[og.id] || [];
        selected.forEach((opt) => {
          flatOptions.push({
            groupName: og.name,
            optionName: opt.name,
            priceDeltaKobo: opt.price_delta_kobo,
          });
        });
      });
    }

    const result = addItemToCart(
      { id: shop.id, name: shop.name, slug: shop.slug },
      { menuItemId: selectedItem.id, name: selectedItem.name, unitPriceKobo: selectedItem.price_kobo },
      quantity,
      flatOptions
    );

    if (result.requiresClearConfirm) {
      setConflictModalOpen(true);
      return;
    }

    refreshCartState();
    setSelectedItem(null);
  };

  const confirmClearAndAdd = () => {
    clearCart();
    setConflictModalOpen(false);
    handleAddToCart();
  };

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
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold text-gray-900">Menu</h2>
        <button
          onClick={() => setReportModalOpen(true)}
          className="text-xs text-red-600 hover:underline min-h-[44px] px-2 flex items-center"
        >
          Report Shop
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">This shop has no menu items listed yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openItemModal(item)}
              className={`flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition ${
                item.is_available ? 'cursor-pointer hover:border-emerald-500' : 'opacity-60'
              }`}
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                <p className="text-sm font-bold text-emerald-700">{formatCurrencyNaira(item.price_kobo)}</p>
                {!item.is_available ? (
                  <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                    Sold Out
                  </span>
                ) : (
                  <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    Tap to select
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

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-xl bg-emerald-800 p-4 text-white shadow-lg">
            <div>
              <p className="text-xs text-emerald-200">{cartCount} item(s) in cart</p>
              <p className="text-base font-bold">{formatCurrencyNaira(cartTotal)}</p>
            </div>
            <Link
              href="/cart"
              className="rounded bg-white px-4 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-50 min-h-[44px] flex items-center"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm font-semibold text-emerald-700">{formatCurrencyNaira(selectedItem.price_kobo)}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 text-lg font-bold min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {selectedItem.description && <p className="text-xs text-gray-600">{selectedItem.description}</p>}

            {/* Option Groups */}
            {selectedItem.option_groups && selectedItem.option_groups.length > 0 && (
              <div className="space-y-4 pt-2">
                {selectedItem.option_groups.map((og) => (
                  <div key={og.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{og.name}</h4>
                      <span className="text-[10px] text-gray-500">
                        {og.min_select > 0 ? `Select min ${og.min_select}` : 'Optional'}
                        {og.max_select > 1 ? ` (max ${og.max_select})` : ''}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {og.options.map((opt) => {
                        const isSelected = (selectedOptionsMap[og.id] || []).some((o) => o.id === opt.id);
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center justify-between rounded p-2 text-xs cursor-pointer border ${
                              isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type={og.max_select === 1 ? 'radio' : 'checkbox'}
                                checked={isSelected}
                                onChange={() => handleOptionToggle(og, opt)}
                                className="text-emerald-600"
                              />
                              <span className="font-medium text-gray-800">{opt.name}</span>
                            </div>
                            {opt.price_delta_kobo > 0 && (
                              <span className="text-gray-500">+ {formatCurrencyNaira(opt.price_delta_kobo)}</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Control */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-700">Quantity</span>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                >
                  -
                </button>
                <span className="text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full rounded bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 min-h-[44px]"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Cart Conflict Modal */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl space-y-4 text-center">
            <h3 className="text-lg font-bold text-gray-900">Clear Existing Cart?</h3>
            <p className="text-xs text-gray-600">
              Your cart currently contains items from another shop. You can only order from one shop per cart.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConflictModalOpen(false)}
                className="flex-1 rounded border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 min-h-[44px]"
              >
                Keep Existing Cart
              </button>
              <button
                type="button"
                onClick={confirmClearAndAdd}
                className="flex-1 rounded bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 min-h-[44px]"
              >
                Clear & Add Item
              </button>
            </div>
          </div>
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
                    className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
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
