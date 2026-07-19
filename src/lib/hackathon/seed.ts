// NALAR seed — deterministic demo dataset for the Hackathon (operasional gerai).
//
// One koperasi ("KDMP Bentangan"), one gerai, 6 sales (3 shift pagi + 3 malam),
// ~40 SKU across 4 categories, a ~2-week attested sales ledger with a clear
// rush-hour pattern, attendance, activities, and 2 active promos.
//
// Everything is generated from a fixed PRNG seed so the numbers are stable and
// verifiable — the dashboard totals reconcile exactly with the ledger, and the
// tebus-murah insight surfaces "Andi (Sales A): konversi 51% (180/350)" as
// required by 07-NALAR-SPEC §N-FR-2.

export type Kategori = "minuman" | "makanan" | "perawatan" | "rumah";
export type Shift = "pagi" | "malam";
export type Peran = "sales" | "manager" | "direktur";

export interface Product {
    sku: string; // maps to produk_koperasi.produk_sample_id
    nama: string; // produk_koperasi.nama_produk
    kategori: Kategori;
    harga: number; // barang_masuk_produk.harga_jual (Rp)
    hpp: number; // barang_masuk_produk.harga_beli (Rp)
    stok: number; // inventaris_produk.stok
    promo: boolean; // eligible for tebus murah
    kodeBarcode: string; // produk_koperasi.kode_barcode
    unit: string; // produk_koperasi.unit
}

// produk_koperasi.unit per kategori.
const UNIT_BY_KAT: Record<Kategori, string> = {
    minuman: "Botol", makanan: "Pcs", perawatan: "Pcs", rumah: "Unit",
};

export interface Employee {
    id: string;
    nama: string;
    peran: Peran;
    shift: Shift;
    kategoriUnggulan: Kategori | null;
    fotoInisial: string;
    karyawanRef: string; // karyawan_koperasi.karyawan_ref
    jabatan: string; // karyawan_koperasi.jabatan
}

export interface SaleItem {
    sku: string;
    qty: number;
    harga: number;
    diskon: number; // Rp per line
}

export interface SaleTx {
    txId: string;
    tgl: string; // YYYY-MM-DD
    jam: number; // 0..23
    salesId: string;
    items: SaleItem[];
    total: number;
    metode: "tunai" | "qris";
    tebusMurah: boolean; // promo redeemed on this tx
    txHash: string;
    prevHash: string;
    seq: number;
}

export interface Attendance {
    employeeId: string;
    tgl: string;
    shift: Shift;
    status: "hadir" | "izin" | "alpa";
    jamMasuk: string | null;
    jamKeluar: string | null;
}

export interface PromoFunnel {
    salesId: string;
    dilayani: number; // customers served under promo threshold
    tergiur: number; // accepted the offer
    konversi: number; // bought > k products
}

// --- deterministic PRNG (mulberry32) ---
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const rand = mulberry32(20260710);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

// --- tiny synchronous hash (FNV-1a → hex) for the SAKSI receipt chain demo ---
export function fnv1a(str: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
}

/** Canonical chain hash for a transaction — used by the seed, live POS, and
 *  the verifier so every surface agrees on what "ASLI" means. */
export function chainHash(prevHash: string, txId: string, salesId: string, total: number, jam: number): string {
    return fnv1a(`${prevHash}|${txId}|${salesId}|${total}|${jam}`);
}

// ── Koperasi (profil_koperasi ⋈ referensi_koperasi_wilayah ⋈ referensi_wilayah) ──
export const KOPERASI = {
    id: "kdmp-bentangan",
    koperasiRef: "KOP-7A3F91C2D5E8", // profil_koperasi.koperasi_ref
    nama: "KDMP Bentangan",
    bentukKoperasi: "Primer", // profil_koperasi.bentuk_koperasi
    kategoriUsaha: "Konsumen (Ritel/Sembako)", // profil_koperasi.kategori_usaha
    geraiRef: "GRE-BENTANGAN000001", // gerai_koperasi.gerai_ref
    gerai: "Gerai Sembako Bentangan 01",
    kodeWilayah: "33.10.09.2001", // referensi_wilayah.kode_wilayah
    provinsi: "JAWA TENGAH",
    kabKota: "KLATEN",
    kecamatan: "WONOSARI",
    desaKelurahan: "BENTANGAN",
    alamat: "Ds. Bentangan, Wonosari, Klaten",
} as const;

// karyawan_koperasi.jabatan per role.
const JABATAN: Record<Peran, string> = { sales: "Sales", manager: "Manajer", direktur: "Direktur" };

