# NALAR-SPEC — SUARA WARGA · PILAR 2
### NALAR — *Navigasi, Analisis, Laporan, Aktivitas & Rekomendasi*
### "Dari Saksi, Lahir Aksi."
Versi 1.0 · Induk: `00-ULTIMATE-PROMPT.md` (Bagian 0 = hukum tertinggi) · Pasangan: Pilar 1 SAKSI (`02-SRS.md`)

> **Baca dulu:** NALAR adalah pilar KEDUA dari produk SUARA WARGA. Pilar 1 (SAKSI) menjamin data **lahir jujur**; NALAR mengubah data jujur itu menjadi **keputusan cepat** bagi manajemen koperasi. NALAR **tidak pernah menulis ke ledger uang** — ia hanya membaca (read-only consumer) melalui API agent-native SAKSI.

---

## 1. Kenapa NALAR Ada (Problem → Solusi)

SAKSI menutup lubang *integritas* (data tidak bisa dipalsukan). Tapi Koperasi Desa Merah Putih (KDMP) bukan cuma lembaga simpan-pinjam — mayoritas menjalankan **gerai ritel/sembako** (mirip Alfamart/Indomaret skala desa). Di sini muncul dua kebutuhan baru yang tidak dijawab SAKSI sendirian:

1. **Manajemen buta arah penjualan.** Manager/pengurus koperasi tidak tahu produk apa laku, sales mana yang perform, kapan jam ramai, promo mana yang efektif. Keputusan diambil dengan feeling → stok mati, omzet stagnan, program "tebus murah/diskon" gagal.
2. **Direktur/pengurus senior gaptek** tapi harus mengawasi & mengambil keputusan strategis. Mereka butuh jawaban dalam bahasa manusia, bukan tabel mentah.

**NALAR menjawabnya dengan satu pipa data-ke-keputusan tiga tingkat:**

```
Data teratestasi SAKSI (penjualan, kehadiran, aktivitas)
        │   (read-only via API agent-native)
        ▼
[ NALAR ] ── Manager ── Dashboard interaktif (Navigasi + Analisis + Laporan)
        └── Direktur ── AI Chatbot prompt-terbatas (RAG atas rekap manager)
```

**Akronim NALAR = fungsi produknya:**
- **N**avigasi — dashboard interaktif dengan filter dropdown (per sales, per kategori, per periode).
- **A**nalisis — sales insight: siapa perform, produk top, efektivitas promo.
- **L**aporan — rekap & laporan audit harian, otomatis per 3–5 hari.
- **A**ktivitas — kehadiran + aktivitas karyawan + review pelanggan.
- **R**ekomendasi — rekomendasi produk (top-tier) & jadwal piket prime-time.

---

## 2. Aktor & Tiga Tingkat Peran

| Tingkat | Aktor | Permukaan NALAR | Kebutuhan |
|---|---|---|---|
| **Customer / Sales** | Pelanggan gerai · Karyawan sales (6 per toko, 3 shift pagi + 3 shift malam) | Kasir SAKSI (POS) — sumber data | Transaksi jual jujur, struk terverifikasi, aktivitas tercatat |
| **Store Manager / Manager Koperasi** | Manajer gerai | **Dashboard interaktif** | Lihat performa real-time, ambil keputusan cepat, susun jadwal piket, atur promo |
| **Direktur / Pengurus Koperasi** | Direktur/Ketua/Pengawas senior | **AI Chatbot prompt-terbatas** | Jawaban & rekap instan tanpa baca tabel; "amaze factor" |

**Aturan peran (locked):** dashboard TIDAK ditampilkan langsung ke direktur — direktur mengakses lewat chatbot (prompt terbatas). Manager melihat dashboard penuh. Sales/customer tidak melihat NALAR sama sekali (mereka objek data, dijaga SAKSI).

---

## 3. Fitur MUST — Acceptance Criteria

### N-FR-1 — Dashboard Penjualan Interaktif (Store Manager)
Kartu ringkas + tabel + chart ringan. **Filter dropdown:** nama sales · kategori produk · rentang tanggal · shift.
Komponen wajib:
- **Total penjualan** (nilai & jumlah transaksi) — periode & per sales.
- **Total kehadiran** karyawan (hadir/izin/alpa) + jam kerja.
- **Aktivitas** karyawan (transaksi dilayani, review pelanggan, promo ditawarkan).
- **Laporan audit harian** (ringkasan transaksi + anomali SAKSI hari itu).
- **Detail barang terjual** (per SKU: qty, nilai, margin).

