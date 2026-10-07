-- DOBERTO VCF — Supabase security hardening + audit
-- Safe to run more than once.
-- Runtime architecture: browser never needs direct table access. The backend
-- uses the Supabase service-role key for registrations/settings/campaigns.

do $$
declare
  table_name text;
  protected_tables text[] := array[
    'registrations',
    'app_users',
    'app_settings',
    'notification_campaigns'
  ];
begin
  foreach table_name in array protected_tables loop
    if exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = table_name
        and c.relkind in ('r','p')
    ) then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all on table public.%I from public', table_name);
      execute format('revoke all on table public.%I from anon', table_name);
      execute format('revoke all on table public.%I from authenticated', table_name);
    end if;
  end loop;
end
$$;

-- Admin login-guard RPCs are backend-only. If they exist in production,
-- keep them callable only through service_role and pin search_path.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid, p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'admin_login_guard_check',
        'admin_login_guard_fail',
        'admin_login_guard_success'
      )
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn.signature);
    execute format('grant execute on function %s to service_role', fn.signature);
    execute format('alter function %s set search_path = pg_catalog, public', fn.signature);
  end loop;
end
$$;

-- Verification: expected backend-only tables should have RLS enabled and no
-- direct anon/authenticated grants.
select
  c.relname as relation_name,
  case c.relkind
    when 'r' then 'table'
    when 'p' then 'partitioned_table'
    when 'v' then 'view'
    when 'm' then 'materialized_view'
    else c.relkind::text
  end as relation_type,
  c.relrowsecurity as rls_enabled,
  has_table_privilege('anon', format('public.%I', c.relname), 'select') as anon_select,
  has_table_privilege('authenticated', format('public.%I', c.relname), 'select') as authenticated_select
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = any(array[
    'registrations',
    'app_users',
    'app_settings',
    'notification_campaigns'
  ])
order by c.relname;

-- Audit public functions for dangerous SECURITY DEFINER/search_path exposure.
select
  p.oid::regprocedure::text as function_signature,
  p.prosecdef as security_definer,
  p.proconfig as function_config,
  has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.prosecdef = true
    or p.proconfig is null
    or p.proname like 'admin_login_guard_%'
  )
order by p.proname;

-- Audit public views so SECURITY DEFINER-style views can be identified.
select
  c.relname as view_name,
  c.reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'v'
order by c.relname;
