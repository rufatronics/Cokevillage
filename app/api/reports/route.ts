import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/ratelimit';

const reportSchema = z.object({
  shopId: z.string().uuid(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rl = await checkRateLimit(`report:${ip}`);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many reports submitted. Please try again later.' }, { status: 429 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const validated = reportSchema.parse(body);

    const { error } = await supabase.from('reports').insert({
      shop_id: validated.shopId,
      reporter_id: user?.id || null,
      reason: validated.reason,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error submitting report' }, { status: 500 });
  }
}
