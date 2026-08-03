-- Expands the funeral document field set to match the client's real intake
-- paperwork (South Chicago Chapel intake sheet, Cremation Certificate,
-- Coroner's Permit to Cremate). Every new column is nullable — the
-- extraction pipeline never fabricates a value, so "not on this document"
-- is always represented as null, never a guess.

-- Reconcile existing generic fields with the fuller field set's naming:
-- family_name was always "next of kin / primary contact" in practice (see
-- extraction.ts's prompt) — rename it to say so directly. Same for address
-- meaning "home address of the deceased/family".
alter table documents rename column family_name to next_of_kin_name;
alter table documents rename column address to home_address;

alter table documents
  add column if not exists next_of_kin_relationship text,
  add column if not exists next_of_kin_phone text,
  add column if not exists next_of_kin_cell text,
  add column if not exists time_of_death text,
  add column if not exists date_of_birth date,
  add column if not exists age text,
  add column if not exists sex text,
  add column if not exists place_of_death text,
  add column if not exists cause_of_death text,
  add column if not exists disposition_type text
    check (disposition_type in ('Burial', 'Cremation')),
  add column if not exists disposition_location text,
  add column if not exists funeral_director text,
  add column if not exists ssn text,
  add column if not exists marital_status text,
  add column if not exists race text,
  add column if not exists hispanic_origin text,
  add column if not exists birthplace text,
  add column if not exists occupation text,
  add column if not exists business_industry text,
  add column if not exists father_name text,
  add column if not exists mother_maiden_name text,
  add column if not exists physician_name text,
  add column if not exists physician_phone text,
  add column if not exists armed_forces boolean,
  add column if not exists num_death_certificates integer,
  add column if not exists education text;

-- The generic phone_numbers[] catch-all is superseded by named phone
-- fields (next_of_kin_phone/cell above, plus physician_phone) — every
-- phone on these forms now has a specific home instead of an ambiguous
-- array. Carry forward any existing value into next_of_kin_phone before
-- dropping the column so real client data isn't silently lost.
update documents
  set next_of_kin_phone = phone_numbers[1]
  where next_of_kin_phone is null
    and phone_numbers is not null
    and array_length(phone_numbers, 1) > 0;

alter table documents drop column if exists phone_numbers;

-- ---------------------------------------------------------------------------
-- company_field_prefs — per-company "At a Glance" field order on the
-- document detail view. One row per company; an empty array means "use the
-- built-in default order" (see lib/portal/funeral/field-schema.ts). Unlike
-- companies.config, this genuinely is client-writable: it doesn't affect
-- tenancy or permissions, just a display preference shared by every staff
-- member on that company's account.
-- ---------------------------------------------------------------------------
create table if not exists company_field_prefs (
  company_id uuid primary key references companies(id) on delete cascade,
  at_a_glance_fields jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table company_field_prefs enable row level security;
alter table company_field_prefs force row level security;

create policy "company_field_prefs_all_own_company" on company_field_prefs
  for all
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());