**Acceptance:** pilih 1 nama sales di dropdown ⇒ seluruh kartu & chart ter-filter <1 dtk (data lokal); angka total per sales = Σ transaksi teratestasi SAKSI milik sales itu (rekon dengan ledger).

### N-FR-2 — Sales Insight / Analisis Performa
Menghitung, per sales & per kategori:
- **Konversi promo** — contoh tebus murah: dari `N_dilayani` customer (belanja > ambang, mis. Rp 50.000), `N_tergiur` menerima tawaran, `N_konversi` membeli > k produk. Rasio konversi = `N_konversi / N_dilayani`.
- **Top performer per kategori** (minuman, makanan, perawatan tubuh, dst.) — ranking sales berdasar nilai jual kategori.
- **Rekomendasi produk** — produk top-tier (paling laku) untuk didorong/di-restock.

**Acceptance:** untuk data seed, sistem menampilkan "Sales A: jago Tebus Murah — konversi 51% (180/350)"; ranking 4 top performer per kategori muncul; daftar rekomendasi produk = 10 SKU teratas by qty×margin.

### N-FR-3 — Rekomendasi Jadwal Piket (Prime-Time)
Dari pola jam transaksi + performa sales per kategori → usulkan komposisi piket per shift agar **stok tebus murah/promo habis pada jam ramai**.

**Acceptance:** sistem menandai 2 jam prime-time (puncak transaksi) & mengusulkan menempatkan top-performer kategori terkait pada shift tersebut; usulan bisa diterima/ubah manager (HITL).

### N-FR-4 — Laporan Audit Harian & Rekap Berkala
Rekap otomatis per **3–5 hari** (konfigurabel): omzet, transaksi, kehadiran, anomali. Bisa diunduh (PDF/CSV).

**Acceptance:** 1 klik "Rekap" ⇒ dokumen terbentuk ≤5 dtk; angka rekon dengan dashboard.

### N-FR-5 — AI Chatbot Direktur (Prompt-Terbatas, RAG)
Antarmuka chat sederhana (rasa Gemini/Claude/ChatGPT) untuk direktur, TAPI **prompt terbatas** — daftar tombol/quick-prompt yang sudah dikurasi (bukan free-text bebas tak terbatas), mis.:
- "Berikan laporan penjualan terbaru" (connect ke **waktu lokal** perangkat → tarik rekap terkini).
- "Sales terbaik minggu ini?" · "Produk apa yang perlu di-restock?" · "Ringkas kehadiran karyawan."

Jawaban = narasi bahasa Indonesia + (opsional) **file rekap** yang bisa diunduh. Sumber jawaban = **RAG atas rekap yang digenerate manager** (N-FR-4) + agregat dashboard. TIDAK mengarang angka (grounded ke data).

**Acceptance:** klik quick-prompt "laporan penjualan terbaru" ⇒ chatbot balas rekap periode berjalan (angka cocok dashboard) + tautan unduh; saat offline/tanpa LLM ⇒ fallback template deterministik tetap menjawab dengan angka benar.

### N-FR-6 — Landing Page
Halaman publik `hackathon.plusthe.site`: value proposition dua pilar (SAKSI + NALAR), CTA masuk dashboard (login), ringkas fitur, footer disclosure. **Pintu masuk sistem = login dashboard.**

**Acceptance:** landing live di subdomain; tombol "Masuk" → halaman login role-based.

### N-FR-7 — Login & RBAC Ritel
Login dashboard membedakan peran: sales · store manager · direktur (+ peran SAKSI: kasir/pengawas/anggota). Lihat §6.

---

## 4. SHOULD / COULD / WON'T

**SHOULD (pilot):** notifikasi target penjualan; leaderboard sales; export terjadwal; heatmap jam-ramai; integrasi review pelanggan (rating bintang di struk digital).
**COULD (roadmap):** prediksi demand (forecasting), auto-reorder stok, chatbot free-text penuh dengan guardrail, integrasi supplier, program loyalti anggota.
**WON'T (MVP):** payment gateway, marketplace publik, ML training kustom, mobile native app.

---

## 5. Model Data NALAR (koleksi RxDB / CouchDB — read model)

> NALAR menambah koleksi **operasional** di samping ledger SAKSI. Transaksi ritel (`sale`) adalah entri ledger SAKSI ber-tipe ritel (teratestasi), jadi anti scan-ganda. Sisanya data operasional biasa.

