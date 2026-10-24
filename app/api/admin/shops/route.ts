import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const actionSchema = z.object({
  shopId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'suspend']),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validated = actionSchema.parse(body);

    const adminSupabase = await createAdminClient();

    // Fetch shop details
    const { data: shop, error: fetchError } = await adminSupabase
      .from('shops')
      .select('id, owner_id, status')
      .eq('id', validated.shopId)
      .single();

    if (fetchError || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (validated.action === 'approve') {
      // 1. Set shop status to approved
      const { error: shopUpdateErr } = await adminSupabase
        .from('shops')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', shop.id);

      if (shopUpdateErr) {
        return NextResponse.json({ error: shopUpdateErr.message }, { status: 400 });
      }

      // 2. Set profile role to vendor
      const { error: profileUpdateErr } = await adminSupabase
        .from('profiles')
        .update({ role: 'vendor', updated_at: new Date().toISOString() })
        .eq('id', shop.owner_id);

      if (profileUpdateErr) {
        return NextResponse.json({ error: profileUpdateErr.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Shop approved and vendor role assigned.' });
    } else if (validated.action === 'reject' || validated.action === 'suspend') {
      const newStatus = validated.action === 'suspend' ? 'suspended' : 'pending';

      const { error: updateErr } = await adminSupabase
        .from('shops')
        .update({ status: newStatus, is_open: false, updated_at: new Date().toISOString() })
        .eq('id', shop.id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: `Shop status updated to ${newStatus}.` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error processing admin action' }, { status: 500 });
  }
}
