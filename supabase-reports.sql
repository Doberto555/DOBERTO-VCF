-- Siyalman (signalements): moun ka siyale yon manm oswa yon pwoblèm.
-- Kopye/kole bloke sa a nan SQL Editor Supabase epi Run li yon sèl fwa.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reason text not null,
  target text,
  details text not null,
  contact text,
  status text not null default 'new',
  reporter_user_id uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists reports_created_at_idx on reports (created_at desc);
create index if not exists reports_status_idx on reports (status);
alter table reports enable row level security;
