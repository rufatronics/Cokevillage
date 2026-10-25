import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const actionSchema = z.object({
  shopId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'suspend']),
});

async function verifyAdminRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, status: 401, error: 'Authentication required. Please log in.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { authorized: false, status: 403, error: 'Forbidden: Admin privileges required.' };
  }

  return { authorized: true, user };
}

export async function GET() {
  const authCheck = await verifyAdminRole();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const adminSupabase = await createAdminClient();
    const { data: shops, error } = await adminSupabase
      .from('shops')
      .select('*, profiles:owner_id(full_name, email, role)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ shops: shops || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch admin shops' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authCheck = await verifyAdminRole();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const validated = actionSchema.parse(body);

    const adminSupabase = await createAdminClient();

    const { data: shop, error: fetchError } = await adminSupabase
      .from('shops')
      .select('id, owner_id, status, profiles:owner_id(role)')
      .eq('id', validated.shopId)
      .single();

    if (fetchError || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (validated.action === 'approve') {
      const { error: shopUpdateErr } = await adminSupabase
        .from('shops')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', shop.id);

      if (shopUpdateErr) {
        return NextResponse.json({ error: shopUpdateErr.message }, { status: 400 });
      }

      // Check current role of shop owner; preserve if already admin
      const ownerRole = (shop.profiles as unknown as { role?: string })?.role;
      if (ownerRole !== 'admin') {
        const { error: profileUpdateErr } = await adminSupabase
          .from('profiles')
          .update({ role: 'vendor', updated_at: new Date().toISOString() })
          .eq('id', shop.owner_id);

        if (profileUpdateErr) {
          return NextResponse.json({ error: profileUpdateErr.message }, { status: 400 });
        }
      }

      return NextResponse.json({ success: true, message: 'Shop approved successfully.' });
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
