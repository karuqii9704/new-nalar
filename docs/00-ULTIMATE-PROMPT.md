# ULTIMATE PROMPT — SUARA WARGA (SAKSI × NALAR)
### "Setiap Rupiah Ada Saksinya, Setiap Keputusan Ada Dasarnya"
**Dokumen ini = satu-satunya sumber kebenaran (single source of truth).** Semua dokumen (PRD, SRS, NALAR-SPEC, Proposal, Pitchdeck) dan semua kode WAJIB tunduk pada Bagian 0. Jika ada konflik antar dokumen, Bagian 0 menang.

> **Arsitektur produk (v2): SATU produk, DUA pilar.**
> **Pilar 1 — SAKSI** = integritas (data lahir jujur; sisi warga/kasir; bottom-up).
> **Pilar 2 — NALAR** = kecerdasan (data jujur -> keputusan; sisi manajemen; top-down).
> NALAR berdiri **di atas** SAKSI: hanya data yang teratestasi yang layak dianalisis. Detail SAKSI di seluruh Bagian 0; detail NALAR di **Sec 0.12** + `07-NALAR-SPEC.md`.

---

## BAGIAN 0 — KEBENARAN TERKUNCI (LOCKED TRUTHS)

### 0.1 Identitas Produk
- **Nama produk:** SUARA WARGA
- **Dua pilar inovasi:**
  - **Pilar 1 — Protokol SAKSI** — *Sistem Atestasi Keuangan Saksi-ganda & Struk terverifikasi* (integritas; sisi warga/kasir). Tagline: "Setiap Rupiah Ada Saksinya."
  - **Pilar 2 — NALAR** — *Navigasi, Analisis, Laporan, Aktivitas & Rekomendasi* (kecerdasan keputusan; sisi manajemen). Tagline: "Dari Saksi, Lahir Aksi." Detail: Sec 0.12 + `07-NALAR-SPEC.md`.
- **Tagline gabungan:** "Setiap Rupiah Ada Saksinya, Setiap Keputusan Ada Dasarnya"
- **Pilar kompetisi:** Pilar 2 — Keterlibatan Masyarakat dalam Berkoperasi (Hackathon Kemenkop 2026)
- **Reframe Pilar 2 (kunci pitch):** Keterlibatan tertinggi anggota bukan sekadar *melihat* data (transparansi pasif) — melainkan **menjadi saksi** atas setiap pergerakan uang koperasinya (partisipasi aktif dalam integritas). Anggota = penjaga kebenaran koperasi.

### 0.2 Insight Akar Masalah (X-Factor)
> Kegagalan pembukuan dan terjadinya fraud di koperasi desa punya **akar yang sama**: pencatatan uang dilakukan oleh **satu tangan** (pengurus) yang sekaligus tidak kompeten menyusun laporan DAN punya konflik kepentingan. SIMKOPDES hanya merekam apa yang *diketik* pengurus — garbage in, garbage out. Solusi bukan menampilkan data yang sama secara lebih transparan, melainkan **mengubah cara data itu lahir.**

### 0.3 Mekanisme Inti (TIDAK BOLEH DIUBAH)
1. **Atestasi Saksi-Ganda:** setiap transaksi uang sensitif (setoran/penarikan simpanan, pencairan/angsuran pinjaman) TIDAK BISA dicatat sepihak. Wajib dikonfirmasi dua pihak di tempat, **offline, tanpa server**:
   - **Mode B — DEFAULT (semua anggota, dengan/tanpa smartphone):** anggota memasukkan PIN pribadi 6 digit di PIN-pad terisolasi perangkat petugas (seperti mesin EDC). Dijadikan jalur utama karena: nol ketergantungan kamera & kripto di HP anggota (aman untuk HP RAM 1GB / tanpa HP), ≤10 detik, jujur pada realitas Bu Sani. Lebih lemah secara kripto — dikompensasi struk fisik sebagai bukti out-of-band + sampling pengawas. Kejujuran soal ini WAJIB ditulis di threat model.
   - **Mode A — UPGRADE (opt-in, anggota ber-smartphone memadai):** QR handshake dua arah — perangkat petugas menampilkan QR payload transaksi → anggota scan & tanda tangan digital (kunci privat di perangkatnya) → QR balasan → petugas scan. Kriptografi penuh. Stream kamera dimatikan segera setelah scan.
