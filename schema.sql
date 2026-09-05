-- DOBERTO VCF — Schema Supabase production
-- Kopye/kole sa nan SQL Editor Supabase epi Run li yon sèl fwa.

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  dial_code text not null,
  country_name text,
  phone text not null,
  full_number text not null,
  icon text,
  created_at timestamptz not null default now()
);

-- Si tab la te deja egziste sou yon ansyen vèsyon, sa ajoute kolòn yo san li pa efase done.
alter table registrations add column if not exists email text;
alter table registrations add column if not exists icon text;

create unique index if not exists registrations_full_number_key
  on registrations (full_number);
create index if not exists registrations_name_idx
  on registrations (lower(name));
create index if not exists registrations_created_at_idx
  on registrations (created_at desc);
create index if not exists registrations_country_name_idx
  on registrations (country_name);

-- Eta kanpay notifikasyon/email unlock la.
create table if not exists notification_campaigns (
  campaign_key text primary key,
  status text not null default 'pending',
  attempts integer not null default 0,
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

alter table registrations enable row level security;
alter table notification_campaigns enable row level security;

-- Pa ajoute public policies: backend service-role la sèlman dwe gen aksè dirèk.
