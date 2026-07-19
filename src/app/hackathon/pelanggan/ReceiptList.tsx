"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReceiptView } from "@/lib/hackathon/customer";

const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
type Tab = "all" | "tebus";

export default function ReceiptList({ receipts }: { receipts: ReceiptView[] }) {
    const [tab, setTab] = useState<Tab>("all");
    const shown = useMemo(() => (tab === "tebus" ? receipts.filter((r) => r.tebusMurah) : receipts), [tab, receipts]);
    const tebusCount = receipts.filter((r) => r.tebusMurah).length;

    return (
        <div>
            <div className="mb-3 flex gap-2">
                <Chip active={tab === "all"} onClick={() => setTab("all")}>Semua ({receipts.length})</Chip>
                <Chip active={tab === "tebus"} onClick={() => setTab("tebus")}>Tebus Murah ({tebusCount})</Chip>
            </div>
            <div className="space-y-2.5">
                {shown.map((r) => (
                    <Link key={r.txId} href={`/hackathon/pelanggan/struk/${r.txId}`} className="nalar-card flex items-center gap-3 p-4 transition active:scale-[.99]">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg" style={{ background: "var(--hijau-terang)" }}>🛍️</span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="truncate font-semibold">{r.items.length} barang</span>
                                {r.tebusMurah && <span className="nalar-chip shrink-0" style={{ background: "var(--kertas)", color: "var(--kuning)" }}>Tebus Murah</span>}
                            </div>
                            <div className="text-[12px]" style={{ color: "var(--kabur)" }}>{r.tgl} · {String(r.jam).padStart(2, "0")}:00 · {r.sales.split(" ")[0]}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-extrabold tabular-nums">{rp(r.total)}</div>
                            <div className="text-[11px]" style={{ color: "var(--navy)" }}>✓ Tersimpan aman</div>
                        </div>
                    </Link>
                ))}
                {shown.length === 0 && <p className="py-4 text-center text-sm" style={{ color: "var(--kabur)" }}>Belum ada struk di kategori ini.</p>}
            </div>
        </div>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className="rounded-full px-3.5 py-1.5 text-xs font-bold transition"
            style={active ? { background: "var(--hijau)", color: "#fff" } : { background: "#fff", border: "1px solid var(--garis)", color: "var(--kabur)" }}>
            {children}
        </button>
    );
}