// ── Employees (karyawan_koperasi) ─────────────────────────────────────────
// Andi = "Sales A" — the tebus-murah champion the insight must surface.
const RAW_EMPLOYEES: Omit<Employee, "karyawanRef" | "jabatan">[] = [
    { id: "s-andi", nama: "Andi Saputra", peran: "sales", shift: "pagi", kategoriUnggulan: "minuman", fotoInisial: "AS" },
    { id: "s-budi", nama: "Budi Hartono", peran: "sales", shift: "pagi", kategoriUnggulan: "makanan", fotoInisial: "BH" },
    { id: "s-citra", nama: "Citra Dewanti", peran: "sales", shift: "pagi", kategoriUnggulan: "perawatan", fotoInisial: "CD" },
    { id: "s-dewi", nama: "Dewi Lestari", peran: "sales", shift: "malam", kategoriUnggulan: "minuman", fotoInisial: "DL" },
    { id: "s-eko", nama: "Eko Prasetyo", peran: "sales", shift: "malam", kategoriUnggulan: "rumah", fotoInisial: "EP" },
    { id: "s-fitri", nama: "Fitri Ananda", peran: "sales", shift: "malam", kategoriUnggulan: "makanan", fotoInisial: "FA" },
    { id: "m-rina", nama: "Rina Wibowo", peran: "manager", shift: "pagi", kategoriUnggulan: null, fotoInisial: "RW" },
    { id: "d-hadi", nama: "Hadi Santoso", peran: "direktur", shift: "pagi", kategoriUnggulan: null, fotoInisial: "HS" },
];
export const EMPLOYEES: Employee[] = RAW_EMPLOYEES.map((e) => ({
    ...e,
    karyawanRef: `KRY-${fnv1a(e.id).toUpperCase()}`, // karyawan_koperasi.karyawan_ref
    jabatan: JABATAN[e.peran],
}));

export const SALES = EMPLOYEES.filter((e) => e.peran === "sales");

// ── Products (~40 SKU across 4 categories) ────────────────────────────────
const RAW_PRODUCTS: Array<[string, Kategori, number, number, boolean]> = [
    // [nama, kategori, harga, hpp, promoEligible]
    ["Air Mineral 600ml", "minuman", 3500, 2200, true],
    ["Teh Kotak 300ml", "minuman", 4000, 2600, true],
    ["Kopi Sachet Susu", "minuman", 2000, 1200, true],
    ["Susu UHT Coklat 250ml", "minuman", 6500, 4300, false],
    ["Minuman Isotonik 500ml", "minuman", 7000, 4800, true],
    ["Jus Buah Kemasan", "minuman", 8000, 5400, false],
    ["Soda Gembira 1.5L", "minuman", 13000, 9000, false],
    ["Kopi Bubuk 165g", "minuman", 12000, 8200, false],
    ["Teh Celup isi 25", "minuman", 8500, 5600, false],
    ["Air Galon Isi Ulang", "minuman", 20000, 14000, false],
    ["Mie Instan Goreng", "makanan", 3000, 1900, true],
    ["Mie Instan Kuah", "makanan", 2800, 1800, true],
    ["Biskuit Kaleng", "makanan", 22000, 15500, false],
    ["Roti Tawar", "makanan", 14000, 9800, false],
    ["Sarden Kaleng 155g", "makanan", 11000, 7600, false],
    ["Kecap Manis 275ml", "makanan", 9500, 6500, false],
    ["Minyak Goreng 1L", "makanan", 17000, 13500, true],
    ["Gula Pasir 1kg", "makanan", 15500, 12800, true],
    ["Beras Premium 5kg", "makanan", 68000, 60000, false],
    ["Telur Ayam 1kg", "makanan", 27000, 23000, true],
    ["Tepung Terigu 1kg", "makanan", 12000, 9200, false],
    ["Snack Keripik", "makanan", 9000, 5500, true],
    ["Wafer Coklat", "makanan", 6000, 3800, true],
    ["Kerupuk Bungkus", "makanan", 5000, 3000, false],
    ["Sabun Mandi Batang", "perawatan", 4500, 2800, true],
    ["Sampo Sachet", "perawatan", 1000, 550, true],
    ["Pasta Gigi 190g", "perawatan", 13000, 9000, false],
    ["Sabun Cuci Piring 780ml", "perawatan", 15000, 10500, false],
    ["Deterjen Bubuk 800g", "perawatan", 18000, 13000, true],
    ["Pembalut isi 10", "perawatan", 12000, 8200, false],
    ["Tisu Wajah 250s", "perawatan", 16000, 11500, false],
    ["Sabun Cuci Baju Batang", "perawatan", 3500, 2100, false],
    ["Popok Bayi M isi 4", "perawatan", 9000, 6300, false],
    ["Gas LPG 3kg (tabung)", "rumah", 22000, 19000, false],
    ["Korek Api Gas", "rumah", 2000, 1000, false],
    ["Lilin Set", "rumah", 6000, 3600, false],
    ["Baterai AA isi 2", "rumah", 8000, 4800, false],
    ["Pengharum Ruangan", "rumah", 14000, 9800, false],
    ["Kantong Plastik Pack", "rumah", 5000, 2800, false],
    ["Sapu Ijuk", "rumah", 21000, 15000, false],
];