2. **Hash Chain (BUKAN blockchain):** setiap transaksi = mata rantai. `tx_hash = SHA-256(prev_hash ‖ payload_hash ‖ sig_anggota ‖ sig_petugas)`. Rantai **per perangkat petugas** (menghindari konflik offline), dengan **jangkar master** per koperasi di server saat sync. Ubah/hapus satu entri = seluruh rantai sesudahnya patah = ketahuan.
3. **Struk Ganda (fisik + digital):** setiap transaksi menghasilkan struk berisi QR (tx_hash, prev_hash, jumlah, para pihak, posisi rantai). Struk fisik dicetak/di-print, struk digital masuk app anggota. **Ground truth koperasi tersebar di kantong ratusan warga** — server bisa diretas, kantong 300 warga tidak.
4. **Verifikasi terbuka:** siapa pun (anggota, pengawas, jaksa, juri) bisa scan struk apa pun → aplikasi menghitung ulang hash → VALID / TIDAK COCOK. **Tanpa login, jalan offline.**
5. **Dua konsekuensi satu mekanisme:**
   - **(a) Pembukuan menyusun dirinya sendiri:** data lahir bersih & teratestasi → Neraca + Laba/Rugi (SAK-EP ringkas) + SHU per anggota tergenerasi otomatis → bottleneck "koperasi tak bisa bikin laporan sebelum operasional penuh Maret 2026" larut.
   - **(b) Fraud tercegah struktural:** tidak ada aktor tunggal yang bisa memalsukan/menghapus catatan tanpa ketahuan → jejak forensik untuk Pengawas/PMO/Kejaksaan (selaras Jaga Desa). Kasus tipe ASM Temanggung (anggota fiktif untuk cairkan dana LPDB) mati: pencairan hanya sah jika anggota riil mengatestasi penerimaan = **proof-of-delivery dana publik**.

### 0.4 Anti-Blockchain (SENJATA PITCH — WAJIB DIPERTAHANKAN)
- **DILARANG** menambahkan blockchain, token, wallet, smart contract, consensus network dalam bentuk apa pun.
- Alasan (hafalkan untuk live defense): blockchain menyelesaikan masalah "banyak pihak saling tak percaya TANPA otoritas bersama". Koperasi desa PUNYA otoritas (Kemenkop, Pengawas, Kejaksaan) → alasan keberadaan blockchain runtuh, tersisa ongkosnya: butuh internet, boros daya di HP RAM 1–2GB, tak terawat di desa. Hash chain + tanda tangan digital memberi *tamper-evidence* yang sama dengan nol ongkos itu.
- Kalimat kunci: *"Semua orang menyodorkan blockchain untuk transparansi koperasi. Kami sengaja tidak — karena kami paham kapan blockchain justru merusak."*

### 0.5 Batas Lingkup (SCOPE FENCE)
- Atestasi saksi-ganda **WAJIB** untuk simpanan & pinjaman (lokasi 100% kasus fraud simpan-pinjam). **DIPERLUAS (v2):** kasir **gerai ritel** kini juga menerbitkan **struk terverifikasi SAKSI** untuk mencegah kecurangan titik-jual — scan-ganda (1 barang discan 2x), diskon/promo yang disembunyikan petugas, harga tak sesuai. Struk ritel = bukti out-of-band yang bisa diverifikasi pelanggan tanpa login. Konsekuensinya: **data penjualan lahir bersih -> jadi bahan bakar tepercaya bagi NALAR (Sec 0.12).** *(Mode B PIN penuh opsional untuk ritel demi kecepatan antre; minimal struk ber-hash + verifikasi publik wajib.)*
- **WON'T (MVP):** e-wallet/pembayaran digital, marketplace, integrasi core-banking Himbara, blockchain, aplikasi native store.
- e-RAT/voting = **roadmap** yang berjalan di rel yang sama (voting = atestasi keputusan pada chain yang sama) — disebut di pitch sebagai bukti ekstensibilitas protokol, TIDAK dibangun penuh di sprint.

