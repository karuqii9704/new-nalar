-- 0001_nalar_tables.sql
--
-- Creates the NALAR live-layer tables: new POS sales (nalar_sales) and
-- customer reviews (nalar_reviews). These are read/written exclusively by
-- the server-side Supabase service-role client (see src/lib/supabase.ts and
-- src/lib/hackathon/store.ts) and merged on top of the deterministic seed
-- data (src/lib/hackathon/seed.ts). No policies are defined, so RLS blocks
-- all access except via the service-role key.
--
-- Source of truth: WALKTHROUGH.md §5, verified column-for-column against
-- src/lib/hackathon/store.ts (rowToTx / insertSale / insertReview).
--
-- Apply with:
--   supabase db push
-- or paste this file's contents into the Supabase SQL editor and run once.

create table if not exists public.nalar_sales (
  id uuid primary key default gen_random_uuid(),
  tx_id text unique not null,
  tgl date not null,
  jam int not null,
  sales_id text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric not null,
  tebus_murah boolean not null default false,
  tx_hash text not null,
  prev_hash text not null,
  seq int not null,
  created_at timestamptz not null default now()
);
create index if not exists nalar_sales_seq_idx on public.nalar_sales (seq);

create table if not exists public.nalar_reviews (
  id uuid primary key default gen_random_uuid(),
  tx_id text not null,
  sales_id text not null,
  rating int not null check (rating between 1 and 5),
  komentar text,
  created_at timestamptz not null default now()
);
create index if not exists nalar_reviews_sales_idx on public.nalar_reviews (sales_id);

alter table public.nalar_sales   enable row level security;
alter table public.nalar_reviews enable row level security;
-- No policies: only the service-role key (server) may read/write.