export const PRODUCTS: Product[] = RAW_PRODUCTS.map(([nama, kategori, harga, hpp, promo], i) => ({
    sku: `SKU-${String(i + 1).padStart(3, "0")}`,
    nama,
    kategori,
    harga,
    hpp,
    stok: between(12, 180),
    promo,
    // Deterministic EAN-13-style barcode (RNG-free so the ledger stream is stable).
    kodeBarcode: `899${String(i + 1).padStart(10, "0")}`,
    unit: UNIT_BY_KAT[kategori],
}));
const PROMO_SKUS = PRODUCTS.filter((p) => p.promo);

// ── Dates (last 14 days ending "today" in demo = 2026-07-10) ──────────────
export const TODAY = "2026-07-10";
function buildDates(): string[] {
    const out: string[] = [];
    const end = new Date("2026-07-10T00:00:00");
    for (let i = 13; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        out.push(d.toISOString().slice(0, 10));
    }
    return out;
}
export const DATES = buildDates();
const isWeekend = (tgl: string) => {
    const day = new Date(`${tgl}T00:00:00`).getDay();
    return day === 0 || day === 6;
};

// Rush hours: morning 07-09, evening 17-20 get the bulk of traffic.
const HOUR_WEIGHTS: Record<number, number> = {
    6: 2, 7: 6, 8: 8, 9: 6, 10: 3, 11: 3, 12: 4, 13: 3,
    14: 2, 15: 3, 16: 4, 17: 7, 18: 9, 19: 8, 20: 5, 21: 2,
};
function pickHour(): number {
    const entries = Object.entries(HOUR_WEIGHTS);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = rand() * total;
    for (const [h, w] of entries) {
        r -= w;
        if (r <= 0) return Number(h);
    }
    return 18;
}

// ── Sales ledger (attested) ───────────────────────────────────────────────
function buildLedger(): SaleTx[] {
    const txs: SaleTx[] = [];
    let prevHash = "00000000"; // genesis
    let seq = 0;

    for (const tgl of DATES) {
        const weekend = isWeekend(tgl);
        // ~40 tx/weekday, ~60 on weekends → ~600 tx total.
        const count = weekend ? between(52, 66) : between(34, 46);
        for (let i = 0; i < count; i++) {
            const jam = pickHour();
            const shift: Shift = jam < 14 ? "pagi" : "malam";
            const roster = SALES.filter((s) => s.shift === shift);
            // Andi (pagi) is the busiest closer → weight him higher in the morning.
            let sales = pick(roster);
            if (shift === "pagi" && rand() < 0.42) sales = SALES[0]; // Andi
            const nItems = between(1, 6);
            const items: SaleItem[] = [];
            let total = 0;
            let tebus = false;
            for (let k = 0; k < nItems; k++) {
                // Sales lean toward their strong category.
                const pool =
                    sales.kategoriUnggulan && rand() < 0.5
                        ? PRODUCTS.filter((p) => p.kategori === sales.kategoriUnggulan)
                        : PRODUCTS;
                const p = pick(pool);
                const qty = between(1, 4);
                const line = p.harga * qty;
                items.push({ sku: p.sku, qty, harga: p.harga, diskon: 0 });
                total += line;
            }
            // Tebus murah: if basket > 50k, offer a promo SKU at a discount.
            if (total > 50000 && rand() < 0.55) {
                const promoP = pick(PROMO_SKUS);
                const diskon = Math.round(promoP.harga * 0.4);
                items.push({ sku: promoP.sku, qty: 1, harga: promoP.harga, diskon });
                total += promoP.harga - diskon;
                tebus = true;
            }
            seq += 1;
            const txId = `TX-${tgl.replace(/-/g, "")}-${String(seq).padStart(4, "0")}`;
            const payload = `${txId}|${sales.id}|${total}|${jam}`;
            const txHash = fnv1a(`${prevHash}|${payload}`);
            txs.push({
                txId,
                tgl,
                jam,
                salesId: sales.id,
                items,
                total,
                metode: rand() < 0.7 ? "tunai" : "qris",
                tebusMurah: tebus,
                txHash,
                prevHash,
                seq,
            });
            prevHash = txHash;
        }
    }
    return txs;
}
export const LEDGER: SaleTx[] = buildLedger();