### 0.6 Stack Teknis (TERKUNCI untuk kecepatan sprint 24–36 jam)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind, PWA (vite-plugin-pwa, service worker, installable, offline penuh).
- **Local DB:** RxDB di atas IndexedDB (Dexie storage) — local-first, append-only untuk ledger.
- **Kripto:** Web Crypto API bawaan browser — `crypto.subtle.digest` (SHA-256), ECDSA P-256 untuk tanda tangan perangkat. NOL library kripto eksternal.
- **Sync:** RxDB replication → CouchDB (server of record). Master data (profil) = Last-Write-Wins logical timestamp; ledger = append-only, TIDAK PERNAH LWW.
- **Backend tipis:** Node.js + Fastify — auth (PIN/JWT), re-verifikasi rantai server-side, generator laporan, **API agent-native**. PostgreSQL opsional fase pilot; MVP cukup CouchDB.
- **Deploy demo juri:** docker-compose (CouchDB + Fastify + static) di 1 VPS, ATAU frontend Vercel + backend VPS. URL live wajib (syarat TOR).
- **Cetak struk:** MVP = print via browser (share/print QR receipt A6). Roadmap = thermal printer Bluetooth ESC/POS.

### 0.7 Arsitektur Agent-Native (permintaan eksplisit tim)
- Seluruh API backend berbentuk **tools** (JSON schema jelas, idempotent, ber-audit-log) agar AI agent bisa mengoperasikannya: `get_ledger`, `get_member_balance`, `verify_chain`, `list_anomalies`, `generate_report`, `get_koperasi_health`.
- **Agent PENGAWAS (MVP):** inti deterministik (rule-based: rantai patah, transaksi di luar jam 05–21, lonjakan velocity per petugas, anggota dorman tiba-tiba aktif, penarikan besar tanpa Mode A) + lapisan LLM opsional untuk narasi alert Bahasa Indonesia. **Wajib jalan tanpa internet/LLM (graceful degradation).**
- **Agent LAPORAN (MVP tipis):** menyusun draft narasi laporan RAT + ringkasan keuangan dari ledger teratestasi.
- **Prinsip HITL (human-in-the-loop):** agent hanya MENGUSULKAN (draft alert/laporan); manusia (pengawas) yang menyetujui. Penting untuk kepercayaan pemerintah.
- Roadmap: wrapper MCP server agar ekosistem agent nasional bisa menempel.

### 0.8 Kejujuran Threat Model (WAJIB ada di semua dokumen — ini yang bikin juri percaya)
| Dicegah oleh SAKSI | TIDAK dicegah sendirian | Mitigasi |
|---|---|---|
| Edit/hapus diam-diam oleh pengurus | Kolusi anggota+petugas | Sampling acak pengawas, agent anomali, struk pihak ketiga |
| Transaksi fiktif sepihak | Pemaksaan (coercion) terhadap anggota | Kanal aspirasi, verifikasi independen |
| Anggota fiktif untuk pencairan dana | PIN dibocorkan/dipinjamkan | Edukasi, rotasi PIN, Mode A diprioritaskan |
| Laporan keuangan tidak bisa disusun | Identitas palsu saat onboarding | Verifikasi KTP + sampling lapangan |

### 0.9 Kepatuhan & Posisi Ekosistem
- **Komplemen SIMKOPDES, bukan pesaing** — "lapisan integritas di bawah pipa uang publik"; siap berbagi agregat via API ke SIMKOPDES & Jaga Desa.
- UU PDP 27/2022 (minimisasi data, data pribadi hanya untuk yang berwenang), Permenkop 19/2015 (RAT), SAK-EP (format laporan), UU 25/1992 (RA kekuasaan tertinggi).
- **Disclosure AI (Bagian J TOR):** tim WAJIB mencantumkan penggunaan AI generatif secara jujur (coding assistance, drafting dokumen, riset pendukung) dengan gagasan inti milik tim. Penyembunyian = diskualifikasi.

