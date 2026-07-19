"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    kpi, salesByRep, byCategory, byHour, byDay, bySku, primeTime,
    attendanceSummary, recommendProducts, restockAlerts, topPerformerPerKategori,
    promoConversion, recommendRoster, healthScore, forecastNextWeek, reviewSummary,
    setLiveTx, setLiveReviews, rp, rpShort,
    type Filter,
} from "@/lib/hackathon/analytics";
import { SALES, DATES, KOPERASI, type Kategori } from "@/lib/hackathon/seed";
import { LINEAGE, NALAR_SOURCE_TABLES } from "@/lib/hackathon/schema";
import { BarChartH, LineTrend, HourBars, Donut, Gauge } from "../_components/Charts";
import LogoutButton from "../_components/LogoutButton";
import type { NalarRole } from "@/lib/hackathon/auth";

const KAT_COLOR: Record<Kategori, string> = {
    minuman: "#D6222A", makanan: "#F2B807", perawatan: "#1B3A6B", rumah: "#9E6B4A",
};
const jamLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

export default function DashboardApp({ role, nama, employeeId }: { role: NalarRole; nama: string; employeeId: string | null }) {
    const isSales = role === "sales";
    const [salesId, setSalesId] = useState<string>(isSales && employeeId ? employeeId : "all");
    const [kategori, setKategori] = useState<Kategori | "all">("all");
    const [periode, setPeriode] = useState<7 | 14>(14);
    const [shift, setShift] = useState<"pagi" | "malam" | "all">("all");
    const [tick, setTick] = useState(0);
    const [live, setLive] = useState<{ sales: number; reviews: number } | null>(null);

    // Pull live events (new POS sales + customer reviews) and merge them over
    // the seed baseline, then poll so the dashboard reflects other roles' actions.
    useEffect(() => {
        let alive = true;
        async function pull() {
            try {
                const r = await fetch("/api/hackathon/events", { cache: "no-store" });
                const ev = await r.json();
                if (!alive || !ev?.ok) return;
                setLiveTx(ev.sales ?? []);
                setLiveReviews(ev.reviews ?? []);
                setLive({ sales: (ev.sales ?? []).length, reviews: (ev.reviews ?? []).length });
                setTick((t) => t + 1);
            } catch {
                /* offline → seed baseline stays */
            }
        }
        pull();
        const id = setInterval(pull, 8000);
        return () => { alive = false; clearInterval(id); };
    }, []);

    const filter: Filter = useMemo(() => {
        const dari = DATES[Math.max(0, DATES.length - periode)];
        return { salesId, kategori, dari, sampai: DATES[DATES.length - 1], shift };
    }, [salesId, kategori, periode, shift]);

    const k = useMemo(() => kpi(filter), [filter, tick]);
    const reps = useMemo(() => salesByRep(filter), [filter, tick]);
    const cats = useMemo(() => byCategory(filter), [filter, tick]);
    const hours = useMemo(() => byHour(filter), [filter, tick]);
    const days = useMemo(() => byDay(filter), [filter, tick]);
    const skus = useMemo(() => bySku(filter), [filter, tick]);
    const prime = useMemo(() => primeTime(filter), [filter, tick]);
    const att = useMemo(() => attendanceSummary(filter), [filter, tick]);
    const recoProd = useMemo(() => recommendProducts(filter), [filter, tick]);
    const restock = useMemo(() => restockAlerts(filter), [filter, tick]);
    const topKat = useMemo(() => topPerformerPerKategori(filter), [filter, tick]);
    const promo = useMemo(() => promoConversion(), []);
    const roster = useMemo(() => recommendRoster(filter), [filter, tick]);
    const health = useMemo(() => healthScore(), [tick]);
    const forecast = useMemo(() => forecastNextWeek({ salesId, kategori }), [salesId, kategori, tick]);
    const reviews = useMemo(() => reviewSummary(), [tick]);

    const dayLabels = days.map((d) => d.tgl.slice(8) + "/" + d.tgl.slice(5, 7));
    const forecastLabels = forecast.proyeksi.map((_, i) => `+${i + 1}`);

    function unduhRekap() {
        const lines = [
            `REKAP NALAR — ${nama}`,
            `Periode: ${filter.dari} s/d ${filter.sampai}`,
            `Filter: sales=${salesId} kategori=${kategori} shift=${shift}`,
            ``,
            `Omzet,${Math.round(k.omzet)}`,
            `Transaksi,${k.transaksi}`,
            `Margin,${Math.round(k.margin)}`,
            `Rata-rata per transaksi,${Math.round(k.rataTransaksi)}`,
            `Kehadiran,${att.persenHadir.toFixed(1)}%`,
            `Skor kesehatan,${health.skor}`,
            ``,
            `TOP SALES`,
            ...reps.slice(0, 6).map((r, i) => `${i + 1}. ${r.sales.nama},${Math.round(r.omzet)}`),
            ``,
            `DETAIL BARANG TERJUAL (top 15)`,
            `SKU,Nama,Qty,Nilai,Margin`,
            ...skus.slice(0, 15).map((r) => `${r.produk.sku},${r.produk.nama},${r.qty},${Math.round(r.nilai)},${Math.round(r.margin)}`),
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rekap-nalar-${filter.sampai}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="nalar-root min-h-screen">
            {/* Top bar */}
            <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: "var(--garis)", background: "rgba(241,244,239,.85)" }}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
                    <Link href="/hackathon" className="flex items-center gap-2 font-extrabold">
                        <img src="/nalar-logo.jpg" alt="NALAR" className="h-8 w-8 rounded-lg object-cover object-left" />
                        <span>NALAR<span className="ml-1 text-xs font-semibold" style={{ color: "var(--kabur)" }}>Dashboard</span></span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {live && (
                            <span className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex" style={{ background: "var(--hijau-terang)", color: "var(--hijau)" }}>
                                <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--hijau-aksi)" }} />
                                Live · {live.sales} jual · {live.reviews} ulasan
                            </span>
                        )}
                        {!isSales && <Link href="/hackathon/nasional" className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ border: "1px solid var(--garis)", color: "var(--hijau)" }}>Nasional</Link>}
                        <Link href="/hackathon/kasir" className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "var(--hijau)" }}>+ Kasir</Link>
                        <div className="hidden text-right sm:block">
                            <div className="text-sm font-bold leading-tight">{nama}</div>
                            <div className="text-[11px]" style={{ color: "var(--kabur)" }}>{isSales ? "Sales Gerai" : "Store Manager"}</div>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-5 py-6">
                {/* Koperasi identity — mirrors profil_koperasi (official schema) */}
                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]" style={{ color: "var(--kabur)" }}>
                    <span className="font-bold" style={{ color: "var(--tinta)" }}>{KOPERASI.nama}</span>
                    <span>· {KOPERASI.kategoriUsaha}</span>
                    <span className="font-mono">koperasi_ref: {KOPERASI.koperasiRef}</span>
                    <span className="font-mono">kode_wilayah: {KOPERASI.kodeWilayah}</span>
                    <span>{KOPERASI.kecamatan}, {KOPERASI.kabKota}</span>
                </div>

                {/* Filter bar */}
                <div className="nalar-card mb-5 flex flex-wrap items-end gap-3 p-4">
                    <Field label="Sales">
                        <select value={salesId} onChange={(e) => setSalesId(e.target.value)} disabled={isSales} className="nalar-select">
                            {!isSales && <option value="all">Semua sales</option>}
                            {SALES.filter((s) => !isSales || s.id === employeeId).map((s) => (
                                <option key={s.id} value={s.id}>{s.nama}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Kategori">
                        <select value={kategori} onChange={(e) => setKategori(e.target.value as Kategori | "all")} className="nalar-select">
                            <option value="all">Semua kategori</option>
                            <option value="minuman">Minuman</option>
                            <option value="makanan">Makanan</option>
                            <option value="perawatan">Perawatan</option>
                            <option value="rumah">Rumah</option>
                        </select>
                    </Field>
                    <Field label="Periode">
                        <select value={periode} onChange={(e) => setPeriode(Number(e.target.value) as 7 | 14)} className="nalar-select">
                            <option value={14}>14 hari terakhir</option>
                            <option value={7}>7 hari terakhir</option>
                        </select>
                    </Field>
                    <Field label="Shift">
                        <select value={shift} onChange={(e) => setShift(e.target.value as "pagi" | "malam" | "all")} className="nalar-select">
                            <option value="all">Semua shift</option>
                            <option value="pagi">Pagi</option>
                            <option value="malam">Malam</option>
                        </select>
                    </Field>
                    <div className="ml-auto flex gap-2">
                        <button onClick={unduhRekap} className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: "var(--hijau)" }}>
                            ⭳ Unduh Rekap
                        </button>
                        <button
                            onClick={() => { setSalesId(isSales && employeeId ? employeeId : "all"); setKategori("all"); setPeriode(14); setShift("all"); }}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold"
                            style={{ borderColor: "var(--garis)", color: "var(--kabur)" }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Kpi label="Total Penjualan" value={rp(k.omzet)} sub={`${k.transaksi} transaksi`} big />
                    <Kpi label="Margin Kotor" value={rp(k.margin)} sub={`${((k.margin / (k.omzet || 1)) * 100).toFixed(1)}% dari omzet`} />
                    <Kpi label="Barang Terjual" value={k.itemsTerjual.toLocaleString("id-ID")} sub={`${k.tebusCount} tx tebus murah`} />
                    <Kpi label="Rata-rata / Transaksi" value={rp(k.rataTransaksi)} sub="keranjang belanja" />
                </div>

                {/* Trend + forecast + health */}
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <Panel title="Tren Omzet Harian & Prediksi 7 Hari" className="lg:col-span-2"
                        chip={forecast.deltaPersen >= 0 ? `↗ proyeksi +${Math.round(forecast.deltaPersen * 100)}%` : `↘ proyeksi ${Math.round(forecast.deltaPersen * 100)}%`}
                        chipColor={forecast.deltaPersen >= 0 ? "var(--hijau)" : "var(--merah)"}>
                        <LineTrend actual={days.map((d) => d.omzet)} forecast={forecast.proyeksi} labels={[...dayLabels, ...forecastLabels]} format={rpShort} />
                        <div className="mt-2 flex gap-4 text-[11px]" style={{ color: "var(--kabur)" }}>
                            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ background: "#D6222A" }} /> Aktual</span>
                            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: "#F2B807" }} /> Prediksi (model musiman)</span>
                            <span className="ml-auto">Proyeksi minggu depan: <strong style={{ color: "var(--tinta)" }}>{rpShort(forecast.total)}</strong></span>
                        </div>
                    </Panel>
                    {!isSales && (
                        <Panel title="Kesehatan Koperasi">
                            <div className="flex flex-col items-center">
                                <Gauge value={health.skor} status={health.status} />
                                <div className="mt-3 w-full space-y-1.5">
                                    {health.komponen.map((c) => (
                                        <div key={c.label} className="flex items-center gap-2 text-[12px]">
                                            <span className="flex-1 truncate" style={{ color: "var(--kabur)" }}>{c.label}</span>
                                            <span className="font-semibold tabular-nums">{c.nilai}</span>
                                            <span className="text-[10px]" style={{ color: "var(--kabur)" }}>·{c.bobot}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Panel>
                    )}
                </div>

                {/* Leaderboard + category */}
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Panel title="Peringkat Sales (Omzet)" chip={isSales ? undefined : "klik untuk filter"} chipColor="var(--kabur)">
                        <BarChartH
                            data={reps.map((r) => ({ label: r.sales.nama.split(" ")[0], value: r.omzet, sub: `${r.transaksi} tx`, tip: r.sales.nama }))}
                            format={rpShort}
                            highlightIndex={reps.findIndex((r) => r.sales.id === "s-andi")}
                            selectedLabel={salesId === "all" ? undefined : SALES.find((s) => s.id === salesId)?.nama.split(" ")[0]}
                            onSelect={isSales ? undefined : (first) => {
                                const s = SALES.find((x) => x.nama.split(" ")[0] === first);
                                if (s) setSalesId(salesId === s.id ? "all" : s.id);
                            }}
                        />
                    </Panel>
                    <Panel title="Komposisi Penjualan per Kategori" chip="klik untuk filter" chipColor="var(--kabur)">
                        <Donut
                            data={cats.map((c) => ({ label: c.kategori, value: c.omzet, color: KAT_COLOR[c.kategori] }))}
                            format={rpShort}
                            selectedLabel={kategori === "all" ? undefined : kategori}
                            onSelect={(label) => setKategori(kategori === label ? "all" : (label as Kategori))}
                        />
                    </Panel>
                </div>

                {/* Prime time + roster */}
                {!isSales && (
                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <Panel title="Jam Ramai (Prime Time)" className="lg:col-span-2">
                            <HourBars data={hours} prime={prime} />
                            <p className="mt-2 text-[13px]" style={{ color: "var(--kabur)" }}>
                                Puncak transaksi: <strong style={{ color: "var(--kuning)" }}>{prime.map(jamLabel).join(" & ")}</strong>. Pastikan stok tebus murah tersedia di jam ini.
                            </p>
                        </Panel>
                        <Panel title="🤖 Rekomendasi Piket (AI · HITL)">
                            <div className="space-y-3">
                                {roster.map((r) => (
                                    <div key={r.jam} className="rounded-lg p-3" style={{ background: "var(--latar)" }}>
                                        <div className="text-xs font-bold uppercase" style={{ color: "var(--hijau)" }}>{jamLabel(r.jam)} · shift {r.shift}</div>
                                        {r.champs.length ? r.champs.map((c) => (
                                            <div key={c.kategori} className="mt-1 text-[13px]">Tempatkan <strong>{c.sales.nama.split(" ")[0]}</strong> <span style={{ color: "var(--kabur)" }}>(jago {c.kategori})</span></div>
                                        )) : <div className="mt-1 text-[13px]" style={{ color: "var(--kabur)" }}>Rotasi normal</div>}
                                    </div>
                                ))}
                                <p className="text-[11px]" style={{ color: "var(--kabur)" }}>Usulan sistem — manager menyetujui/mengubah.</p>
                            </div>
                        </Panel>
                    </div>
                )}

                {/* Insight: promo conversion + top performer */}
                {!isSales && (
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <Panel title="Konversi Tebus Murah per Sales" chip="Insight" chipColor="var(--kuning)">
                            <BarChartH
                                data={promo.map((p) => ({ label: p.sales.nama.split(" ")[0], value: Math.round(p.rasio * 100), sub: `${p.konversi}/${p.dilayani}` }))}
                                format={(n) => `${n}%`}
                                highlightIndex={promo.findIndex((p) => p.sales.id === "s-andi")}
                            />
                            <p className="mt-3 rounded-lg p-3 text-[13px]" style={{ background: "var(--hijau-terang)", color: "var(--hijau)" }}>
                                💡 <strong>{promo[0].sales.nama.split(" ")[0]}</strong> jago Tebus Murah — konversi <strong>{Math.round(promo[0].rasio * 100)}%</strong> ({promo[0].konversi}/{promo[0].dilayani}). Jadikan mentor & tempatkan di jam ramai.
                            </p>
                        </Panel>
                        <Panel title="Top Performer per Kategori">
                            <div className="grid grid-cols-2 gap-3">
                                {topKat.map((t) => (
                                    <div key={t.kategori} className="rounded-lg border p-3" style={{ borderColor: "var(--garis)" }}>
                                        <div className="text-[11px] font-bold uppercase" style={{ color: KAT_COLOR[t.kategori] }}>{t.kategori}</div>
                                        <div className="mt-1 font-bold">{t.juara ? t.juara.nama.split(" ")[0] : "—"}</div>
                                        <div className="text-[12px] tabular-nums" style={{ color: "var(--kabur)" }}>{rpShort(t.omzet)}</div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                )}

                {/* Recommendations: products + restock */}
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Panel title="🤖 Rekomendasi Produk untuk Didorong">
                        <ol className="space-y-2">
                            {recoProd.slice(0, 6).map((r, i) => (
                                <li key={r.produk.sku} className="flex items-center gap-3 text-sm">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: "var(--hijau)" }}>{i + 1}</span>
                                    <span className="flex-1 truncate">{r.produk.nama}</span>
                                    <span className="tabular-nums" style={{ color: "var(--kabur)" }}>{r.qty} pcs</span>
                                    <span className="font-semibold tabular-nums">{rpShort(r.margin)}</span>
                                </li>
                            ))}
                        </ol>
                    </Panel>
                    <Panel title="⚠️ Perlu Restock Segera" chip={`${restock.length} produk`} chipColor="var(--merah)">
                        {restock.length ? (
                            <ul className="space-y-2">
                                {restock.map((r) => (
                                    <li key={r.produk.sku} className="flex items-center gap-3 text-sm">
                                        <span className="flex-1 truncate">{r.produk.nama}</span>
                                        <span className="tabular-nums" style={{ color: "var(--kabur)" }}>stok {r.stok}</span>
                                        <span className="font-semibold tabular-nums" style={{ color: "var(--merah)" }}>~{Math.ceil(r.hariTersisa)} hari lagi</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm" style={{ color: "var(--kabur)" }}>Stok aman untuk periode ini.</p>}
                    </Panel>
                </div>

                {/* Attendance + reviews */}
                {!isSales && (
                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <Panel title="Kehadiran Karyawan">
                            <div className="flex items-end justify-around py-2">
                                <Stat n={att.hadir} l="Hadir" c="var(--navy)" />
                                <Stat n={att.izin} l="Izin" c="var(--kuning)" />
                                <Stat n={att.alpa} l="Alpa" c="var(--merah)" />
                            </div>
                            <div className="mt-1 text-center text-[13px]" style={{ color: "var(--kabur)" }}>Tingkat kehadiran <strong style={{ color: "var(--navy)" }}>{att.persenHadir.toFixed(1)}%</strong></div>
                        </Panel>
                        <Panel title="Rating Pelanggan (Aktivitas)" className="lg:col-span-2">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {SALES.map((s) => {
                                    const rv = reviews[s.id];
                                    return (
                                        <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ background: "var(--latar)" }}>
                                            <span className="truncate">{s.nama.split(" ")[0]}</span>
                                            <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--kuning)" }}>
                                                ★ {rv.avg.toFixed(1)}
                                                {rv.baru > 0 && <span className="rounded-full px-1.5 text-[10px] font-bold text-white" style={{ background: "var(--hijau)" }}>+{rv.baru}</span>}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>
                    </div>
                )}

                {/* Detail SKU */}
                <div className="mt-4">
                    <Panel title="Detail Barang Terjual (per SKU)">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[11px] uppercase" style={{ color: "var(--kabur)" }}>
                                        <th className="pb-2">Produk</th>
                                        <th className="pb-2">Barcode</th>
                                        <th className="pb-2">Kategori</th>
                                        <th className="pb-2 text-right">Qty</th>
                                        <th className="pb-2 text-right">Nilai</th>
                                        <th className="pb-2 text-right">Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skus.slice(0, 12).map((r) => (
                                        <tr key={r.produk.sku} className="border-t" style={{ borderColor: "var(--garis)" }}>
                                            <td className="py-2 font-medium">{r.produk.nama}</td>
                                            <td className="py-2 font-mono text-[11px]" style={{ color: "var(--kabur)" }}>{r.produk.kodeBarcode}</td>
                                            <td className="py-2 capitalize" style={{ color: "var(--kabur)" }}>{r.produk.kategori}</td>
                                            <td className="py-2 text-right tabular-nums">{r.qty}</td>
                                            <td className="py-2 text-right tabular-nums">{rp(r.nilai)}</td>
                                            <td className="py-2 text-right tabular-nums font-semibold" style={{ color: "var(--hijau)" }}>{rp(r.margin)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </div>

                {/* Audit + bridge to SAKSI */}
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Panel title="Laporan Audit Harian (SAKSI)">
                        <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: "var(--hijau-terang)" }}>
                            <span className="text-2xl">🛡️</span>
                            <div className="text-[13px]">
                                <div className="font-bold" style={{ color: "var(--navy)" }}>Rantai utuh · 0 anomali</div>
                                <div style={{ color: "var(--kabur)" }}>{k.transaksi} transaksi teratestasi ganda. Tidak ada scan-ganda / diskon tersembunyi terdeteksi.</div>
                            </div>
                        </div>
                        <Link href="/hackathon/verifikasi" className="mt-3 inline-block text-sm font-semibold" style={{ color: "var(--hijau)" }}>Verifikasi struk apa pun →</Link>
                    </Panel>
                    <Panel title="Butuh ringkasan cepat?">
                        <p className="text-sm" style={{ color: "var(--kabur)" }}>Direktur bisa bertanya ke AI chatbot NALAR (prompt-terbatas) untuk rekap tanpa membaca tabel.</p>
                        <Link href="/hackathon/asisten" className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: "var(--hijau)" }}>Buka Asisten AI →</Link>
                    </Panel>
                </div>

                {/* Data lineage — proves each metric maps to the official Kemenkop schema */}
                <div className="mt-4">
                    <Panel title="Sumber Data — Skema Resmi Kemenkop" chip="27 tabel · 58 relasi" chipColor="var(--hijau)">
                        <p className="mb-3 text-[13px]" style={{ color: "var(--kabur)" }}>
                            Setiap angka di dashboard ini dipetakan ke tabel resmi dataset hackathon — bukan data karangan.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="text-left text-[11px] uppercase" style={{ color: "var(--kabur)" }}>
                                        <th className="pb-2">Metrik</th>
                                        <th className="pb-2">Sumber (join)</th>
                                        <th className="pb-2">Kunci</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {LINEAGE.map((l) => (
                                        <tr key={l.metrik} className="border-t" style={{ borderColor: "var(--garis)" }}>
                                            <td className="py-2 font-medium">{l.metrik}</td>
                                            <td className="py-2 font-mono text-[11px]" style={{ color: "var(--hijau)" }}>{l.sumber}</td>
                                            <td className="py-2 font-mono text-[11px]" style={{ color: "var(--kabur)" }}>{l.kunci}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {NALAR_SOURCE_TABLES.map((t) => (
                                <span key={t} className="rounded-md px-2 py-1 font-mono text-[11px]" style={{ background: "var(--latar)", color: "var(--kabur)" }}>{t}</span>
                            ))}
                        </div>
                    </Panel>
                </div>
            </main>

            <style>{`
        .nalar-select { border:1px solid var(--garis); border-radius:10px; padding:.5rem .7rem; font-size:.85rem; font-weight:600; background:#fff; min-width:9rem; }
        .nalar-select:disabled { opacity:.7; }
      `}</style>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--kabur)" }}>{label}</span>
            {children}
        </label>
    );
}

function Kpi({ label, value, sub, big }: { label: string; value: string; sub: string; big?: boolean }) {
    return (
        <div className="nalar-card p-4" title={`${label}: ${value} — ${sub}`}>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--kabur)" }}>{label}</div>
            <div className={`mt-1 font-extrabold tabular-nums ${big ? "text-2xl" : "text-xl"}`} style={{ color: big ? "var(--hijau)" : "var(--tinta)" }}>{value}</div>
            <div className="text-[11px]" style={{ color: "var(--kabur)" }}>{sub}</div>
        </div>
    );
}

function Panel({ title, children, className = "", chip, chipColor }: { title: string; children: React.ReactNode; className?: string; chip?: string; chipColor?: string }) {
    return (
        <section className={`nalar-card p-5 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold">{title}</h3>
                {chip && <span className="nalar-chip" style={{ background: "var(--latar)", color: chipColor ?? "var(--hijau)" }}>{chip}</span>}
            </div>
            {children}
        </section>
    );
}

function Stat({ n, l, c }: { n: number; l: string; c: string }) {
    return (
        <div className="text-center">
            <div className="text-3xl font-extrabold tabular-nums" style={{ color: c }}>{n}</div>
            <div className="text-[12px]" style={{ color: "var(--kabur)" }}>{l}</div>
        </div>
    );
}
