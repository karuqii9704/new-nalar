// NALAR customer surface — the gerai shopper (koperasi member) side.
//
// The customer is the demand side of the SAKSI → NALAR loop: they hold a
// verified digital receipt (proof the koperasi's books are honest) and can
// rate the service — which becomes the "Aktivitas / review pelanggan" signal
// the manager dashboard reads. Data is derived from the same attested ledger.

import { LEDGER, allLedger, productBySku, employeeById, PROMOS, type SaleTx } from "./seed";

export interface DemoCustomer {
    id: string;
    nama: string;
    telp: string;
    anggotaSejak: string;
    kartu: string;
}

export const DEMO_CUSTOMER: DemoCustomer = {
    id: "cust-sani",
    nama: "Bu Sani",
    telp: "0812-xxxx-3311",
    anggotaSejak: "2024",
    kartu: "KDMP-0031",
};

export interface ReceiptView {
    txId: string; // transaksi_penjualan.transaksi_sample_id
    tgl: string;
    jam: number;
    sales: string;
    metode: string; // transaksi_penjualan.metode_pembayaran
    total: number;
    hemat: number; // discount saved (tebus murah)
    tebusMurah: boolean;
    items: { nama: string; barcode: string; unit: string; qty: number; harga: number; diskon: number }[];
    txHash: string;
}

function toView(tx: SaleTx): ReceiptView {
    let hemat = 0;
    const items = tx.items.map((it) => {
        hemat += it.diskon;
        const p = productBySku(it.sku);
        return {
            nama: p?.nama ?? it.sku,
            barcode: p?.kodeBarcode ?? "-",
            unit: p?.unit ?? "Pcs",
            qty: it.qty,
            harga: it.harga,
            diskon: it.diskon,
        };
    });
    return {
        txId: tx.txId,
        tgl: tx.tgl,
        jam: tx.jam,
        sales: employeeById(tx.salesId)?.nama ?? "-",
        metode: tx.metode === "qris" ? "QRIS" : "Tunai",
        total: tx.total,
        hemat,
        tebusMurah: tx.tebusMurah,
        items,
        txHash: tx.txHash,
    };
}

/** The deterministic slice of the attested ledger that is "Bu Sani's" history.
 *  Shared by the receipt list and the insight panel so both stay in sync. */
function pickCustomerLedger(): SaleTx[] {
    const withTebus = LEDGER.filter((t) => t.tebusMurah).slice(-4);
    const plain = LEDGER.filter((t) => !t.tebusMurah).slice(-4);
    return [...withTebus, ...plain]
        .sort((a, b) => (a.tgl < b.tgl ? 1 : a.tgl > b.tgl ? -1 : b.seq - a.seq))
        .slice(0, 6);
}

/** Bu Sani's purchase history — a deterministic slice of the attested ledger. */
export function customerReceipts(): ReceiptView[] {
    return pickCustomerLedger().map(toView);
}

export type Kat = "minuman" | "makanan" | "perawatan" | "rumah";

export interface CustomerInsights {
    belanja: number;      // total nilai transaksi (net)
    hemat: number;        // total potongan Tebus Murah
    margin: number;       // gross margin koperasi dari belanja ini (→ SHU)
    items: number;        // total unit dibeli
    transaksi: number;
    hariBelanja: number;  // hari kunjungan berbeda
    hematPersen: number;  // hemat / (belanja + hemat)
    tebusCount: number;
    kategori: { kategori: Kat; nilai: number; qty: number }[]; // desc by nilai
    produkFav: { nama: string; qty: number; nilai: number }[]; // top 4 by qty
    metodeFav: string;
}

/** Insight yang bisa dipertanggungjawabkan — semuanya diturunkan dari struk
 *  teratestasi (SAKSI), bukan angka karangan. Landasan panel "Ringkasan
 *  Belanjamu" & "Dampak Keanggotaan" (Tema 3: keterlibatan anggota). */
export function customerInsights(): CustomerInsights {
    const txs = pickCustomerLedger();
    const kat: Record<Kat, { nilai: number; qty: number }> = {
        minuman: { nilai: 0, qty: 0 }, makanan: { nilai: 0, qty: 0 },
        perawatan: { nilai: 0, qty: 0 }, rumah: { nilai: 0, qty: 0 },
    };
    const produk = new Map<string, { qty: number; nilai: number }>();
    const hari = new Set<string>();
    const metode = new Map<string, number>();
    let belanja = 0, hemat = 0, margin = 0, items = 0, tebusCount = 0;

    for (const tx of txs) {
        hari.add(tx.tgl);
        belanja += tx.total;
        metode.set(tx.metode, (metode.get(tx.metode) ?? 0) + 1);
        if (tx.tebusMurah) tebusCount++;
        for (const it of tx.items) {
            const p = productBySku(it.sku);
            if (!p) continue;
            const net = it.harga * it.qty - it.diskon;
            hemat += it.diskon;
            items += it.qty;
            margin += net - p.hpp * it.qty;
            kat[p.kategori].nilai += net;
            kat[p.kategori].qty += it.qty;
            const cur = produk.get(p.nama) ?? { qty: 0, nilai: 0 };
            cur.qty += it.qty; cur.nilai += net;
            produk.set(p.nama, cur);
        }
    }

    const kategori = (Object.keys(kat) as Kat[])
        .map((k) => ({ kategori: k, ...kat[k] }))
        .filter((k) => k.nilai > 0)
        .sort((a, b) => b.nilai - a.nilai);
    const produkFav = [...produk.entries()]
        .map(([nama, v]) => ({ nama, ...v }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 4);
    const metodeFav = [...metode.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] === "qris" ? "QRIS" : "Tunai";

    return {
        belanja, hemat, margin, items, transaksi: txs.length,
        hariBelanja: hari.size, hematPersen: belanja + hemat ? hemat / (belanja + hemat) : 0,
        tebusCount, kategori, produkFav, metodeFav,
    };
}

export function customerReceipt(txId: string): ReceiptView | null {
    const tx = allLedger().find((t) => t.txId === txId.trim().toUpperCase());
    return tx ? toView(tx) : null;
}

/** Loyalty: 1 poin per Rp 1.000 belanja, over the customer's receipts. */
export function loyalty() {
    const rs = customerReceipts();
    const belanja = rs.reduce((s, r) => s + r.total, 0);
    const hemat = rs.reduce((s, r) => s + r.hemat, 0);
    const poin = Math.floor(belanja / 1000);
    const tier = poin >= 800 ? "Emas" : poin >= 200 ? "Perak" : "Perunggu";
    return { belanja, hemat, poin, tier, transaksi: rs.length };
}

export const CUSTOMER_PROMOS = PROMOS;
