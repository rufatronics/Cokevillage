-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Create custom role enum type
create type user_role as enum ('student', 'vendor', 'admin');
create type shop_status as enum ('pending', 'approved', 'suspended');
create type order_status as enum ('pending_payment', 'paid', 'collected', 'cancelled', 'expired');

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'student',
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. SHOPS TABLE
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  location_text text,
  whatsapp_number text not null,
  logo_path text,
  status shop_status not null default 'pending',
  is_open boolean not null default false,
  payments_enabled boolean not null default false,
  bank_code text,
  account_number text,
  account_name text,
  paystack_subaccount_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_enabled_check check (
    payments_enabled = false or (
      payments_enabled = true and
      paystack_subaccount_code is not null and
      status = 'approved'
    )
  )
);

-- 3. MENU_CATEGORIES TABLE
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. MENU_ITEMS TABLE
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_kobo bigint not null check (price_kobo >= 0),
  image_path text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. OPTION_GROUPS TABLE
create table public.option_groups (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  name text not null,
  min_select integer not null default 0 check (min_select >= 0),
  max_select integer not null default 1 check (max_select >= min_select),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. OPTIONS TABLE
create table public.options (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references public.option_groups(id) on delete cascade,
  name text not null,
  price_delta_kobo bigint not null default 0 check (price_delta_kobo >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. ORDERS TABLE
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  status order_status not null default 'pending_payment',
  total_kobo bigint not null check (total_kobo >= 0),
  platform_fee_kobo bigint not null default 0 check (platform_fee_kobo >= 0),
  paystack_reference text not null unique,
  pickup_token text not null unique,
  note text check (char_length(note) <= 200),
  paid_at timestamptz,
  collected_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. ORDER_ITEMS TABLE (SNAPSHOT)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  unit_price_kobo bigint not null check (unit_price_kobo >= 0),
  quantity integer not null check (quantity > 0),
  selected_options jsonb not null default '[]'::jsonb,
  line_total_kobo bigint not null check (line_total_kobo >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. PAYMENT_EVENTS TABLE
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. REPORTS TABLE
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- INDEXES
create index idx_shops_slug on public.shops(slug);
create index idx_shops_status on public.shops(status);
create index idx_menu_items_shop_id on public.menu_items(shop_id);
create index idx_orders_shop_status_created on public.orders(shop_id, status, created_at desc);
create index idx_orders_student_created on public.orders(student_id, created_at desc);
create index idx_orders_pickup_token on public.orders(pickup_token);

-- Trigram indexes for search
create index idx_shops_name_trgm on public.shops using gin (name gin_trgm_ops);
create index idx_menu_items_name_trgm on public.menu_items using gin (name gin_trgm_ops);

-- TRIGGERS & FUNCTIONS FOR PROFILE CREATION & UPDATED_AT
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    'student',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- VIEWS
-- 1. public_shops view (exposes safe columns only, never bank info)
create or replace view public.public_shops as
select
  id,
  owner_id,
  name,
  slug,
  description,
  location_text,
  whatsapp_number,
  logo_path,
  status,
  is_open,
  payments_enabled,
  created_at,
  updated_at
from public.shops
where status = 'approved';

-- 2. vendor_orders view (does NOT expose pickup_token)
create or replace view public.vendor_orders as
select
  id,
  student_id,
  shop_id,
  status,
  total_kobo,
  platform_fee_kobo,
  paystack_reference,
  note,
  paid_at,
  collected_at,
  expires_at,
  created_at,
  updated_at
from public.orders;

-- RPC FUNCTION: verify_pickup
create or replace function public.verify_pickup(p_token text, p_shop_id uuid)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_order_id uuid;
  v_result jsonb;
begin
  -- Atomic update
  update public.orders
  set status = 'collected',
      collected_at = now(),
      updated_at = now()
  where pickup_token = p_token
    and shop_id = p_shop_id
    and status = 'paid'
  returning id into v_order_id;

  if v_order_id is null then
    return jsonb_build_object('success', false, 'message', 'Invalid or already used token');
  end if;

  -- Build order details response
  select jsonb_build_object(
    'success', true,
    'order', jsonb_build_object(
      'id', o.id,
      'status', o.status,
      'total_kobo', o.total_kobo,
      'note', o.note,
      'paid_at', o.paid_at,
      'collected_at', o.collected_at,
      'items', coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'name', oi.name,
              'quantity', oi.quantity,
              'unit_price_kobo', oi.unit_price_kobo,
              'line_total_kobo', oi.line_total_kobo,
              'selected_options', oi.selected_options
            )
          )
          from public.order_items oi
          where oi.order_id = o.id
        ),
        '[]'::jsonb
      )
    )
  ) into v_result
  from public.orders o
  where o.id = v_order_id;

  return v_result;
end;
$$;

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.option_groups enable row level security;
alter table public.options enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.reports enable row level security;

