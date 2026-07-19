# CORE REFERENCE — SUARA WARGA × PROTOKOL SAKSI
Lembar inti tim: stack · flow · UI/UX. Kalau cuma sempat baca satu file saat sprint, baca ini.
Induk: `00-ULTIMATE-PROMPT.md` · Visual mengikat: `06-MOCKUPS.html`

---

## 1. Satu Paragraf Produk
PWA offline-first untuk Android low-end. Setiap transaksi simpanan/pinjaman **dan penjualan gerai** lahir dengan **dua saksi** (anggota/pelanggan + petugas, tanpa internet), terkunci dalam **rantai hash** (bukan blockchain), dan meninggalkan **struk kertas + digital**. Di atas data jujur itu berdiri **NALAR** — dashboard interaktif (manager) + AI chatbot prompt-terbatas (direktur) — yang mengubah data jadi keputusan cepat. Akibatnya: laporan keuangan & SHU menyusun dirinya sendiri, fraud terdeteksi dalam hitungan detik, dan manajemen memutuskan berbasis data yang tak bisa dicurangi. *"Setiap Rupiah Ada Saksinya, Setiap Keputusan Ada Dasarnya."* (Dua pilar: **SAKSI** = integritas · **NALAR** = kecerdasan. Detail NALAR: `07-NALAR-SPEC.md`.)

## 2. Tech Stack (dan KENAPA — hafalkan untuk live defense)

| Lapisan | Pilihan | Kenapa ini, bukan yang lain |
|---|---|---|
| Frontend | React 18 + Vite + TS + Tailwind, PWA (`vite-plugin-pwa`) | Tanpa install store (hemat storage HP murah); ekosistem tercepat untuk sprint |
| DB lokal | **RxDB** di atas IndexedDB | Local-first: app hidup penuh tanpa server; replikasi CouchDB bawaan |
| Kripto | **Web Crypto API** bawaan browser (SHA-256, ECDSA P-256, PBKDF2) | Nol dependensi eksternal = nol beban bundle, jalan offline, mudah diaudit |
| Sync | RxDB ⇄ **CouchDB** | Satu-satunya kombo di mana offline-sync = fitur bawaan, bukan dibangun sendiri |
| Backend | Node + **Fastify** (tipis) | Hanya: auth PIN→JWT, re-verifikasi rantai, laporan, API agent-native |
| Deploy | `docker-compose` di 1 VPS (CouchDB+Fastify+static) atau FE Vercel + BE VPS | URL live + akun juri = syarat TOR |

Aturan tak bisa ditawar: ledger **append-only** (koreksi = entri pembalik teratestasi, bukan edit) · **tanpa LWW untuk uang** · saldo selalu hasil fold event · **tanpa blockchain**.

## 3. Flow Emas (jalur demo — hafal luar kepala)

```
KASIR                      ANGGOTA (Bu Sani)              SISTEM
─────                      ─────────────────              ──────
Setoran → pilih anggota
→ ketik Rp 50.000     →   L2 layar SAKSIKAN
                           (nama+nominal+2 tombol, 🔊)
                      →   L3 PIN terisolasi (Mode B) →   verifikasi scrypt lokal
                                                          + sig petugas
                                                     →   entri rantai: tx_hash =
                                                          H(prev‖payload‖attest‖sig)
                      ←   L4 STRUK terbit            ←   append RxDB (offline!)
                           (cetak + digital)
─── saat online ───────────────────────────────────→    sync CouchDB → server
                                                          re-verify → anchor
                                                     →   Dashboard L7 + Agent rules
Siapa pun, kapan pun  →   L5/L6 CEK STRUK: scan QR  →   hitung ulang → ASLI / TIDAK COCOK
Bendahara: Tutup Buku ────────────────────────────→     SHU per anggota + Neraca (1 tombol)
```
Chain **per perangkat kasir** + anchor server → dua kasir offline tidak pernah konflik.

## 4. Peta Layar (7 layar kunci = 7 frame di mockup)
L1 Beranda Anggota (saldo raksasa + 4 ubin) → L2 Saksikan → L3 PIN → L4 Struk → L5 Asli / L6 Tidak Cocok (publik, tanpa login) → L7 Dashboard Pengawas. Kasir punya home sendiri: Setoran · Penarikan · Angsuran · Anggota Baru · Riwayat · Tutup Buku.

