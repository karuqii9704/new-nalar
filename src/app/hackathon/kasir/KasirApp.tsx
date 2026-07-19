"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCTS, SALES, type Kategori } from "@/lib/hackathon/seed";
import LogoutButton from "../_components/LogoutButton";
import type { NalarRole } from "@/lib/hackathon/auth";

const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const KATS: (Kategori | "all")[] = ["all", "minuman", "makanan", "perawatan", "rumah"];

interface Line { sku: string; qty: number }
interface Receipt { txId: string; total: number; tebusMurah: boolean }

export default function KasirApp({ role, nama, employeeId }: { role: NalarRole; nama: string; employeeId: string }) {
    const [salesId, setSalesId] = useState(employeeId);
    const [kat, setKat] = useState<Kategori | "all">("all");
    const [cart, setCart] = useState<Line[]>([]);
    const [busy, setBusy] = useState(false);
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const shown = useMemo(() => (kat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.kategori === kat)), [kat]);
    const total = cart.reduce((s, l) => s + (PRODUCTS.find((p) => p.sku === l.sku)!.harga * l.qty), 0);
    const hasPromoItem = cart.some((line) => PRODUCTS.find((product) => product.sku === line.sku)?.promo);

    function add(sku: string) {
        setReceipt(null);
        setCart((c) => {
            const ex = c.find((l) => l.sku === sku);
            return ex ? c.map((l) => (l.sku === sku ? { ...l, qty: l.qty + 1 } : l)) : [...c, { sku, qty: 1 }];
        });
    }
    function dec(sku: string) {
        setCart((c) => c.flatMap((l) => (l.sku === sku ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l])));
    }

    async function bayar() {
        if (!cart.length || busy) return;
        setBusy(true);
        setErr(null);
        try {
            const res = await fetch("/api/hackathon/sale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ salesId, items: cart }),
            });
            const data = await res.json();
            if (!res.ok) { setErr(data.error ?? "Gagal menyimpan transaksi."); }
            else { setReceipt({ txId: data.tx.txId, total: data.tx.total, tebusMurah: data.tx.tebusMurah }); setCart([]); }
        } catch {
            setErr("Koneksi gagal.");
        }
        setBusy(false);
    }

    return (
        <div className="nalar-root min-h-screen">
            <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: "var(--garis)", background: "rgba(241,244,239,.85)" }}>
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
                    <Link href="/hackathon/dashboard" className="flex items-center gap-2 font-extrabold">
                        <img src="/nalar-logo.jpg" alt="NALAR" className="h-8 w-8 rounded-lg object-cover object-left" />
                        <span>Kasir<span className="ml-1 text-xs font-semibold" style={{ color: "var(--kabur)" }}>SAKSI POS</span></span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/hackathon/dashboard" className="text-xs font-semibold" style={{ color: "var(--hijau)" }}>Dashboard →</Link>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-5xl gap-4 px-5 py-6 lg:grid-cols-[1.6fr_1fr]">
                {/* Product picker */}
                <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                        {KATS.map((k) => (
                            <button key={k} onClick={() => setKat(k)} className="rounded-full px-3 py-1.5 text-xs font-bold capitalize"
                                style={kat === k ? { background: "var(--hijau)", color: "#fff" } : { background: "#fff", border: "1px solid var(--garis)", color: "var(--kabur)" }}>
                                {k === "all" ? "Semua" : k}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {shown.map((p) => (
                            <button key={p.sku} onClick={() => add(p.sku)} className="nalar-card p-3 text-left transition active:scale-[.98]">
                                <div className="text-[13px] font-semibold leading-tight">{p.nama}</div>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-sm font-bold" style={{ color: "var(--hijau)" }}>{rp(p.harga)}</span>
                                    {p.promo && <span className="nalar-chip" style={{ background: "var(--kertas)", color: "var(--kuning)" }}>promo</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cart */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <div className="nalar-card p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold">Keranjang</h2>
                            <select value={salesId} onChange={(e) => setSalesId(e.target.value)} disabled={role === "sales"} className="rounded-lg border px-2 py-1 text-xs font-semibold" style={{ borderColor: "var(--garis)" }}>
                                {SALES.filter((s) => role !== "sales" || s.id === employeeId).map((s) => (
                                    <option key={s.id} value={s.id}>{s.nama}</option>
                                ))}
                            </select>
                        </div>

                        {cart.length === 0 && !receipt && <p className="mt-4 text-sm" style={{ color: "var(--kabur)" }}>Ketuk produk untuk menambah.</p>}

                        {cart.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {cart.map((l) => {
                                    const p = PRODUCTS.find((x) => x.sku === l.sku)!;
                                    return (
                                        <div key={l.sku} className="flex items-center gap-2 text-sm">
                                            <span className="flex-1 truncate">{p.nama}</span>
                                            <button onClick={() => dec(l.sku)} className="grid h-6 w-6 place-items-center rounded-md border" style={{ borderColor: "var(--garis)" }}>−</button>
                                            <span className="w-5 text-center tabular-nums">{l.qty}</span>
                                            <button onClick={() => add(l.sku)} className="grid h-6 w-6 place-items-center rounded-md border" style={{ borderColor: "var(--garis)" }}>+</button>
                                            <span className="w-20 text-right tabular-nums font-semibold">{rp(p.harga * l.qty)}</span>
                                        </div>
                                    );
                                })}
                                <div className="mt-3 flex items-baseline justify-between border-t pt-3" style={{ borderColor: "var(--garis)" }}>
                                    <span className="text-sm font-bold">TOTAL</span>
                                    <span className="text-2xl font-black tabular-nums" style={{ color: "var(--hijau)" }}>{rp(total)}</span>
                                </div>
                                {total > 50000 && (
                                    <p className="text-[12px]" style={{ color: "var(--kuning)" }}>
                                        {hasPromoItem
                                            ? "✓ Diskon Tebus Murah 40% otomatis diterapkan ke satu produk promo."
                                            : "Layak Tebus Murah — tambahkan satu produk berlabel promo untuk diskon 40%."}
                                    </p>
                                )}
                                <button onClick={bayar} disabled={busy} className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60" style={{ background: "var(--hijau)" }}>
                                    {busy ? "Menyimpan…" : "Bayar & Terbitkan Struk"}
                                </button>
                            </div>
                        )}

                        {err && <p className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: "#FBE9E7", color: "var(--merah)" }}>{err}</p>}

                        {receipt && (
                            <div className="mt-4 rounded-xl p-4" style={{ background: "var(--hijau-terang)" }}>
                                <div className="text-sm font-extrabold" style={{ color: "var(--hijau)" }}>✅ Struk terbit & tercatat</div>
                                <div className="mt-1 font-mono text-xs" style={{ color: "var(--kabur)" }}>{receipt.txId} · {rp(receipt.total)}</div>
                                <p className="mt-2 text-[12px]" style={{ color: "var(--kabur)" }}>Angka ini <strong>langsung masuk</strong> dashboard NALAR & bisa ditanyakan direktur.</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Link href={`/hackathon/pelanggan/struk/${receipt.txId}`} className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ background: "var(--hijau)" }}>Struk pelanggan →</Link>
                                    <Link href="/hackathon/dashboard" className="rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: "var(--hijau)", color: "var(--hijau)" }}>Lihat dashboard →</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="mt-3 px-1 text-[11px]" style={{ color: "var(--kabur)" }}>Kasir: {nama}. Setiap transaksi teratestasi & masuk rantai hash SAKSI.</p>
                </div>
            </main>
        </div>
    );
}
