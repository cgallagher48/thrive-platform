-- Funeral-home vertical tables — adapted from south-chicago-chapel's
-- standalone supabase/schema.sql, now tenant-scoped with company_id + RLS
-- so they live safely alongside every other client in the same project.
--
-- Every policy follows the same shape: company_id = current_company_id().
-- INSERT/UPDATE policies matter as much as SELECT — without them a forged
-- request could still write into another tenant's rows even if it can't
-- read them.

-- ---------------------------------------------------------------------------
-- families
-- ---------------------------------------------------------------------------
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  deceased_name text,
  next_of_kin_name text not null,
  phone text,
  email text,
  status text not null default 'active'
    check (status in ('active', 'pre-need', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists families_company_id_idx on families(company_id);

alter table families enable row level security;
alter table families force row level security;

create policy "families_all_own_company" on families
  for all
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  service_type text not null
    check (service_type in ('Visitation', 'Funeral', 'Burial', 'Cremation', 'Memorial')),
  service_date timestamptz,
  location text,
  notes text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists services_company_id_idx on services(company_id);
create index if not exists services_family_id_idx on services(family_id);

alter table services enable row level security;
alter table services force row level security;

create policy "services_all_own_company" on services
  for all
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- documents — the Company Files hero table.
-- ---------------------------------------------------------------------------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  family_id uuid references families(id) on delete set null,
  file_name text not null,
  file_type text not null check (file_type in ('pdf', 'image')),
  storage_path text,

  document_type text
    check (document_type in (
      'Death Certificate', 'Service Contract', 'Intake Form',
      'Invoice', 'Permit', 'Other'
    )),
  deceased_name text,
  family_name text,
  phone_numbers text[],
  service_date date,
  address text,
  notes text,

  extraction_status text not null default 'pending'
    check (extraction_status in ('pending', 'complete', 'failed', 'skipped_no_api_key')),
  extraction_raw jsonb,

  uploaded_at timestamptz not null default now()
);

create index if not exists documents_company_id_idx on documents(company_id);
create index if not exists documents_family_id_idx on documents(family_id);
create index if not exists documents_document_type_idx on documents(document_type);

alter table documents enable row level security;
alter table documents force row level security;

create policy "documents_all_own_company" on documents
  for all
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  amount_cents integer not null,
  status text not null default 'outstanding'
    check (status in ('paid', 'outstanding', 'overdue')),
  due_date date,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists invoices_company_id_idx on invoices(company_id);

alter table invoices enable row level security;
alter table invoices force row level security;

create policy "invoices_all_own_company" on invoices
  for all
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  direction text not null check (direction in ('inbound', 'outbound')),
  preview text,
  body text,
  unread boolean not null default true,
  occurred_at timestamptz not null default now()
);

create index if not exists messages_company_id_idx on messages(company_id);

alter table messages enable row level security;
alter table messages force row level security;

create policy "messages_all_own_company" on messages
  for all
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  family_id uuid references families(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  text text,
  source text not null default 'google',
  responded boolean not null default false,
  occurred_at timestamptz not null default now()
);

create index if not exists reviews_company_id_idx on reviews(company_id);

alter table reviews enable row level security;
alter table reviews force row level security;

create policy "reviews_all_own_company" on reviews
  for all
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

-- ---------------------------------------------------------------------------
-- Storage — a private "documents" bucket, objects keyed as
-- "{company_id}/{uuid}-{filename}" so storage RLS can scope by the same
-- current_company_id() used everywhere else. Table RLS and Storage RLS are
-- separate policy surfaces in Supabase — this section is easy to forget.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_bucket_select_own_company" on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "documents_bucket_insert_own_company" on storage.objects
  for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "documents_bucket_delete_own_company" on storage.objects
  for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );
