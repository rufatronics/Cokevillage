import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { verifyUserRole } from '@/lib/utils/api';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  sortOrder: z.number().default(0),
});

export async function POST(request: Request) {
  const authCheck = await verifyUserRole(['vendor', 'admin']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

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
    return NextResponse.json({ error: 'Shop must be approved before managing categories' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        shop_id: shop.id,
        name: validated.name,
        sort_order: validated.sortOrder,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, category: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error creating category' }, { status: 500 });
  }
}
