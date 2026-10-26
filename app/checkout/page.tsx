'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirectTo=/cart');
      } else {
        router.push('/cart');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
      Checking authentication...
    </div>
  );
}
