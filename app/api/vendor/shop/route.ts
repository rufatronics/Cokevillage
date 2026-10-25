import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { verifyUserRole } from '@/lib/utils/api';

const updateShopSchema = z.object({
  isOpen: z.boolean(),
  description: z.string().optional(),
  locationText: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

export async function PATCH(request: Request) {
  const authCheck = await verifyUserRole(['vendor', 'admin']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const validated = updateShopSchema.parse(body);

    const supabase = await createClient();
    const { data: shop } = await supabase
      .from('shops')
      .select('id, status')
      .eq('owner_id', authCheck.user.id)
      .single();

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (shop.status !== 'approved' && authCheck.role !== 'admin') {
      return NextResponse.json({ error: 'Shop must be approved before editing' }, { status: 403 });
    }

    const { error } = await supabase
      .from('shops')
      .update({
        is_open: validated.isOpen,
        description: validated.description,
        location_text: validated.locationText,
        whatsapp_number: validated.whatsappNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shop.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error updating shop' }, { status: 500 });
  }
}
