import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  priceKobo: z.number().min(0, 'Price must be non-negative integer kobo'),
  imagePath: z.string().nullable().optional(),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validated = itemSchema.parse(body);

    if (validated.id) {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          category_id: validated.categoryId,
          name: validated.name,
          description: validated.description,
          price_kobo: validated.priceKobo,
          image_path: validated.imagePath,
          is_available: validated.isAvailable,
          sort_order: validated.sortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.id)
        .eq('shop_id', shop.id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, item: data });
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          shop_id: shop.id,
          category_id: validated.categoryId,
          name: validated.name,
          description: validated.description,
          price_kobo: validated.priceKobo,
          image_path: validated.imagePath,
          is_available: validated.isAvailable,
          sort_order: validated.sortOrder,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, item: data });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error saving menu item' }, { status: 500 });
  }
}