### 0.10 Angka Amunisi (untuk semua dokumen & pitch)
- 80.081 KDMP diresmikan; target operasional penuh Maret 2026; plafon s.d. Rp 3 M/koperasi; estimasi pipeline s.d. **Rp 400 triliun** (CORE Indonesia; senada Menkop 10/4/2025).
- Rekam jejak fraud koperasi: **Rp 26 triliun** (8 koperasi bermasalah versi Kemenkop); KSP Sejahtera Bersama ±186.000 korban/Rp 8 T; ASM Temanggung (anggota fiktif → LPDB).
- CELIOS: **65%** kades/perangkat mengakui potensi penyelewengan; estimasi kebocoran Rp 4,8 T/tahun (~Rp 60 jt/koperasi/tahun).
- RAT: hanya 71,5% koperasi aktif menggelar RAT; TB2024 **<50%** melaporkan hasil; pengurus mengaku tak mampu menyusun neraca (Dinas Tuban).
- SIMKOPDES: 92,69% KDMP punya akun (21/11/2025) tapi pengurus-oriented & online-only; keluhan App Store (rating 3,7): gagal verifikasi, tak bisa login.

### 0.11 Hukum UX Awam (TERKUNCI — detail lengkap & design tokens di `05-CORE-REFERENCE.md`)
- **Kamus wajib** — istilah teknis DILARANG tampil di layar anggota:
  "tanda tangan digital" → **"Saya Saksikan"** · "hash valid/chain OK" → **"✓ ASLI — uang Anda tercatat"** · "hash mismatch" → **"⛔ TIDAK ASLI — laporkan ke pengawas"** · "sync pending" → **"🕐 Menunggu sinyal — catatan Anda AMAN tersimpan"** · "SHU" → selalu didampingi **"(bagian untung Anda)"** · kata "atestasi" tidak pernah muncul di layar anggota.
- **Layar Atestasi (layar paling kritis):** hanya berisi foto+nama anggota, jenis transaksi, nominal ANGKA RAKSASA, dan DUA tombol: hijau besar **"BENAR, SAYA SAKSIKAN"** + abu **"BATAL"**. Tidak ada elemen lain di layar.
- **Voice prompt = MUST, bukan roadmap:** Web Speech API (`speechSynthesis`, voice id-ID, tersedia offline di Android) membacakan nominal di layar atestasi & PIN-pad: *"Setoran lima puluh ribu rupiah atas nama Ibu Sani. Tekan tombol hijau jika benar."*
- **Konfirmasi lewat kejadian, bukan popup:** aksi langsung terjadi → struk keluar. Koreksi = entri pembalik yang juga teratestasi; DILARANG dialog "Apakah Anda yakin?".
- **Aturan low-end (wajib di kode):** keypair digenerate SEKALI saat onboarding; stream kamera dimatikan segera setelah scan; daftar riwayat dipaginasi/virtualisasi; uji akhir di **perangkat fisik RAM 1–2GB**, bukan emulator — catat angkanya untuk amunisi pitch.

### 0.12 Pilar 2 — NALAR (LOCKED — detail di `07-NALAR-SPEC.md`)
- **NALAR = Navigasi, Analisis, Laporan, Aktivitas & Rekomendasi.** Lapisan kecerdasan keputusan untuk manajemen KDMP (gerai ritel), berdiri **di atas** data teratestasi SAKSI.
- **Read-only atas uang:** NALAR TIDAK PERNAH menulis/ubah ledger. Ia mengonsumsi data lewat API agent-native (Sec 0.7). Insight = derivasi (boleh dihitung ulang), bukan kebenaran primer.
- **Tiga tingkat peran (locked):**
  1. **Sales/Customer** — objek data; transaksi jual dijaga SAKSI (anti scan-ganda/diskon-siluman). Tidak melihat NALAR.
  2. **Store Manager** — **dashboard interaktif** dgn filter dropdown (per sales/kategori/periode/shift): total penjualan, total kehadiran, aktivitas, laporan audit harian, detail barang terjual, konversi promo (tebus murah), top performer per kategori, rekomendasi produk & jadwal piket prime-time. Rekap otomatis per 3-5 hari.
  3. **Direktur** — **AI chatbot prompt-terbatas** (rasa Gemini/Claude/ChatGPT, tapi daftar quick-prompt terkurasi), berbasis **RAG atas rekap manager**; "berikan laporan penjualan terbaru" -> connect waktu lokal -> narasi + file rekap. Direktur TIDAK diberi dashboard mentah.
