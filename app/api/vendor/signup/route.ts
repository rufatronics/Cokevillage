import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { normalizeWhatsAppNumber } from '@/lib/utils/whatsapp';
import { checkRateLimit } from '@/lib/ratelimit';

const vendorSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  locationText: z.string().min(2, 'Location text is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rl = await checkRateLimit(`vendor-signup:${ip}`);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const validated = vendorSignupSchema.parse(body);

    const adminSupabase = await createAdminClient();

    // 1. Create user in Supabase Auth via admin API
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: { full_name: validated.fullName },
    });

    if (authError || !authUser.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create account' }, { status: 400 });
    }

    const userId = authUser.user.id;

    // 2. Normalize WhatsApp number
    const normalizedWhatsApp = normalizeWhatsAppNumber(validated.whatsappNumber);

    // 3. Create pending shop record for user
    const { error: shopError } = await adminSupabase.from('shops').insert({
      owner_id: userId,
      name: validated.shopName,
      slug: validated.slug,
      description: validated.description || '',
      location_text: validated.locationText,
      whatsapp_number: normalizedWhatsApp,
      status: 'pending',
      is_open: false,
      payments_enabled: false,
    });

    if (shopError) {
      // Rollback auth user if shop creation fails
      await adminSupabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: shopError.message || 'Failed to register shop' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor signup successful. Your shop is pending admin approval.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error during vendor signup' }, { status: 500 });
  }
}
