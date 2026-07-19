# Laporan Proyek — NALAR

**Status:** prototipe siap demo  
**Produk:** NALAR — decision intelligence untuk gerai koperasi dan IKM  
**Versi laporan:** 19 Juli 2026

## 1. Ringkasan Eksekutif

NALAR membantu gerai koperasi dan IKM mengubah data operasional menjadi keputusan yang dapat segera dijalankan. Produk ini dirancang untuk menjawab keputusan harian yang paling berdampak: stok mana yang harus diamankan, promo mana yang perlu diteruskan, serta bagaimana menempatkan tim pada jam penjualan bernilai tinggi.

Berbeda dari dashboard biasa yang berhenti pada visualisasi, NALAR membentuk satu _decision loop_:

> **Data transaksi terverifikasi → rekomendasi yang dapat dijelaskan → keputusan manusia yang dapat dipertanggungjawabkan.**

NALAR menggunakan SAKSI sebagai fondasi integritas transaksi. Karena input penjualan, diskon, dan struk dapat diverifikasi, rekomendasi NALAR tidak berangkat dari data yang mudah dimanipulasi.

## 2. Masalah yang Diselesaikan

| Kondisi operasional | Dampak | Respons NALAR |
|---|---|---|
| Data transaksi atau diskon tidak dapat dipercaya | Analisis terlihat rapi, tetapi keputusan berisiko salah | SAKSI memberi jejak transaksi dan struk yang dapat diverifikasi |
| Manager harus menerjemahkan banyak tabel sendiri | Prioritas stok, promo, dan jadwal terlambat diambil | Dashboard menyatukan sinyal penjualan, stok, tim, dan promo |
| Direktur tidak memiliki waktu untuk membaca dashboard mentah | Keputusan strategis tertunda atau mengandalkan intuisi | Asisten Keputusan memberikan brief ringkas, grounded, dan dapat diunduh |

## 3. Unique Selling Point

### 3.1 Trusted Decision Loop

NALAR bukan chatbot generik dan bukan dashboard generik. Nilai utamanya terletak pada hubungan antara tiga lapisan berikut:

1. **Trusted input** — transaksi dan diskon dilandasi SAKSI, sehingga dapat ditelusuri dan diverifikasi.
2. **Decision engine** — analitik menerjemahkan data menjadi risiko, peluang, serta rekomendasi operasional yang spesifik.
3. **Human control** — sistem hanya mengusulkan; manager dan direktur tetap memutuskan, mengubah, atau menolak.

### 3.2 Manfaat per Stakeholder

| Stakeholder | Nilai yang diterima |
|---|---|
| Manager gerai | Prioritas stok, promo, jadwal, dan kinerja tim dalam satu ruang keputusan |
| Direktur/pemilik | Brief eksekutif yang menjawab kondisi, rekomendasi, alasan, dan tindak lanjut tanpa membuka tabel mentah |
| Sales | Indikator performa dan praktik terbaik yang dapat direplikasi pada jam ramai |
| Koperasi/IKM | Keputusan lebih dapat diaudit karena rekomendasi bertumpu pada data transaksi yang dapat diperiksa |

## 4. Kapabilitas Produk

### Dashboard manager

- KPI penjualan, transaksi, margin, kehadiran, aktivitas, dan rating pelanggan.
- Filter berdasarkan sales, kategori, periode, dan shift.
- Analisis produk, konversi promo, jam ramai, top performer, serta alert restock.
- Rekomendasi produk dan komposisi piket prime-time sebagai usulan yang dapat ditinjau manager.
- Rekap CSV untuk tindak lanjut operasional.

### Asisten Keputusan direktur

Asisten menggunakan quick prompt terkurasi, sehingga respons tetap berada dalam ruang data yang dapat dipertanggungjawabkan. Prompt yang tersedia mencakup:

- Prioritas keputusan hari ini.
- Laporan penjualan terbaru.
- Sales terbaik minggu ini.
- Produk yang perlu di-restock.
- Prediksi omzet minggu depan.
- Ringkasan kehadiran karyawan.
- Kesehatan koperasi.

Prompt **“Apa prioritas keputusan hari ini?”** menyatukan omzet terkini, sales teratas, risiko stok, kesehatan operasional, proyeksi, dan tindakan yang disarankan dalam satu brief eksekutif. Jawaban menyebutkan alasan, tetapi tetap menegaskan bahwa persetujuan akhir berada pada manajemen.

## 5. Prinsip AI dan Tata Kelola

- **Grounded:** angka di jawaban chatbot berasal dari agregasi transaksi dan rekap yang sama dengan dashboard.
- **Tidak mengarang:** bila tidak ada fakta, asisten menolak menjawab di luar daftar prompt yang disediakan.
- **Graceful degradation:** tanpa Gemini atau koneksi eksternal, respons template deterministik tetap tersedia dengan angka yang benar.
- **Human-in-the-loop:** AI memberi rekomendasi; manusia membuat keputusan.
- **Read-only atas uang:** NALAR tidak mengubah ledger transaksi; ia hanya mengonsumsi dan menurunkan insight dari data operasional.

## 6. Arsitektur Ringkas

```text
SAKSI POS / transaksi terverifikasi
                │
                ▼
  NALAR analytics engine (KPI, forecast, stock, promo, roster)
                │
      ┌─────────┴──────────┐
      ▼                    ▼
Dashboard Manager   Asisten Keputusan Direktur
      │                    │
      └──── rekomendasi yang dapat ditinjau ────┘
                           │
                           ▼
                   Keputusan manajemen
```

Stack yang digunakan: Next.js 16, React 19, TypeScript strict, Tailwind CSS, SVG chart kustom, Supabase untuk live layer opsional, Postgres read-only untuk data nasional, dan Gemini opsional untuk perangkaian narasi chatbot.

## 7. Status Teknis

| Area | Status |
|---|---|
| Unit/acceptance tests | 24/24 lulus |
| Production build | Lulus |
| GitHub | [karuqii9704/new-nalar](https://github.com/karuqii9704/new-nalar) |
| Vercel production | [new-nalar.vercel.app](https://new-nalar.vercel.app) |
| Fallback tanpa environment variable | Aktif untuk seed data dan chatbot deterministik |

## 8. Batasan Saat Ini

- Data operasional demo bersifat sintetis dan dipakai untuk memvalidasi alur produk.
- Persistensi transaksi lintas perangkat membutuhkan konfigurasi Supabase.
- Narasi Gemini bersifat opsional; tanpa API key sistem memakai template grounded.
- Rekomendasi belum otomatis mengeksekusi pembelian stok, perubahan jadwal, atau perubahan promo.

## 9. Tahap Implementasi Berikutnya

1. Konfigurasi Supabase dan Gemini di Vercel untuk mengaktifkan live layer serta narasi AI.
2. Tambahkan tombol persetujuan/penolakan rekomendasi dan audit log keputusan manager.
3. Tambahkan notifikasi risiko stok dan pergeseran performa promo.
4. Uji bersama gerai/IKM mitra untuk mengkalibrasi aturan rekomendasi dan metrik dampak.
5. Selaraskan pitch deck dan demo script dengan narasi **Trusted Decision Loop**.

