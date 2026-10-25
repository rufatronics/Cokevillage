import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyUserRole } from '@/lib/utils/api';

const actionSchema = z.object({
  shopId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'suspend']),
});

export async function GET() {
  const authCheck = await verifyUserRole(['admin']);
  if (!authCheck.authorized) {
    return authCheck.response;
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
  const authCheck = await verifyUserRole(['admin']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const validated = actionSchema.parse(body);

    const adminSupabase = await createAdminClient();

    if (validated.action === 'approve') {
      // Call atomic RPC function approve_shop
      const { data, error } = await adminSupabase.rpc('approve_shop', {
        p_shop_id: validated.shopId,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const result = data as { success: boolean; message?: string; error?: string };
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Shop approval failed' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.message || 'Shop approved successfully.' });
    } else if (validated.action === 'reject' || validated.action === 'suspend') {
      const newStatus = validated.action === 'suspend' ? 'suspended' : 'pending';

      const { error: updateErr } = await adminSupabase
        .from('shops')
        .update({ status: newStatus, is_open: false, updated_at: new Date().toISOString() })
        .eq('id', validated.shopId);

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
