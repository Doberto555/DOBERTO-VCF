-- VIP via Tranzak: kolòn vip_until + tab vip_payments.
-- Kopye/kole bloke sa a nan SQL Editor Supabase epi Run li. Li san danje pou re-kouri
-- (if not exists): li pa touche done ki deja la.
alter table registrations add column if not exists vip_until timestamptz;

create table if not exists vip_payments (
  reference text primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'HTG',
  days integer not null,
  status text not null default 'pending',
  payment_url text,
  transaction_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create unique index if not exists vip_payments_transaction_id_key
  on vip_payments (transaction_id) where transaction_id is not null;
create index if not exists vip_payments_user_status_idx
  on vip_payments (user_id, status, created_at desc);
alter table vip_payments enable row level security;
