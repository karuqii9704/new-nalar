# WALKTHROUGH — NALAR (Navigasi · Aktivitas · Laporan · Analisa · Rekomendasi)

Standalone microsite untuk **Hackathon Kementerian Koperasi 2026 — elaborasi Tema 1 · 2 · 3** (berakar di Tema 1: Peningkatan Usaha Koperasi Melalui Teknologi Digital).
Live target: **hackathon.plusthe.site** · Stack: Next.js 16 (App Router) + Tailwind v4 + Supabase + Postgres (`pg`) + Gemini (opsional).

> **NALAR** = **N**avigasi · **A**ktivitas · **L**aporan · **A**nalisa · **R**ekomendasi — satu sistem yang mengubah data koperasi jadi keputusan. Semuanya berdiri di atas satu fondasi: fitur **SAKSI** (integritas data — setiap transaksi lahir jujur, terkunci rantai hash, struk terverifikasi).
> *"Setiap Rupiah Ada Saksinya, Setiap Keputusan Ada Dasarnya."*

---

## 1. Arsitektur

App berdiri sendiri (di-ekstrak dari monorepo `plus`). Seluruh situs = microsite hackathon.

Diagram Mermaid untuk arsitektur, data flow, dan user flow tersedia di **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

```
Browser ── hackathon.plusthe.site/*          (URL bersih)
   │
   ▼  src/proxy.ts  (rewrite semua path → /hackathon/*)
   │
   ├─ /            → landing (NALAR: 5 kemampuan + fondasi SAKSI, elaborasi Tema 1·2·3)
   ├─ /login       → RBAC 3 akun juri (server action cookie)
   ├─ /dashboard   → NALAR Gerai (manager/sales)
   ├─ /asisten     → AI chatbot direktur (prompt-terbatas, grounded)
   ├─ /kasir       → SAKSI POS (buat transaksi teratestasi)
   ├─ /pelanggan   → app customer (struk digital, ulasan, loyalti)
   ├─ /verifikasi  → cek struk publik ASLI / TIDAK COCOK
   └─ /nasional    → NALAR Nasional (BI data koperasi ASLI)
```

- **Root layout** (`src/app/layout.tsx`) = pass-through; `<html>/<body>` + design token ada di `src/app/hackathon/layout.tsx`.
- **Middleware** me-*rewrite* (bukan redirect) setiap path ke `/hackathon/*` → URL bar tetap bersih (`/dashboard`, `/nasional`, dst).
- **Charts** = SVG murni (`_components/Charts.tsx`) — nol dependency chart eksternal; semua interaktif (tooltip + hover + klik-untuk-filter).

## 2. Dua lapisan data

### a) NALAR Gerai — operasional (seed + Supabase live)
- **Seed deterministik** (`src/lib/hackathon/seed.ts`): 1 koperasi (KDMP Bentangan), 6 sales (3 shift pagi + 3 malam), 40 SKU, ~600 transaksi teratestasi (rantai hash FNV-1a), kehadiran, 2 promo. PRNG tetap → angka stabil & bisa diverifikasi.
- **Agregasi murni** (`analytics.ts`): KPI, per-sales, kategori, jam-ramai, insight (konversi tebus murah, top performer, rekomendasi produk/piket/restock), skor kesehatan, prediksi omzet, verifikasi struk.
- **Live layer (Supabase)** (`store.ts` + `db`-service-role): transaksi POS baru & ulasan customer ditulis ke tabel `nalar_sales` / `nalar_reviews`, lalu di-*merge* di atas seed (`allLedger()`, `reviewSummary()`). Dashboard **poll 8 detik** → semua peran melihat perubahan real-time. Degrade graceful bila tabel/env absen.

