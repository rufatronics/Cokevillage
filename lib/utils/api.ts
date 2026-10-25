import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function verifyUserRole(allowedRoles: ('student' | 'vendor' | 'admin')[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false as const,
      user: null,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role as 'student' | 'vendor' | 'admin')) {
    return {
      authorized: false as const,
      user,
      response: NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 }),
    };
  }

  return { authorized: true as const, user, role: profile.role as 'student' | 'vendor' | 'admin' };
}