- **AI di tempat benar (bukan tempelan):** chatbot **grounded** ke rekap (dilarang mengarang angka); LLM opsional saat online; **fallback template deterministik saat offline/tanpa LLM** (graceful degradation & HITL, identik Agent PENGAWAS).
- **Benang merah wajib disebut di pitch:** *"Insight dari data kotor menyesatkan. Karena setiap penjualan disaksikan, angka NALAR jujur — itu sebabnya NALAR mustahil tanpa SAKSI."*
- **Boleh chart di NALAR:** dashboard manager/direktur jalan di HP/laptop -> boleh visual kaya (chart ringan). **Aturan low-end Sec 0.11 tetap mengikat KHUSUS app anggota SAKSI** — jangan bawa beban chart ke sana.
- **Live demo:** landing page + login dashboard sebagai pintu masuk di `hackathon.plusthe.site`; kompleksitas peran customer -> sales -> manager -> direktur.

---

## STAGE 1 — GENERASI DOKUMEN (dieksekusi sekarang, urutan wajib)

Hasilkan 4 dokumen berikut, semuanya tunduk Bagian 0, Bahasa Indonesia, siap dipakai tanpa editan besar:

1. **`01-PRD.md`** — Product Requirements Document: identitas, problem, persona, mekanisme sebagai produk, fitur MoSCoW ber-ID (FR-x) dengan acceptance criteria ringkas, NFR, metrik sukses, rencana rilis (Sprint→Pilot→Skala), risiko.
2. **`02-SRS.md`** — Software Requirements Specification: aktor, **user flow** bernomor per journey, **site flow/peta layar** per aplikasi (Anggota, Petugas, Dashboard Pengawas), **data flow** (DFD tekstual L0/L1), **spesifikasi Protokol SAKSI** (kanonikalisasi payload, formula hash, skema tanda tangan, format QR, algoritme verifikasi, genesis, chain-per-perangkat + master anchor, manajemen kunci & pemulihan), spesifikasi sync & resolusi konflik, **arsitektur agent-native** (API-as-tools + roster agent + HITL), RBAC matrix, keamanan/UU PDP, threat model, target performa, acceptance criteria teruji per fitur MUST.
3. **`03-PROPOSAL.md`** — Dokumen proposal komprehensif siap submit: ringkasan eksekutif, problem statement (versi ≤150 kata + diperluas), solusi & kebaruan, arsitektur ringkas, dampak & metrik terukur, model bisnis & skalabilitas nasional 80K tenant, roadmap, kepatuhan regulasi, profil tim (placeholder), **disclosure AI jujur**, referensi.
4. **`04-PITCHDECK-CONCEPT.md`** — Konsep pitch deck 11 slide (judul, visual, talking points, durasi) dipetakan ke bobot kriteria penilaian; **skrip demo panggung 7 menit** (momen airplane-mode, momen fraud, momen struk kertas); **bank Q&A live defense** (≥12 pertanyaan berat + jawaban tajam); skrip video demo 3 menit (opsional TOR).
5. **`05-CORE-REFERENCE.md` + `06-MOCKUPS.html`** — lembar inti (tech stack, flow, hukum UI/UX, kamus istilah awam, design tokens) + mockup visual layar-layar kunci. Acuan tunggal tim saat sprint; mockup juga bahan visual pitch deck.
6. **`07-NALAR-SPEC.md`** — spesifikasi dalam Pilar 2 NALAR (dashboard, sales insight, AI chatbot prompt-terbatas, model data ritel, RBAC, acceptance). Setara kedalaman SRS untuk sisi manajemen.
7. **`STRATEGI-INTERNAL.md`** — RAHASIA TIM (BUKAN untuk juri): analisis celah menang, wow-factor, mapping bobot penilaian, taktik demo.

Bar kualitas: setiap klaim besar didukung angka Bagian 0.10; setiap fitur punya kriteria uji; tidak ada jargon tanpa penjelasan; kejujuran threat model muncul eksplisit.

---

## STAGE 2 — PROMPT EKSEKUSI KODE (copy-paste ke Claude Code / Cowork saat sprint)

> **Cara pakai:** buka Claude Code di repo kosong, lampirkan `01-PRD.md` + `02-SRS.md` + file ini, lalu paste blok di bawah.

