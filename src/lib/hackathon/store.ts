// NALAR live store — the shared, persistent layer that connects all roles.
//
// New POS sales and customer reviews are written here (Supabase) so that a
// customer's interaction shows up on the manager dashboard and the director's
// chatbot, across devices, in real time. Everything degrades gracefully: with
// no Supabase configured (or the tables missing) the app falls back to the
// deterministic seed and never crashes.

import { getSupabaseAdmin } from "@/lib/supabase";
import { setLiveTx, setLiveReviews, type SaleTx, type LiveReview } from "./seed";

interface SaleRow {
    tx_id: string;
    tgl: string;
    jam: number;
    sales_id: string;
    items: SaleTx["items"];
    total: number;
    tebus_murah: boolean;
    tx_hash: string;
    prev_hash: string;
    seq: number;
}

function rowToTx(r: SaleRow): SaleTx {
    return {
        txId: r.tx_id,
        tgl: r.tgl,
        jam: r.jam,
        salesId: r.sales_id,
        items: r.items,
        total: Number(r.total),
        metode: "tunai",
        tebusMurah: r.tebus_murah,
        txHash: r.tx_hash,
        prevHash: r.prev_hash,
        seq: r.seq,
    };
}

export interface LiveEvents {
    sales: SaleTx[];
    reviews: LiveReview[];
    ok: boolean;
}

/** Read all live events from Supabase. Returns empty (ok:false) on any issue. */
export async function readLiveEvents(): Promise<LiveEvents> {
    const admin = getSupabaseAdmin();
    if (!admin) return { sales: [], reviews: [], ok: false };
    try {
        const [{ data: s, error: se }, { data: r, error: re }] = await Promise.all([
            admin.from("nalar_sales").select("*").order("seq", { ascending: true }),
            admin.from("nalar_reviews").select("sales_id,rating"),
        ]);
        if (se || re) return { sales: [], reviews: [], ok: false };
        const sales = (s ?? []).map((row) => rowToTx(row as SaleRow));
        const reviews = (r ?? []).map((row) => ({ salesId: (row as { sales_id: string }).sales_id, rating: (row as { rating: number }).rating }));
        return { sales, reviews, ok: true };
    } catch {
        return { sales: [], reviews: [], ok: false };
    }
}

/** Load live events into the analytics module for the current runtime. */
export async function hydrateLive(): Promise<LiveEvents> {
    const ev = await readLiveEvents();
    setLiveTx(ev.sales);
    setLiveReviews(ev.reviews);
    return ev;
}

export async function insertSale(tx: SaleTx): Promise<{ ok: boolean; error?: string }> {
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Supabase belum dikonfigurasi." };
    const { error } = await admin.from("nalar_sales").insert({
        tx_id: tx.txId,
        tgl: tx.tgl,
        jam: tx.jam,
        sales_id: tx.salesId,
        items: tx.items,
        total: tx.total,
        tebus_murah: tx.tebusMurah,
        tx_hash: tx.txHash,
        prev_hash: tx.prevHash,
        seq: tx.seq,
    });
    return error ? { ok: false, error: error.message } : { ok: true };
}

export async function insertReview(r: { txId: string; salesId: string; rating: number; komentar: string }): Promise<{ ok: boolean; error?: string }> {
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Supabase belum dikonfigurasi." };
    const { error } = await admin.from("nalar_reviews").insert({
        tx_id: r.txId,
        sales_id: r.salesId,
        rating: r.rating,
        komentar: r.komentar,
    });
    return error ? { ok: false, error: error.message } : { ok: true };
}