### b) NALAR Nasional — data ASLI panitia (read-only)
- **`db.ts`**: pool `pg` read-only (SSL wajib, `default_transaction_read_only=on`, statement_timeout 12s, pool kecil). Kredensial via env `HACK_DB_*` (tidak pernah di repo).
- **`national.ts`**: `getNationalBundle()` menarik **satu dataset per-koperasi (1.026 baris)** + extras (pertumbuhan anggota, produk terlaris, jabatan karyawan, infrastruktur gerai), di-*cache* 10 menit. Semua filter/agregasi dihitung **di peramban** → DB bersama tak dihajar tiap klik.
- **Halaman `/nasional`**: KPI (koperasi/anggota/gerai/omzet/simpanan), skor kesehatan ekosistem, status gerai & keanggotaan (donut), **peta sebaran koperasi** (Leaflet + OpenStreetMap, heat layer, fallback SVG scatter), rekomendasi AI dari gap nyata, sebaran provinsi, sektor KBLI, top koperasi, prediksi anggota, produk terlaris. Jika DB panitia belum siap, snapshot nasional bawaan tetap ditampilkan. **Cross-filter** (provinsi/sektor/status) + popup + klik-untuk-filter.

## 3. Empat peran (RBAC) — semua interaktif & responsif

| Peran | Halaman | Interaktivitas |
|---|---|---|
| **Store Manager** | `/dashboard` | Filter dropdown sales/kategori/periode/shift · **klik bar leaderboard & donut kategori untuk filter** · tooltip · unduh rekap CSV · live badge |
| **Direktur** | `/asisten` | Quick-prompt (grounded, anti-ngarang, Gemini + fallback) · **snapshot hidup** (omzet/transaksi/kesehatan) · unduh file rekap |
| **Sales** | `/dashboard` (diri) + `/kasir` | Performa sendiri · **POS** input transaksi teratestasi |
| **Customer** | `/pelanggan` + `/pelanggan/struk/[id]` | Rating bintang ★ · **TTS 🔊** · **progress tier** · **filter struk** (Semua/Tebus Murah) · struk digital + verifikasi |
| Publik | `/verifikasi` | Cek struk **ASLI/TIDAK COCOK** + **Simulasi Orang Dalam** (anti-fraud) |

**Akun demo juri:** `manager.demo/444444` · `direktur.demo/555555` · `sales.demo/666666`.

## 4. Environment Variables (set di Netlify)

| Var | Untuk | Wajib |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | ya (live layer) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server write/read | ya (live layer) |
| `HACK_DB_HOST` `HACK_DB_PORT` `HACK_DB_NAME` `HACK_DB_USER` `HACK_DB_PASSWORD` `HACK_DB_SSL` | DB panitia (NALAR Nasional) | ya (halaman /nasional) |
| `NEXT_PUBLIC_MAPS_KEY` atau `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Konfigurasi legacy; peta saat ini memakai OpenStreetMap | tidak |
| `GEMINI_API_KEY` | Narasi AI chatbot | opsional (ada fallback deterministik) |

Tanpa env → fitur terkait **degrade dengan anggun**, app tetap jalan.

### Keamanan konfigurasi

- Simpan nilai asli hanya di `.env.local` (lokal) atau environment variables platform deploy; jangan pernah commit file tersebut.
- Database panitia dipakai **read-only**. Aplikasi memeriksa koneksi dan metadata tabel saja, memakai SSL, timeout, pool kecil, dan cache 10 menit.
- `GEMINI_API_KEY` harus tetap server-side. Jika key tidak ada atau request gagal, asisten memakai respons deterministik.
- Peta nasional saat ini memakai OpenStreetMap tanpa key browser; tautan Google Maps hanya dibuka dari koordinat pada halaman detail Kopdes.
- Secret yang pernah dibagikan melalui chat harus dirotasi sebelum production.

## 5. Setup Supabase (loop customer/POS)

Jalankan sekali di Supabase SQL editor:

```sql
create table if not exists public.nalar_sales (
  id uuid primary key default gen_random_uuid(),
  tx_id text unique not null, tgl date not null, jam int not null,
  sales_id text not null, items jsonb not null default '[]'::jsonb,
  total numeric not null, tebus_murah boolean not null default false,
  tx_hash text not null, prev_hash text not null, seq int not null,
  created_at timestamptz not null default now());
create index if not exists nalar_sales_seq_idx on public.nalar_sales (seq);

create table if not exists public.nalar_reviews (
  id uuid primary key default gen_random_uuid(),
  tx_id text not null, sales_id text not null,
  rating int not null check (rating between 1 and 5),
  komentar text, created_at timestamptz not null default now());
create index if not exists nalar_reviews_sales_idx on public.nalar_reviews (sales_id);

