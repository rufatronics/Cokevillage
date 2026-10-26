-- Migration: 20250101000002_approve_shop_rpc.sql
-- Atomic shop approval RPC function that sets shop status to approved and owner profile role to vendor (unless admin)

create or replace function public.approve_shop(p_shop_id uuid)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner_id uuid;
  v_owner_role user_role;
begin
  -- Fetch shop owner and role
  select s.owner_id, p.role into v_owner_id, v_owner_role
  from public.shops s
  join public.profiles p on p.id = s.owner_id
  where s.id = p_shop_id;

  if v_owner_id is null then
    return jsonb_build_object('success', false, 'error', 'Shop or owner not found');
  end if;

  -- 1. Atomic update shop status
  update public.shops
  set status = 'approved',
      updated_at = now()
  where id = p_shop_id;

  -- 2. Update profile role to vendor if not currently admin
  if v_owner_role != 'admin' then
    update public.profiles
    set role = 'vendor',
        updated_at = now()
    where id = v_owner_id;
  end if;

  return jsonb_build_object('success', true, 'message', 'Shop approved successfully');
end;
$$;
