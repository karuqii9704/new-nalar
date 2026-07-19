-- NALAR — Supabase setup for the live POS/kasir loop.
-- Jalankan sekali di Supabase → SQL Editor → New query → Run.
-- Kolom di sini PERSIS cocok dengan src/lib/hackathon/store.ts (insertSale/insertReview).

-- Transaksi POS teratestasi (ditulis oleh /api/hackathon/sale).
create table if not exists public.nalar_sales (
  id          uuid primary key default gen_random_uuid(),
  tx_id       text unique not null,
  tgl         date not null,
  jam         int  not null,
  sales_id    text not null,
  items       jsonb not null default '[]'::jsonb,
  total       numeric not null,
  tebus_murah boolean not null default false,
  tx_hash     text not null,
  prev_hash   text not null,
  seq         int  not null,
  created_at  timestamptz not null default now()
);
create index if not exists nalar_sales_seq_idx on public.nalar_sales (seq);

-- Ulasan/rating pelanggan (ditulis oleh app pelanggan).
create table if not exists public.nalar_reviews (
  id         uuid primary key default gen_random_uuid(),
  tx_id      text not null,
  sales_id   text not null,
  rating     int  not null check (rating between 1 and 5),
  komentar   text,
  created_at timestamptz not null default now()
);
create index if not exists nalar_reviews_sales_idx on public.nalar_reviews (sales_id);

-- RLS aktif TANPA policy → hanya secret/service-role key (server) yang boleh baca/tulis.
-- Publishable/anon key sengaja diblokir (integritas).
alter table public.nalar_sales   enable row level security;
alter table public.nalar_reviews enable row level security;
