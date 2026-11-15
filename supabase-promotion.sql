-- Promotion (referal): lyen pataje, konte enskripsyon, demann rekonpans.
-- Kopye/kole bloke sa a nan SQL Editor Supabase epi Run li. Li san danje pou re-kouri (if not exists).

create table if not exists referral_codes (
  user_id uuid primary key references app_users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references app_users(id) on delete cascade,
  referred_user_id uuid not null unique references app_users(id) on delete cascade,
  status text not null default 'validated' check (status in ('pending', 'validated', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists referrals_referrer_idx on referrals (referrer_user_id, status, created_at desc);

create table if not exists referral_payout_info (
  user_id uuid primary key references app_users(id) on delete cascade,
  method text not null check (method in ('natcash', 'moncash', 'cashapp', 'paypal')),
  account text not null,
  updated_at timestamptz not null default now()
);

create table if not exists referral_payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  method text not null check (method in ('natcash', 'moncash', 'cashapp', 'paypal')),
  account text not null,
  amount_usd numeric not null,
  referrals_count integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  paid_at timestamptz
);
-- Yon moun pa ka gen de rekonpans aktif (an atant oswa deja peye) an menm tan.
create unique index if not exists referral_payouts_active_key
  on referral_payouts (user_id) where status in ('pending', 'paid');
create index if not exists referral_payouts_status_idx on referral_payouts (status, created_at desc);

alter table referral_codes enable row level security;
alter table referrals enable row level security;
alter table referral_payout_info enable row level security;
alter table referral_payouts enable row level security;
