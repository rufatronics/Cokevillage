import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm space-y-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xl">
        🛒
      </div>
      <h1 className="text-xl font-bold text-gray-900">Online Checkout Coming Soon</h1>
      <p className="text-sm text-gray-600">
        In Phase 3, you will be able to add items to your cart and pay securely online with Paystack!
      </p>
      <p className="text-xs text-gray-500">
        For now, browse vendors and use the <strong className="text-green-700">Chat to order</strong> button on any shop page to order directly via WhatsApp.
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
