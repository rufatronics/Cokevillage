import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const updateShopSchema = z.object({
  isOpen: z.boolean(),
  description: z.string().optional(),
  locationText: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = updateShopSchema.parse(body);

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
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