- **products** {id, koperasi_id, sku, nama, kategori[minuman|makanan|perawatan|rumah|lain], harga, hpp, stok, promo_flag, created_at}
- **sales_tx** *(view/proyeksi dari ledger SAKSI type=`jual`)* {tx_id, koperasi_id, gerai_id, sales_id, ts, items[{sku, qty, harga, diskon, promo?}], total, metode_bayar, member_id?, **tx_hash**, attest_mode}
- **employees** {id, koperasi_id, gerai_id, nama, peran[sales|manager|direktur], kategori_unggulan[], shift_default}
- **attendance** {id, employee_id, tanggal, shift, status[hadir|izin|alpa], jam_masuk, jam_keluar}
- **activities** {id, employee_id, ts, jenis[transaksi|promo_ditawarkan|review_pelanggan|restock], ref_tx_id?, nilai?}
- **reviews** {id, member_id?, sales_id, tx_id, rating(1–5), komentar?, ts}
- **promos** {id, koperasi_id, jenis[tebus_murah|diskon_akhir_pekan|bundling], syarat{min_belanja, produk[]}, periode, aktif}
- **nalar_recaps** {id, koperasi_id, periode{from,to}, dibuat_oleh, ringkasan{omzet, transaksi, kehadiran, top_sales[], top_produk[], anomali[]}, dibuat_at} *(sumber RAG chatbot)*
- **nalar_insights** {id, koperasi_id, tipe[konversi_promo|top_performer|rekomendasi_produk|jadwal_piket], payload, dihitung_at}

**Aturan:** `sales_tx` bersumber dari ledger SAKSI (append-only, teratestasi) — NALAR tidak boleh membuat/ubah transaksi uang. `nalar_recaps` & `nalar_insights` = **derivasi** (boleh dihitung ulang kapan saja), bukan kebenaran primer.

---

## 6. RBAC NALAR (gabung dengan RBAC SAKSI di `02-SRS.md §9`)

| Aksi | Customer/Anggota | Sales | Store Manager | Direktur | Pengawas |
|---|---|---|---|---|---|
| Transaksi jual (POS, teratestasi SAKSI) | disaksikan | ✅ input | ✅ | — | — |
| Lihat dashboard penjualan penuh | — | performa diri (SHOULD) | ✅ | — | lihat |
| Filter/insight/rekomendasi | — | — | ✅ | — | lihat |
| Buat/unduh rekap & audit harian | — | — | ✅ | via chatbot | ✅ |
| AI chatbot prompt-terbatas | — | — | opsional | ✅ | opsional |
| Konfigurasi promo & target | — | — | ✅ | ✅ | — |
| Verifikasi struk (anti scan-ganda) | ✅ publik (tanpa login) | | | | ✅ |

---

## 7. Arsitektur & Integrasi dengan SAKSI

- **NALAR = konsumen API agent-native SAKSI** (`02-SRS.md §8.3`). Tambahan endpoint (Fastify `/nalar/v1/*`, ber-audit, read-mostly):
  - `GET sales?from&to&sales_id&kategori` — proyeksi penjualan teratestasi.
  - `GET insights/:tipe` — konversi promo · top performer · rekomendasi produk · jadwal piket.
  - `GET attendance?from&to` · `GET activities?employee_id`.
  - `POST recaps/generate {periode}` → simpan `nalar_recaps` (dipakai manager & jadi sumber RAG).
  - `POST assistant/ask {quick_prompt_id, tz}` → jawaban chatbot direktur (grounded RAG). `tz`/waktu lokal dikirim klien.
- **AI chatbot:** retrieval atas `nalar_recaps` + agregat → susun jawaban. **Online:** LLM merangkai narasi (Bahasa Indonesia). **Offline/tanpa LLM:** template deterministik mengisi angka — **wajib tetap menjawab** (graceful degradation, prinsip yang sama dgn Agent PENGAWAS SAKSI).
- **HITL:** insight & rekomendasi = **usulan**; manager/direktur yang memutuskan. Semua aksi keputusan masuk audit log.
- **Anti-halusinasi:** chatbot hanya boleh menyebut angka yang ada di `nalar_recaps`/agregat; jika data tak ada → jawab "belum ada data untuk periode itu", jangan mengarang.

