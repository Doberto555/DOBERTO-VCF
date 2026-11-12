-- Dezyèm nimewo opsyonèl pou manm yo (dashboard -> Mon Profil).
-- Kopye/kole bloke sa a nan SQL Editor Supabase epi Run li. Li san danje pou kouri plizyè fwa.
alter table registrations add column if not exists dial_code2 text;
alter table registrations add column if not exists phone2 text;
alter table registrations add column if not exists full_number2 text;
create unique index if not exists registrations_full_number2_key
  on registrations (full_number2) where full_number2 is not null;
