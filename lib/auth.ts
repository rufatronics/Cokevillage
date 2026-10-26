import { createClient } from '@/lib/supabase/server';

export interface CurrentUserResult {
  user: { id: string; email?: string } | null;
  profile: { id: string; role: 'student' | 'vendor' | 'admin'; full_name?: string; email?: string } | null;
  role: 'student' | 'vendor' | 'admin' | null;
  shop: { id: string; name: string; slug: string; status: 'pending' | 'approved' | 'suspended'; is_open: boolean } | null;
}

export async function getCurrentUser(): Promise<CurrentUserResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, role: null, shop: null };
  }

  // Always read fresh profile role directly from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .single();

  const role = (profile?.role as 'student' | 'vendor' | 'admin') || null;

  // Fetch shop if user owns a shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, status, is_open')
    .eq('owner_id', user.id)
    .single();

  return {
    user: { id: user.id, email: user.email },
    profile: profile || null,
    role,
    shop: shop || null,
  };
}