**Benang merah SAKSI→NALAR (kalimat pitch):** *"Karena setiap penjualan disaksikan (tak bisa scan-ganda atau sembunyikan diskon), angka di dashboard NALAR itu jujur. Insight dari data kotor hanya menyesatkan — makanya NALAR berdiri di atas SAKSI."*

---

## 8. Tech Stack NALAR (delta dari Bagian 0.6)

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Dashboard UI | React + Tailwind (routes `/nalar/*`) + **Chart.js** (chart ringan) | Chart HANYA di permukaan manager/direktur (HP/laptop), BUKAN app anggota RAM-1GB |
| Filter/agregasi | Query RxDB lokal + endpoint agregat Fastify | Filter dropdown jalan instan dari data lokal |
| AI chatbot | Endpoint `/nalar/v1/assistant` — RAG atas `nalar_recaps`; LLM opsional | Prompt terbatas (daftar quick-prompt terkurasi); fallback template |
| Landing page | Static (React/Vite build) di root subdomain | `hackathon.plusthe.site` |
| Deploy | docker-compose bareng SAKSI (1 VPS) atau FE Vercel + BE VPS | Satu domain, path/subrole berbeda |

---

## 9. User Flow NALAR

### NUF-1 — Manager Ambil Keputusan Cepat
1. Login (peran: store manager) → `/nalar/dashboard`.
2. Pilih dropdown nama sales "Sales A" + kategori "minuman" + periode "minggu ini".
3. Dashboard filter: total penjualan, konversi tebus murah, ranking kategori, detail SKU.
4. Buka panel **Rekomendasi** → sistem usul jadwal piket prime-time → manager terima/ubah.
**Uji:** filter <1 dtk; angka rekon ledger SAKSI.

### NUF-2 — Rekap Berkala Otomatis
1. Sistem (atau manager) generate rekap per 3–5 hari → `nalar_recaps`.
2. Manager unduh PDF/CSV.
**Uji:** angka rekap = dashboard; file terbentuk ≤5 dtk.

### NUF-3 — Direktur Tanya AI Chatbot (Amaze Moment)
1. Login (peran: direktur) → `/nalar/asisten` (chat).
2. Klik quick-prompt "Berikan laporan penjualan terbaru" → klien kirim waktu lokal.
3. Chatbot tarik rekap terkini (RAG) → balas narasi + tautan unduh file.
**Uji:** angka cocok dashboard; offline ⇒ fallback template tetap benar; tak ada angka karangan.

---

## 10. Acceptance Test Wajib NALAR (gerbang selesai)
1. **Rekonsiliasi:** total penjualan dashboard = Σ ledger SAKSI type jual (per sales & total). Nol selisih.
2. **Filter:** ganti dropdown sales/kategori/periode ⇒ semua widget konsisten & <1 dtk.
3. **Insight benar:** konversi promo, top performer, rekomendasi produk sesuai data seed (angka bisa diverifikasi manual).
4. **Chatbot grounded:** jawaban = angka dari rekap; skenario data kosong ⇒ menolak mengarang; offline ⇒ fallback jalan.
5. **RBAC:** direktur tak bisa buka dashboard mentah; sales tak bisa lihat data sales lain; customer nol akses NALAR.
6. **Anti scan-ganda (jembatan SAKSI):** simulasi kasir scan 2× untuk 1 produk / sembunyikan diskon ⇒ struk terverifikasi menandai TIDAK COCOK; transaksi tak masuk data bersih NALAR.

---

## 11. Data Seed NALAR (untuk demo)
1 koperasi "KDMP Bentangan", 1 gerai, **6 sales** (3 shift pagi + 3 malam), **1 store manager**, **1 direktur**; ~40 SKU lintas 4 kategori; **±350 transaksi jual** teratestasi selama ~2 minggu dengan pola jam-ramai jelas; data kehadiran & aktivitas; 2 promo aktif (tebus murah > Rp 50.000; diskon akhir pekan). Seed harus membuat "Sales A jago tebus murah (konversi ~51%)" muncul sebagai insight nyata di dashboard.

---

## 12. Akun Uji Juri (NALAR — lengkapi SAKSI di `00 §Stage 2`)
- `manager.demo / 444444` (store manager — dashboard penuh)
- `direktur.demo / 555555` (direktur — AI chatbot)
- `sales.demo / 666666` (sales — POS + performa diri)

> Digabung dengan akun SAKSI (kasir/anggota/pengawas) → satu tabel kredensial di kolom submission TOR.
