-- Migration: 20250101000001_fix_role_trigger.sql
-- Ensure service_role/postgres can change roles, but normal users cannot change any role.

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Allow service_role or postgres user or admin to update roles
  if (current_setting('role', true) = 'service_role' or current_user = 'postgres' or public.is_admin()) then
    return new;
  end if;

  -- For normal authenticated users, role cannot be modified
  if old.role is distinct from new.role then
    raise exception 'You are not allowed to change user roles';
  end if;

  return new;
end;
$$;

drop trigger if exists check_role_change on public.profiles;

create trigger check_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_role_change();
