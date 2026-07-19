"use client";

import { useState } from "react";
import { verifyAction, tamperAction, type VerifyResult } from "./actions";

export default function VerifyForm({ samples }: { samples: string[] }) {
    const [txId, setTxId] = useState("");
    const [res, setRes] = useState<VerifyResult | null>(null);
    const [busy, setBusy] = useState(false);

    async function run(id: string) {
        if (!id.trim()) return;
        setBusy(true);
        setRes(await verifyAction(id));
        setBusy(false);
    }
    async function tamper() {
        setBusy(true);
        setRes(await tamperAction());
        setBusy(false);
    }

    return (
        <div className="mt-6">
            <div className="nalar-card p-5">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && run(txId)}
                        placeholder="Masukkan kode struk (mis. TX-20260710-0001)"
                        className="flex-1 rounded-xl border px-4 py-3 text-sm font-mono outline-none focus:ring-2"
                        style={{ borderColor: "var(--garis)" }}
                    />
                    <button onClick={() => run(txId)} disabled={busy} className="rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-60" style={{ background: "var(--hijau)" }}>
                        {busy ? "Memeriksa…" : "Verifikasi"}
                    </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--kabur)" }}>
                    <span>Contoh struk asli:</span>
                    {samples.map((s) => (
                        <button key={s} onClick={() => { setTxId(s); run(s); }} className="rounded-md border px-2 py-1 font-mono" style={{ borderColor: "var(--garis)" }}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {res && <ResultCard res={res} />}

            <button onClick={tamper} disabled={busy} className="mt-4 w-full rounded-xl border-2 border-dashed px-4 py-3 text-sm font-bold transition hover:bg-white disabled:opacity-60" style={{ borderColor: "var(--merah)", color: "var(--merah)" }}>
                ⚠️ Simulasi Orang Dalam — ubah nilai transaksi diam-diam
            </button>
        </div>
    );
}

function ResultCard({ res }: { res: VerifyResult }) {
    if (res.status === "tidak_ada") {
        return (
            <div className="mt-4 rounded-xl p-5" style={{ background: "#FFF6E5", border: "1px solid #E9A800" }}>
                <div className="text-lg font-extrabold" style={{ color: "#A07800" }}>Struk tidak ditemukan</div>
                <p className="mt-1 text-sm" style={{ color: "var(--kabur)" }}>Kode struk tidak ada dalam catatan koperasi. Periksa kembali kodenya.</p>
            </div>
        );
    }
    const asli = res.status === "asli";
    return (
        <div className="mt-4 rounded-xl p-5" style={asli ? { background: "var(--navy-terang)", border: "1px solid var(--navy)" } : { background: "#FBE9E7", border: "1px solid var(--merah)" }}>
            <div className="flex items-center gap-3">
                <span className="text-3xl">{asli ? "✅" : "⛔"}</span>
                <div>
                    <div className="text-xl font-extrabold" style={{ color: asli ? "var(--navy)" : "var(--merah)" }}>
                        {asli ? "STRUK ASLI" : "STRUK TIDAK COCOK"}
                    </div>
                    <div className="text-[13px]" style={{ color: "var(--kabur)" }}>
                        {asli ? "Cocok dengan catatan koperasi — teratestasi SAKSI." : "Ada data yang diubah di luar aplikasi. Laporkan ke Pengawas."}
                    </div>
                </div>
            </div>
            {res.note && <p className="mt-3 rounded-lg bg-white/60 p-3 text-[13px]" style={{ color: "var(--merah)" }}>{res.note}</p>}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <Row k="Kode struk" v={res.txId!} mono />
                <Row k="Sales" v={res.sales ?? "-"} />
                <Row k="Tanggal" v={`${res.tgl} · ${String(res.jam).padStart(2, "0")}:00`} />
                <Row k="Total" v={`Rp ${(res.total ?? 0).toLocaleString("id-ID")}`} />
                <Row k="Item" v={`${res.items} baris`} />
                <Row k="Posisi rantai" v={`#${res.seq}`} />
                <Row k="tx_hash" v={res.txHash!} mono />
                <Row k="prev_hash" v={res.prevHash!} mono />
            </dl>
        </div>
    );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
    return (
        <div>
            <dt className="text-[11px] uppercase" style={{ color: "var(--kabur)" }}>{k}</dt>
            <dd className={mono ? "font-mono text-xs" : "font-semibold"}>{v}</dd>
        </div>
    );
}
