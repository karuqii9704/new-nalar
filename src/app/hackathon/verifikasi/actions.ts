"use server";

import { verifyReceipt } from "@/lib/hackathon/analytics";
import { hydrateLive } from "@/lib/hackathon/store";
import { LEDGER, employeeById } from "@/lib/hackathon/seed";

export interface VerifyResult {
    status: "asli" | "tidak_cocok" | "tidak_ada";
    txId?: string;
    sales?: string;
    tgl?: string;
    jam?: number;
    total?: number;
    items?: number;
    txHash?: string;
    prevHash?: string;
    seq?: number;
    note?: string;
}

export async function verifyAction(txId: string): Promise<VerifyResult> {
    await hydrateLive();
    const r = verifyReceipt(txId);
    if (r.status === "tidak_ada" || !r.tx) return { status: "tidak_ada" };
    return {
        status: r.status,
        txId: r.tx.txId,
        sales: r.salesNama,
        tgl: r.tx.tgl,
        jam: r.tx.jam,
        total: r.tx.total,
        items: r.tx.items.length,
        txHash: r.tx.txHash,
        prevHash: r.tx.prevHash,
        seq: r.tx.seq,
    };
}

// FNV-1a — identical to the seed chain hash.
function fnv1a(str: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
}

/** "Simulasi Orang Dalam": take a real receipt, secretly bump its total, and
 *  show the chain rejects it — TIDAK COCOK. This is the anti-fraud demo. */
export async function tamperAction(): Promise<VerifyResult> {
    const tx = LEDGER.find((t) => t.tebusMurah) ?? LEDGER[0];
    const fakeTotal = tx.total + 25000; // someone edits the DB directly
    const recomputed = fnv1a(`${tx.prevHash}|${tx.txId}|${tx.salesId}|${fakeTotal}|${tx.jam}`);
    return {
        status: recomputed === tx.txHash ? "asli" : "tidak_cocok",
        txId: tx.txId,
        sales: employeeById(tx.salesId)?.nama,
        tgl: tx.tgl,
        jam: tx.jam,
        total: fakeTotal,
        items: tx.items.length,
        txHash: tx.txHash,
        prevHash: tx.prevHash,
        seq: tx.seq,
        note: `Nilai transaksi diubah diam-diam menjadi Rp ${fakeTotal.toLocaleString("id-ID")} (aslinya Rp ${tx.total.toLocaleString("id-ID")}). Rantai hash langsung menolak — struk TIDAK COCOK.`,
    };
}
