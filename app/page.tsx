export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-emerald-50 p-6 text-center border border-emerald-100">
        <h1 className="text-2xl font-bold text-emerald-900 sm:text-3xl">
          Order Food & Drinks in CK Village, BUK
        </h1>
        <p className="mt-2 text-sm text-emerald-800">
          Browse vendors, chat on WhatsApp to order, or pay online for fast pickup.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Popular Vendors</h2>
        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No vendors listed yet. Vendor signup and admin approval coming in Phase 2!
        </div>
      </section>
    </div>
  );
}
