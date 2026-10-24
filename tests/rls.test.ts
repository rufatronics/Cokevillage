import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('RLS & Security Policy SQL Verification', () => {
  const sqlPath = path.join(__dirname, '../supabase/migrations/20250101000000_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  it('revokes direct SELECT on public.shops from anon role', () => {
    expect(sql).toContain('revoke select on public.shops from anon;');
    expect(sql).toContain('grant select on public.public_shops to anon, authenticated;');
  });

  it('hides bank details and subaccount code in public_shops view', () => {
    const publicShopsDef = sql.slice(
      sql.indexOf('create or replace view public.public_shops as'),
      sql.indexOf('from public.shops')
    );
    expect(publicShopsDef).not.toContain('bank_code');
    expect(publicShopsDef).not.toContain('account_number');
    expect(publicShopsDef).not.toContain('paystack_subaccount_code');
  });

  it('does NOT expose pickup_token in vendor_orders view', () => {
    const vendorOrdersDef = sql.slice(
      sql.indexOf('create or replace view public.vendor_orders as'),
      sql.indexOf('from public.orders;')
    );
    expect(vendorOrdersDef).not.toContain('pickup_token');
  });

  it('prevents users from updating their own role', () => {
    expect(sql).toContain('create policy "Users can update their own profile (except role)"');
    expect(sql).toContain('role = (select role from public.profiles where id = auth.uid())');
  });

  it('restricts student order visibility to their own student_id', () => {
    expect(sql).toContain('create policy "Student read own orders policy"');
    expect(sql).toContain('student_id = auth.uid()');
  });

  it('restricts vendor order visibility to their owned shops', () => {
    expect(sql).toContain('create policy "Vendor read shop orders via view or direct"');
    expect(sql).toContain('s.owner_id = auth.uid()');
  });

  it('includes atomic verify_pickup RPC function', () => {
    expect(sql).toContain('create or replace function public.verify_pickup');
    expect(sql).toContain("update public.orders");
    expect(sql).toContain("set status = 'collected'");
    expect(sql).toContain("where pickup_token = p_token");
    expect(sql).toContain("and status = 'paid'");
  });
});
