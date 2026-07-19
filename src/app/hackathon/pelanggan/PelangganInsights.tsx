"use client";

import { useState } from "react";
import { Donut } from "../_components/Charts";
import type { CustomerInsights, Kat } from "@/lib/hackathon/customer";

const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const rpShort = (n: number) => (n >= 1_000_000 ? "Rp " + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " jt" : n >= 1000 ? "Rp " + Math.round(n / 1000) + " rb" : "Rp " + n);

const KAT_COLOR: Record<Kat, string> = { minuman: "#D6222A", makanan: "#F2B807", perawatan: "#1B3A6B", rumah: "#9E6B4A" };
const KAT_LABEL: Record<Kat, string> = { minuman: "Minuman", makanan: "Makanan", perawatan: "Perawatan", rumah: "Rumah" };

export default function PelangganInsights({ ins }: { ins: CustomerInsights }) {
    const [kat, setKat] = useState<Kat | null>(null);
    const top = ins.kategori[0];
    const focus = kat ? ins.kategori.find((k) => k.kategori === kat) : null;

    return (
        <div className="nalar-card p-4">
            {/* stat row */}
            <div className="grid grid-cols-2 gap-2.5">
                <Stat label="Total belanja" value={rpShort(ins.belanja)} tone="ink" />
                <Stat label="Total hemat" value={rpShort(ins.hemat)} tone="navy" sub={`${Math.round(ins.hematPersen * 100)}% dari belanja`} />
                <Stat label="Kunjungan" value={`${ins.hariBelanja}×`} tone="ink" sub={`${ins.transaksi} struk`} />
                <Stat label="Barang dibeli" value={`${ins.items}`} tone="ink" sub={`${ins.tebusCount}× tebus murah`} />
            </div>

            {/* category donut */}
            <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--garis)" }}>
                <div className="mb-1 flex items-baseline justify-between">
                    <h3 className="text-sm font-bold">Kategori favoritmu</h3>
                    {top && <span className="nalar-chip" style={{ background: "var(--hijau-terang)", color: "var(--hijau)" }}>{KAT_LABEL[top.kategori]}</span>}
                </div>
                <Donut
                    data={ins.kategori.map((k) => ({ label: KAT_LABEL[k.kategori], value: k.nilai, color: KAT_COLOR[k.kategori] }))}
                    format={rpShort}
                    selectedLabel={kat ? KAT_LABEL[kat] : undefined}
                    onSelect={(label) => {
                        const found = (Object.keys(KAT_LABEL) as Kat[]).find((k) => KAT_LABEL[k] === label) ?? null;
                        setKat(kat === found ? null : found);
                    }}
                />
                <p className="mt-1 text-[12px]" style={{ color: "var(--kabur)" }}>
                    {focus
                        ? <>Kategori <strong style={{ color: KAT_COLOR[focus.kategori] }}>{KAT_LABEL[focus.kategori]}</strong>: {focus.qty} barang · {rp(focus.nilai)}.</>
                        : <>Ketuk irisan untuk rincian. Belanjamu paling banyak di <strong>{top ? KAT_LABEL[top.kategori] : "-"}</strong>.</>}
                </p>
            </div>

            {/* favourite products */}
            <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--garis)" }}>
                <h3 className="mb-2 text-sm font-bold">Sering kamu beli</h3>
                <ul className="space-y-1.5">
                    {ins.produkFav.map((p, i) => (
                        <li key={p.nama} className="flex items-center gap-2.5 text-sm">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: "var(--hijau)" }}>{i + 1}</span>
                            <span className="flex-1 truncate">{p.nama}</span>
                            <span className="shrink-0 tabular-nums font-semibold">{p.qty}×</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "ink" | "navy" }) {
    return (
        <div className="rounded-xl p-3" style={{ background: "var(--latar)" }}>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--kabur)" }}>{label}</div>
            <div className="text-lg font-extrabold tabular-nums" style={{ color: tone === "navy" ? "var(--navy)" : "var(--tinta)" }}>{value}</div>
            {sub && <div className="text-[10px]" style={{ color: "var(--kabur)" }}>{sub}</div>}
        </div>
    );
}