```text
Kamu adalah lead engineer sprint hackathon 24–36 jam. Bangun "SUARA WARGA" — DUA pilar: SAKSI (integritas) + NALAR (kecerdasan)
sesuai 00-ULTIMATE-PROMPT.md (Bagian 0 = hukum tertinggi), 01-PRD.md, 02-SRS.md (SAKSI), dan 07-NALAR-SPEC.md (NALAR).

ATURAN KERAS:
- JANGAN gunakan blockchain/token/smart-contract/library kripto eksternal. Hanya Web Crypto API.
- Ledger keuangan APPEND-ONLY. Dilarang Last-Write-Wins untuk data uang.
- Setiap fitur WAJIB berfungsi offline penuh sebelum lanjut ke fitur berikutnya.
- UX literasi rendah: ikon+label teks, tombol besar, angka besar, alur ≤3 tap, tombol Batal jelas.
  WAJIB ikuti kamus istilah awam + spesifikasi layar di 05-CORE-REFERENCE.md dan acu visual 06-MOCKUPS.html.
  DILARANG menampilkan istilah kripto (hash / tanda tangan digital / rantai / sync) di layar anggota.
- TypeScript strict. Komponen kecil. Seed data realistis: 1 koperasi "KDMP Bentangan" — SAKSI: 20 anggota, 2 petugas, 1 pengawas, 60 transaksi simpan-pinjam historis; NALAR/ritel: 1 gerai, 6 sales (3 shift pagi+3 malam), 1 store manager, 1 direktur, ~40 SKU (4 kategori), ~350 transaksi jual teratestasi + kehadiran + aktivitas + 2 promo (seed WAJIB memunculkan insight "Sales A jago tebus murah, konversi ~51%").
- NALAR = READ-ONLY atas uang: dashboard & chatbot HANYA membaca via API agent-native; DILARANG menulis ke ledger. Chatbot direktur GROUNDED ke rekap (dilarang mengarang angka), prompt terbatas, fallback template saat offline.

STACK: React18+Vite+TS+Tailwind PWA (vite-plugin-pwa) · RxDB/IndexedDB · CouchDB replication ·
Fastify (auth PIN→JWT, re-verify chain, report, agent API + /nalar/*) · docker-compose untuk deploy.
NALAR: dashboard React+Chart.js (HANYA permukaan manager/direktur, bukan app anggota) + AI chatbot RAG prompt-terbatas (LLM opsional, fallback template deterministik) + landing page · LIVE di hackathon.plusthe.site.

STRUKTUR REPO:
suara-warga/
├── README.md              # installation guide + arsitektur DUA pilar (WAJIB — syarat submission TOR)
├── docs/                  # salin 00–07 (STRATEGI-INTERNAL.md JANGAN dipublikasikan ke juri)
├── apps/web/              # PWA SAKSI: routes(onboarding, kasir, pos-ritel, buku, struk, verifikasi, shu)
│   └── src/lib/{saksi/ (chain, sign, qr, verify), db/, sync/, ui/ (BigButton, IconLabel, MoneyText)}
├── apps/nalar/            # NALAR: dashboard manager + asisten AI direktur + landing (React+Tailwind+Chart.js)
│   └── src/{dashboard/, asisten/ (chat prompt-terbatas), landing/, lib/ (agg, rag, charts)}
├── server/                # fastify: /auth, /verify-chain, /reports, /agent/*, /nalar/* (BI + RAG tools)
├── seed/                  # seed SAKSI + seed ritel/NALAR
└── docker-compose.yml

URUTAN IMPLEMENTASI + DEFINITION OF DONE:
1. Scaffold + skema RxDB + seed. DoD: app load offline, seed tampil.
2. lib/saksi: canonical JSON → SHA-256 → ECDSA P-256 keypair per user → chain per perangkat
   (seq, prev_hash, tx_hash) + genesis. DoD: unit test — ubah 1 field historis ⇒ verifikasi gagal.
3. Alur Kasir: Setoran → Atestasi Mode B (PIN pad, DEFAULT) lalu Mode A (QR handshake, upgrade opt-in)
   → entri chain. DoD: transaksi teratestasi ganda, offline (airplane mode); Mode B end-to-end ≤10 dtk;
   voice prompt (speechSynthesis id-ID) membacakan nominal di layar atestasi/PIN-pad.
4. Struk Ganda: layar struk + QR payload + print browser (A6) + masuk "Struk Saya" anggota.
   DoD: struk berisi tx_hash/prev_hash/amount/parties; bisa dicetak.
5. Verifikasi Publik (tanpa login): scan QR → hitung ulang → VALID hijau / TIDAK COCOK merah.
   DoD: jalan offline; struk valid & struk hasil tamper dibedakan benar.
6. Buku Simpanan anggota (saldo dari fold event) + Riwayat kasir. DoD: saldo konsisten offline.
7. Sync CouchDB (append-only merge; profil LWW). DoD: skenario 2 perangkat offline →
   online → rekonsiliasi TANPA saldo hilang/ganda (test wajib).
8. Dashboard Pengawas + Agent PENGAWAS rule-based + tombol demo "Simulasi Orang Dalam"
   (mutasi 1 row DB langsung). DoD: dashboard merah pada seq yang patah; scan struk kertas
   transaksi tsb ⇒ TIDAK COCOK. Ini momen demo utama — harus mulus.
9. Tutup Buku: hitung SHU per anggota (formula a×simpanan + b×partisipasi, a/b konfigurable)
   + Neraca & L/R SAK-EP ringkas + ekspor. DoD: klik 1 tombol ⇒ laporan tampil, angka rekon.
10. Polish: PWA installable, Lighthouse PWA pass, bundle awal <5MB, first-load <5s @3G-sim,
    font/tombol besar, Bahasa Indonesia penuh; audit aturan low-end §0.11 (kamera off pasca-scan,
    virtualisasi riwayat, keypair hanya saat onboarding).
11. NALAR — Kasir Ritel teratestasi: alur POS (pilih/scan SKU -> total -> struk terverifikasi SAKSI) yang
    mencegah scan-ganda & memaksa diskon/promo tampil di struk. DoD: struk ritel diverifikasi publik;
    upaya scan 2x / sembunyikan diskon => TIDAK COCOK.
12. NALAR — Dashboard Manager (/nalar/dashboard): kartu (total penjualan, kehadiran, aktivitas, audit harian,
    detail SKU) + filter dropdown (sales/kategori/periode/shift) + insight (konversi promo, top performer,
    rekomendasi produk, jadwal piket) + chart ringan. DoD: filter <1 dtk; total = Σ ledger jual (rekon); insight sesuai seed.
13. NALAR — AI Chatbot Direktur (/nalar/asisten): quick-prompt terkurasi; RAG atas nalar_recaps;
    "laporan penjualan terbaru" pakai waktu lokal -> narasi + file. DoD: angka cocok dashboard; data kosong => tak mengarang;
    offline => fallback template jalan.
14. NALAR — Landing page + login role-based (pintu masuk dashboard). DoD: landing live; Masuk -> login -> route sesuai peran.
15. Deploy docker-compose ke VPS + seed => LIVE di hackathon.plusthe.site; buat akun uji juri:
    SAKSI: kasir.demo/222222 · anggota.sani/111111 · pengawas.demo/333333 ;
    NALAR: manager.demo/444444 · direktur.demo/555555 · sales.demo/666666 (catat utk kolom submission).
16. Submission pack: README lengkap (arsitektur dua pilar), URL live, kredensial juri, (opsional) rekam video 3 menit
    sesuai skrip di 04-PITCHDECK-CONCEPT.md. Ingat aturan TOR: telat 1 detik = gugur.

TES WAJIB SEBELUM SELESAI: (a) tamper test, (b) dua-perangkat-offline test,
(c) full offline journey test, (d) verifikasi struk kertas via kamera,
(e) rekonsiliasi NALAR: total dashboard = Σ ledger jual, (f) chatbot grounded + fallback offline, (g) anti scan-ganda kasir ritel.
```

---

## CHECKLIST SUBMISSION (TOR — jangan sampai gugur administratif)
- [ ] Repo publik GitHub/GitLab/Bitbucket + README (install guide + arsitektur)
- [ ] Pitch deck PDF maks 10–12 slide (Problem, Solution & Architecture, Business & Impact, Team)
- [ ] URL demo live di **hackathon.plusthe.site** + **kredensial 6 akun uji** (3 SAKSI + 3 NALAR) di kolom deskripsi
- [ ] Landing page + Dashboard NALAR + AI chatbot direktur tampil & jalan di demo
- [ ] Video 3 menit unlisted (opsional tapi kerjakan — juri capek, video menolong)
- [ ] Disclosure penggunaan AI tercantum (proposal + README)
- [ ] Upload ke portal SIMKOPDES **sebelum deadline — target: T-minus 30 menit**