-- REVOKE DIRECT ACCESS TO SHOPS FOR ANON
revoke select on public.shops from anon;
grant select on public.public_shops to anon, authenticated;

-- Helper function to check admin status
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES POLICIES
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile (except role)"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
    or public.is_admin()
  );

-- SHOPS POLICIES
create policy "Shops select policy"
  on public.shops for select
  to authenticated
  using (
    status = 'approved'
    or owner_id = auth.uid()
    or public.is_admin()
  );

create policy "Vendor shop insert policy"
  on public.shops for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and status = 'pending'
    and payments_enabled = false
    and paystack_subaccount_code is null
  );

create policy "Vendor shop update policy"
  on public.shops for update
  to authenticated
  using (
    owner_id = auth.uid() or public.is_admin()
  )
  with check (
    (
      owner_id = auth.uid()
      and owner_id = (select s.owner_id from public.shops s where s.id = shops.id)
      and status = (select s.status from public.shops s where s.id = shops.id)
      and payments_enabled = (select s.payments_enabled from public.shops s where s.id = shops.id)
      and coalesce(paystack_subaccount_code, '') = coalesce((select s.paystack_subaccount_code from public.shops s where s.id = shops.id), '')
    )
    or public.is_admin()
  );

-- MENU_CATEGORIES POLICIES
create policy "Menu categories select policy"
  on public.menu_categories for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.shops s
      where s.id = menu_categories.shop_id
        and (s.status = 'approved' or s.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Vendor menu categories write policy"
  on public.menu_categories for all
  to authenticated
  using (
    exists (
      select 1 from public.shops s
      where s.id = menu_categories.shop_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.shops s
      where s.id = menu_categories.shop_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  );

-- MENU_ITEMS POLICIES
create policy "Menu items select policy"
  on public.menu_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.shops s
      where s.id = menu_items.shop_id
        and (s.status = 'approved' or s.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Vendor menu items write policy"
  on public.menu_items for all
  to authenticated
  using (
    exists (
      select 1 from public.shops s
      where s.id = menu_items.shop_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.shops s
      where s.id = menu_items.shop_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  );

-- OPTION_GROUPS POLICIES
create policy "Option groups select policy"
  on public.option_groups for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.menu_items mi
      join public.shops s on s.id = mi.shop_id
      where mi.id = option_groups.menu_item_id
        and (s.status = 'approved' or s.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Vendor option groups write policy"
  on public.option_groups for all
  to authenticated
  using (
    exists (
      select 1 from public.menu_items mi
      join public.shops s on s.id = mi.shop_id
      where mi.id = option_groups.menu_item_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.menu_items mi
      join public.shops s on s.id = mi.shop_id
      where mi.id = option_groups.menu_item_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  );

-- OPTIONS POLICIES
create policy "Options select policy"
  on public.options for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.option_groups og
      join public.menu_items mi on mi.id = og.menu_item_id
      join public.shops s on s.id = mi.shop_id
      where og.id = options.option_group_id
        and (s.status = 'approved' or s.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Vendor options write policy"
  on public.options for all
  to authenticated
  using (
    exists (
      select 1 from public.option_groups og
      join public.menu_items mi on mi.id = og.menu_item_id
      join public.shops s on s.id = mi.shop_id
      where og.id = options.option_group_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.option_groups og
      join public.menu_items mi on mi.id = og.menu_item_id
      join public.shops s on s.id = mi.shop_id
      where og.id = options.option_group_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  );

-- ORDERS POLICIES
create policy "Student read own orders policy"
  on public.orders for select
  to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
  );

create policy "Vendor read shop orders via view or direct"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.shops s
      where s.id = orders.shop_id and s.owner_id = auth.uid()
    )
  );

-- ORDER_ITEMS POLICIES
create policy "Order items read policy"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.student_id = auth.uid()
          or exists (
            select 1 from public.shops s
            where s.id = o.shop_id and s.owner_id = auth.uid()
          )
          or public.is_admin()
        )
    )
  );

-- REPORTS POLICIES
create policy "Reports insert policy"
  on public.reports for insert
  to anon, authenticated
  with check (true);

create policy "Admin reports select policy"
  on public.reports for select
  to authenticated
  using (public.is_admin());

-- STORAGE BUCKET setup for shop-images
insert into storage.buckets (id, name, public)
values ('shop-images', 'shop-images', true)
on conflict (id) do nothing;

create policy "Public shop image download policy"
  on storage.objects for select
  to public
  using (bucket_id = 'shop-images');

create policy "Vendor shop image insert policy"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'shop-images'
    and exists (
      select 1 from public.shops s
      where s.id::text = (storage.foldername(name))[1]
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Vendor shop image update/delete policy"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'shop-images'
    and exists (
      select 1 from public.shops s
      where s.id::text = (storage.foldername(name))[1]
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "Vendor shop image delete policy"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'shop-images'
    and exists (
      select 1 from public.shops s
      where s.id::text = (storage.foldername(name))[1]
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  );
