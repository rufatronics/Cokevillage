import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Part A: Role Logic & Approval RPC Verification', () => {
  const initialSchemaPath = path.join(__dirname, '../supabase/migrations/20250101000000_initial_schema.sql');
  const triggerFixPath = path.join(__dirname, '../supabase/migrations/20250101000001_fix_role_trigger.sql');
  const rpcPath = path.join(__dirname, '../supabase/migrations/20250101000002_approve_shop_rpc.sql');

  const initialSchemaSql = fs.readFileSync(initialSchemaPath, 'utf8');
  const triggerFixSql = fs.readFileSync(triggerFixPath, 'utf8');
  const rpcSql = fs.readFileSync(rpcPath, 'utf8');

  it('defines approve_shop RPC function with atomic status and role update', () => {
    expect(rpcSql).toContain('create or replace function public.approve_shop');
    expect(rpcSql).toContain("update public.shops");
    expect(rpcSql).toContain("set status = 'approved'");
    expect(rpcSql).toContain("update public.profiles");
    expect(rpcSql).toContain("set role = 'vendor'");
  });

  it('preserves admin role in approve_shop RPC function', () => {
    expect(rpcSql).toContain("if v_owner_role != 'admin' then");
    expect(rpcSql).toContain("set role = 'vendor'");
  });

  it('permits service_role and admin in prevent_role_change trigger function', () => {
    expect(triggerFixSql).toContain("current_setting('role', true) = 'service_role'");
    expect(triggerFixSql).toContain("public.is_admin()");
    expect(triggerFixSql).toContain("raise exception 'You are not allowed to change user roles'");
  });

  it('verifies RLS policies enforce student and vendor isolation', () => {
    expect(initialSchemaSql).toContain('create policy "Student read own orders policy"');
    expect(initialSchemaSql).toContain('student_id = auth.uid()');
    expect(initialSchemaSql).toContain('create policy "Vendor read shop orders via view or direct"');
    expect(initialSchemaSql).toContain('s.owner_id = auth.uid()');
  });
});
