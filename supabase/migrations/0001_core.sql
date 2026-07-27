-- Thrive Platform — core multi-tenant schema.
-- One Supabase project serves every client; Postgres Row-Level Security is
-- what actually prevents one company from ever reading another's data — see
-- the policies below, not application code, for that guarantee.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- companies — one row per tenant (client business).
-- `config` drives which portal sections render and how they're labeled —
-- see lib/portal-config.ts. Never writable by the client directly: no client
-- INSERT/UPDATE policy exists below on purpose. Config changes go through
-- the service-role admin script.
-- ---------------------------------------------------------------------------
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  vertical text not null check (vertical in ('funeral_home', 'roofing')),
  config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users. Populated by the trigger below whenever an
-- account is created via the admin provisioning script (supabase.auth.admin.
-- createUser with company_id in user_metadata).
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id),
  role text not null default 'owner' check (role in ('owner', 'staff')),
  full_name text,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists profiles_company_id_idx on profiles(company_id);

-- ---------------------------------------------------------------------------
-- handle_new_user — copies company_id/full_name out of the metadata the
-- admin script sets at account-creation time. SECURITY DEFINER so it can
-- insert into `profiles` despite running as the (unprivileged) auth trigger
-- context; search_path is pinned to prevent function hijacking.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, company_id, full_name)
  values (
    new.id,
    (new.raw_user_meta_data->>'company_id')::uuid,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- current_company_id() — the single source of truth every RLS policy below
-- (and every future tenant table) checks against. SECURITY DEFINER + pinned
-- search_path so it can read `profiles` regardless of caller and can't be
-- shadowed by a malicious search_path.
-- ---------------------------------------------------------------------------
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- RLS — companies & profiles
-- ---------------------------------------------------------------------------
alter table companies enable row level security;
alter table companies force row level security;

alter table profiles enable row level security;
alter table profiles force row level security;

-- A user may only ever see their own company row. No insert/update/delete
-- policy exists for the client — company rows are managed by the admin
-- script (service role), which bypasses RLS entirely by design.
create policy "companies_select_own" on companies
  for select
  using (id = public.current_company_id());

-- A user may only see and update their own profile row (and only certain
-- columns matter from the client — company_id has no UPDATE policy allowing
-- the client to change it, since there's no client-writable path to it here).
create policy "profiles_select_own" on profiles
  for select
  using (id = auth.uid());

create policy "profiles_update_own" on profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- RLS is row-level only — without this, a user could UPDATE their *own* row
-- but still set company_id or role to anything, since "profiles_update_own"
-- only restricts which ROW is affected, not which COLUMNS change. Column
-- grants close that gap: the client can touch full_name and its own
-- must_change_password flag, nothing that affects tenancy or permissions.
revoke update on public.profiles from authenticated;
grant update (full_name, must_change_password) on public.profiles to authenticated;
