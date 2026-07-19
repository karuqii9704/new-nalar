# NALAR — Navigasi · Aktivitas · Laporan · Analisa · Rekomendasi

Microsite **Hackathon Kementerian Koperasi 2026 — elaborasi Tema 1 · 2 · 3** (berakar di Tema 1: Peningkatan Usaha Koperasi Melalui Teknologi Digital; meluas ke Tema 2: Optimalisasi Potensi Desa & Tema 3: Keterlibatan Masyarakat).
Next.js 16 · Tailwind v4 · Supabase · Postgres · Gemini (opsional). Target: **hackathon.plusthe.site**.

**NALAR** = **N**avigasi · **A**ktivitas · **L**aporan · **A**nalisa · **R**ekomendasi — dashboard manager + AI chatbot direktur + monitoring koperasi nasional (data Kemenkop asli). Fondasinya: fitur **SAKSI** (integritas data — transaksi lahir jujur, terkunci rantai hash, struk terverifikasi).

## Quick start
```bash
npm install
# isi .env.local (lihat WALKTHROUGH.md §4)
npm run dev      # http://localhost:3000
npm test         # 24 tes (acceptance + eval model + degradasi)
```

## Akun demo
| Peran | Akun | PIN |
|---|---|---|
| Store Manager | `manager.demo` | `444444` |
| Direktur | `direktur.demo` | `555555` |
| Sales | `sales.demo` | `666666` |

Dokumentasi lengkap (arsitektur, env, deploy, alur demo): **[WALKTHROUGH.md](./WALKTHROUGH.md)**.

Diagram Mermaid untuk arsitektur, data flow, dan user flow: **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

Referensi teknis layer, route, kontrak data, dan resilience: **[APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md)**.