// ── Attendance (14 days × sales) ──────────────────────────────────────────
function buildAttendance(): Attendance[] {
    const out: Attendance[] = [];
    for (const s of SALES) {
        for (const tgl of DATES) {
            const r = rand();
            const status: Attendance["status"] = r < 0.9 ? "hadir" : r < 0.96 ? "izin" : "alpa";
            const pagi = s.shift === "pagi";
            out.push({
                employeeId: s.id,
                tgl,
                shift: s.shift,
                status,
                jamMasuk: status === "hadir" ? (pagi ? "06:45" : "13:45") : null,
                jamKeluar: status === "hadir" ? (pagi ? "14:05" : "21:10") : null,
            });
        }
    }
    return out;
}
export const ATTENDANCE: Attendance[] = buildAttendance();

// ── Promo funnel (curated so Andi = 350 / 300 / 180 → 51%) ────────────────
export const PROMO_FUNNEL: PromoFunnel[] = [
    { salesId: "s-andi", dilayani: 350, tergiur: 300, konversi: 180 }, // 51.4%
    { salesId: "s-budi", dilayani: 268, tergiur: 190, konversi: 96 }, // 35.8%
    { salesId: "s-citra", dilayani: 240, tergiur: 150, konversi: 78 }, // 32.5%
    { salesId: "s-dewi", dilayani: 262, tergiur: 176, konversi: 110 }, // 42.0%
    { salesId: "s-eko", dilayani: 205, tergiur: 120, konversi: 60 }, // 29.3%
    { salesId: "s-fitri", dilayani: 248, tergiur: 168, konversi: 92 }, // 37.1%
];

// Customer star reviews per sales (for the Aktivitas card).
export const REVIEW_AVG: Record<string, { avg: number; jumlah: number }> = {
    "s-andi": { avg: 4.8, jumlah: 132 },
    "s-budi": { avg: 4.4, jumlah: 98 },
    "s-citra": { avg: 4.6, jumlah: 104 },
    "s-dewi": { avg: 4.5, jumlah: 89 },
    "s-eko": { avg: 4.2, jumlah: 71 },
    "s-fitri": { avg: 4.5, jumlah: 95 },
};

export const PROMOS = [
    {
        id: "promo-tebus",
        nama: "Tebus Murah",
        jenis: "tebus_murah" as const,
        syarat: "Belanja > Rp 50.000 → tebus 1 produk pilihan diskon 40%",
        aktif: true,
    },
    {
        id: "promo-akhir-pekan",
        nama: "Diskon Akhir Pekan",
        jenis: "diskon_akhir_pekan" as const,
        syarat: "Sabtu–Minggu, potongan untuk kategori makanan & minuman",
        aktif: true,
    },
];

// Helper lookups
export const employeeById = (id: string) => EMPLOYEES.find((e) => e.id === id);
export const productBySku = (sku: string) => PRODUCTS.find((p) => p.sku === sku);

// ── Live layer ─────────────────────────────────────────────────────────────
// Real interactions (new POS sales + customer reviews) are stored in Supabase
// and injected here at read time so every role sees the same live numbers.
// These module bindings are per-runtime; each surface refreshes its own copy.
export interface LiveReview {
    salesId: string;
    rating: number;
}

let LIVE_TX: SaleTx[] = [];
let LIVE_REVIEWS: LiveReview[] = [];

export function setLiveTx(txs: SaleTx[]) {
    LIVE_TX = txs;
}
export function setLiveReviews(rs: LiveReview[]) {
    LIVE_REVIEWS = rs;
}
export function getLiveReviews(): LiveReview[] {
    return LIVE_REVIEWS;
}

/** Seed ledger + any live POS sales (chronological baseline first). */
export function allLedger(): SaleTx[] {
    return LIVE_TX.length ? LEDGER.concat(LIVE_TX) : LEDGER;
}

/** The tip of the attested chain (last hash + next seq) for a new live sale. */
export function chainTip(): { prevHash: string; seq: number } {
    const tail = LIVE_TX.length ? LIVE_TX[LIVE_TX.length - 1] : LEDGER[LEDGER.length - 1];
    return { prevHash: tail.txHash, seq: tail.seq + 1 };
}