## 5. Enam Hukum UI/UX (mengikat — cek tiap PR)
1. **Nol istilah kripto di layar anggota.** Mesin membaca hash; manusia membaca "ASLI".
2. **Nominal uang = elemen terbesar layar.** Tabular numerals, weight 800.
3. **Maksimal dua tombol di layar keputusan.** L2 hanya: SAKSIKAN / BATAL.
4. **Layar kunci bisa berbicara** 🔊 (Web Speech `speechSynthesis`, id-ID; graceful degradation).
5. **Konfirmasi lewat struk, bukan popup.** Salah? Entri pembalik teratestasi, bukan dialog "yakin?".
6. **≤3 tap ke aksi inti.** Setoran: pilih anggota → nominal → saksikan. Selesai.

## 6. Kamus Istilah Awam (WAJIB — layar tidak boleh melanggar)

| Istilah teknis (dilarang tampil) | Kata di layar |
|---|---|
| Atestasi / tanda tangan digital | **SAKSIKAN** · "Saksi: Bu Sani" |
| Verifikasi rantai / hash valid | **STRUK ASLI** — "cocok dengan catatan koperasi" |
| Signature mismatch / tampered | **⛔ STRUK TIDAK COCOK — laporkan ke Pengawas** |
| Synced / tersinkronisasi | **✓ Tersimpan aman** |
| Pending sync / antrean | **Menunggu tersimpan** (kuning) |
| SHU | **SHU (bagian untung Anda)** |
| Offline mode | **✈︎ Tanpa internet — tetap bisa dipakai** |
| Chain broken (dashboard pengawas) | **Rantai patah — berubah di luar aplikasi** (pengawas boleh sedikit teknis) |

## 7. Design Tokens (dari `06-MOCKUPS.html`)
`--hijau #0B5D3B` (identitas/kepercayaan) · `--hijau-aksi #12854F` · `--latar #F1F4EF` · `--kertas #FAF6EC` (khusus permukaan struk) · `--kuning #E9A800` (menunggu) · `--merah #BE2B22` (**hanya** fraud/tidak cocok) · font sistem (render tercepat di Android murah) · radius 16–20px · tombol keputusan min-height 76px · elemen tanda tangan visual: **struk termal bertepi sobek + stempel "TERCATAT ✓"**.

## 8. Keputusan Terkunci Terbaru
- **Mode B (PIN pad) = jalur DEFAULT** semua anggota; Mode A (QR + tanda tangan digital) = upgrade opt-in. Alasan: aman untuk HP RAM 1GB & anggota tanpa HP; ≤10 dtk; tanpa risiko kamera.
- Kinerja HP desa: keypair digenerate saat onboarding (bukan saat transaksi) · kamera mati segera setelah scan · riwayat di-virtualize · **uji akhir wajib di HP fisik RAM 1–2GB, bukan emulator** — dan bawa angkanya ke panggung ("Mode B selesai 8 detik di HP [merk]").

---

## 9. Pilar 2 — NALAR (ringkas; detail `07-NALAR-SPEC.md`)

**Satu kalimat:** NALAR = *Navigasi, Analisis, Laporan, Aktivitas & Rekomendasi* — lapisan keputusan di atas data teratestasi SAKSI. "Dari Saksi, Lahir Aksi."

**Stack delta:** dashboard React + Tailwind + **Chart.js** (HANYA di permukaan manager/direktur, bukan app anggota) · AI chatbot RAG prompt-terbatas (LLM opsional online, fallback template offline) · landing page · endpoint Fastify `/nalar/v1/*` (read-mostly) · deploy live `hackathon.plusthe.site`.

**Flow NALAR (jalur demo):**
```
KASIR RITEL (SAKSI)        STORE MANAGER (Dashboard)     DIREKTUR (Chatbot)
jual -> struk terverifikasi  filter per sales/kategori     "laporan penjualan terbaru"
(anti scan-ganda/diskon)  -> total, konversi promo,     -> RAG atas rekap manager
                             top performer, jadwal piket  -> narasi + file (waktu lokal)
data jujur --------------> insight <1 dtk --------------> keputusan tanpa baca tabel
```

**Peta layar NALAR:** `/` Landing -> `/login` (role-based) -> `/nalar/dashboard` (manager) · `/nalar/asisten` (direktur). Kasir ritel = extension app petugas SAKSI (`/kasir/pos`).

**Peran (locked):** customer/sales = objek data (dijaga SAKSI) · store manager = dashboard penuh · direktur = chatbot prompt-terbatas (BUKAN dashboard mentah).

**Aturan NALAR:** read-only atas uang (tak pernah tulis ledger) · chatbot grounded ke rekap (dilarang mengarang) · HITL (insight = usulan) · chart hanya di manajemen, low-end tetap mengikat app anggota.

**Akun uji NALAR:** manager.demo/444444 · direktur.demo/555555 · sales.demo/666666.