alter table public.nalar_sales   enable row level security;
alter table public.nalar_reviews enable row level security;
-- No policies: only the service-role key (server) may read/write.
```

## 6. Jalankan lokal

```bash
npm install
# buat .env.local berisi var di §4
npm run dev        # http://localhost:3000  → landing
npm run build && npm start
npm test           # 6 tes acceptance NALAR
```

## 7. Deploy (Netlify)

1. Push repo ke GitHub.
2. Netlify → **Add new site → Import an existing project** → pilih repo (auto-deteksi Next via `netlify.toml` + `@netlify/plugin-nextjs`).
3. **Environment variables** → isi §4 → Redeploy.
4. **Domain management → Add domain** `hackathon.plusthe.site` → ikuti target DNS yang Netlify berikan (CNAME).
5. Di DNS `plusthe.site`: arahkan record `hackathon` ke target Netlify.

## 8. Alur demo juri (setelah Supabase aktif)

1. `sales.demo` → **/kasir** → keranjang > Rp 50.000 → **Bayar** → struk terbit.
2. **/dashboard** → Total Penjualan & leaderboard **nambah** (poll 8 dtk).
3. `direktur.demo` → **/asisten** → "laporan penjualan terbaru" → angka **ikut update** + snapshot hidup.
4. **/pelanggan** → buka struk → **beri ★** → dashboard "Rating Pelanggan" **+1**.
5. **/nasional** → mainkan filter provinsi/sektor + peta → monitoring 1.026 koperasi nyata.

## 9. Gerbang mutu
- `tsc --noEmit` clean · `next build` hijau · **vitest 24 tes** — acceptance (rekonsiliasi 0 selisih, tebus murah 51% 180/350, verifikasi struk), evaluasi model (backtest prediksi MAPE 14%, SAKSI F1 1.0, classifier promo AUC 0.843), dan degradasi (semua env kosong → fallback aman).
- Metrik model bisa direproduksi: `npx vitest run src/lib/hackathon/model-eval.test.ts --disable-console-intercept` dan `promo-model.test.ts`.
- Semua kredensial via env — **0 secret di repo**.

---

## Cakupan tiga tema (lintas-tema, berakar di Tema 1)
Penanda: **✓** sudah berjalan di demo · **○** ekstensi terpetakan (roadmap).

### Tema 1 — Peningkatan Usaha Koperasi Melalui Teknologi Digital · 6/6 ✓
1. ✓ **Business Intelligence Dashboard** → /dashboard + /nasional
2. ✓ **AI Business Recommendation** → rekomendasi produk/piket/restock + chatbot
3. ✓ **Monitoring Kesehatan Koperasi** → skor kesehatan ekosistem (/nasional)
4. ✓ **Predictive Analytics** → prediksi omzet musiman (MAPE 14%) & pertumbuhan anggota
5. ✓ **Digitalisasi Operasional** → SAKSI POS + struk terverifikasi
6. ✓ **Smart Decision Support System** → AI chatbot direktur (grounded)

### Tema 2 — Optimalisasi Potensi Desa Melalui Koperasi · 3/5 ✓
1. ✓ **Smart Village/Koperasi Analytics** → monitoring 1.026 koperasi per provinsi & sektor KBLI (/nasional)
2. ✓ **Village Potential Mapping** → peta sebaran + status transaksi per wilayah (OpenStreetMap)
3. ✓ **AI Commodity Recommendation** → produk terlaris nasional + rekomendasi
4. ○ **Marketplace & Business Matching** → roadmap: pertemukan koperasi ↔ buyer/offtaker
5. ○ **Supply Chain Monitoring** → roadmap: rantai pasok komoditas desa

### Tema 3 — Peningkatan Keterlibatan Masyarakat dalam Berkoperasi · 4/6 ✓
1. ✓ **Loyalty & Reward System** → app pelanggan: poin, tier Perunggu→Perak→Emas, total hemat
2. ✓ **Super App Anggota Koperasi** → struk digital, promo, loyalti, cek keaslian (/pelanggan)
3. ✓ **Community Engagement & Transparansi** → "anggota jadi SAKSI": verifikasi struk sendiri
4. ✓ **Gamifikasi Aktivitas (ringan)** → progres tier & lencana Tebus Murah
5. ○ **Digital Voting & e-RAT** → roadmap: RAT digital anggota
6. ○ **AI Member Assistant** → roadmap: asisten khusus anggota
