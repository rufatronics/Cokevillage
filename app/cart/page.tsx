'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCart,
  updateItemQuantity,
  updateCartNote,
  clearCart,
  calculateCartTotal,
  Cart,
} from '@/lib/cart';
import { formatCurrencyNaira } from '@/lib/utils/format';
import { formatWhatsAppUrl } from '@/lib/utils/whatsapp';
import { createClient } from '@/lib/supabase/client';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [shopDetails, setShopDetails] = useState<{
    payments_enabled: boolean;
    is_open: boolean;
    whatsapp_number: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCartAndShop = async () => {
    setLoading(true);
    const currentCart = getCart();
    setCart(currentCart);

    if (currentCart?.shopId) {
      const supabase = createClient();
      const { data: shop } = await supabase
        .from('public_shops')
        .select('payments_enabled, is_open, whatsapp_number')
        .eq('id', currentCart.shopId)
        .single();

      if (shop) {
        setShopDetails(shop);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCartAndShop();
  }, []);

  const handleQuantityChange = (itemId: string, newQty: number) => {
    const updated = updateItemQuantity(itemId, newQty);
    setCart(updated);
  };

  const handleNoteChange = (note: string) => {
    const updated = updateCartNote(note);
    setCart(updated);
  };

  const handleClear = () => {
    clearCart();
    setCart(null);
    setShopDetails(null);
  };

  const handleCheckout = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login?redirectTo=/cart');
      return;
    }

    // In Phase 3: Order history skeleton / notice
    alert('Order & Pay online integration will be completed in Phase 4!');
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading cart details...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xl font-bold">
          🛒
        </div>
        <h1 className="text-xl font-bold text-gray-900">Your Cart is Empty</h1>
        <p className="text-xs text-gray-500">
          Browse CK Village shops to add delicious dishes to your cart!
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block rounded bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 min-h-[44px] leading-loose"
          >
            Browse Vendors
          </Link>
        </div>
      </div>
    );
  }

  const cartTotal = calculateCartTotal(cart);
  const showOrderAndPay = shopDetails?.payments_enabled && shopDetails?.is_open;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-xs text-gray-500">
            Ordering from:{' '}
            <Link href={`/s/${cart.shopSlug}`} className="font-semibold text-emerald-700 underline">
              {cart.shopName}
            </Link>
          </p>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-red-600 hover:underline min-h-[44px] px-2 flex items-center"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Items List */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm divide-y divide-gray-100">
        {cart.items.map((item) => (
          <div key={item.id} className="py-3 flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>

              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5">
                  {item.selectedOptions.map((opt, idx) => (
                    <li key={idx}>
                      {opt.groupName}: {opt.optionName}{' '}
                      {opt.priceDeltaKobo > 0 && `(+${formatCurrencyNaira(opt.priceDeltaKobo)})`}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs font-bold text-emerald-700">{formatCurrencyNaira(item.lineTotalKobo)}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                className="rounded border border-gray-300 px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 min-h-[44px] min-w-[44px]"
              >
                -
              </button>
              <span className="text-xs font-bold text-gray-900">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                className="rounded border border-gray-300 px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 min-h-[44px] min-w-[44px]"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Note */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-2">
        <label className="block text-xs font-medium text-gray-700">Order Note for Vendor (max 200 chars)</label>
        <textarea
          maxLength={200}
          rows={2}
          placeholder="e.g. Please make the soup extra spicy..."
          value={cart.note || ''}
          onChange={(e) => handleNoteChange(e.target.value)}
          className="w-full rounded border border-gray-300 p-2.5 text-sm"
        />
        <p className="text-[10px] text-gray-400 text-right">{(cart.note || '').length}/200</p>
      </div>

      {/* Order Summary & Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-base font-bold text-gray-900">
          <span>Estimated Total</span>
          <span className="text-emerald-800">{formatCurrencyNaira(cartTotal)}</span>
        </div>

        {showOrderAndPay ? (
          <button
            onClick={handleCheckout}
            className="w-full rounded bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 min-h-[44px]"
          >
            Order & Pay Online
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center">
              This vendor receives orders directly via WhatsApp.
            </p>
            <a
              href={formatWhatsAppUrl(
                shopDetails?.whatsapp_number || '',
                `Hello! I want to order from ${cart.shopName}:\n\n` +
                  cart.items.map((i) => `- ${i.quantity}x ${i.name}`).join('\n') +
                  (cart.note ? `\n\nNote: ${cart.note}` : '') +
                  `\n\nTotal: ${formatCurrencyNaira(cartTotal)}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded bg-green-600 py-3 text-center text-sm font-semibold text-white hover:bg-green-700 min-h-[44px]"
            >
              Chat to order via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
