import Link from "next/link";
import { notFound } from "next/navigation";
import { customerReceipt, DEMO_CUSTOMER } from "@/lib/hackathon/customer";
import { verifyReceipt } from "@/lib/hackathon/analytics";
import { hydrateLive } from "@/lib/hackathon/store";
import { KOPERASI } from "@/lib/hackathon/seed";
import ReceiptActions from "./ReceiptActions";

const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

export const dynamic = "force-dynamic";

export default async function StrukPage({ params }: { params: Promise<{ txId: string }> }) {
    const { txId } = await params;
    await hydrateLive();
    const r = customerReceipt(txId);
    if (!r) notFound();
    const asli = verifyReceipt(r.txId).status === "asli";
    const subtotal = r.items.reduce((s, it) => s + it.harga * it.qty, 0);

    return (
        <div className="nalar-root mx-auto min-h-screen max-w-md px-5 pb-28 pt-5">
            <Link href="/hackathon/pelanggan" className="text-sm font-semibold" style={{ color: "var(--hijau)" }}>← Struk Saya</Link>

            {/* Receipt — thermal paper feel (kertas token) */}
            <div className="mt-4 overflow-hidden rounded-2xl" style={{ background: "var(--kertas)", border: "1px solid var(--garis)" }}>
                <div className="px-5 pt-5 text-center">
                    <div className="text-lg font-black tracking-tight">KDMP BENTANGAN</div>
                    <div className="text-[11px]" style={{ color: "var(--kabur)" }}>Gerai Sembako Bentangan 01 · Klaten</div>
                </div>

                {/* Verified stamp */}
                <div className="mx-5 mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5" style={asli ? { background: "var(--navy-terang)", color: "var(--navy)" } : { background: "#FBE9E7", color: "var(--merah)" }}>
                    <span className="text-lg">{asli ? "✅" : "⛔"}</span>
                    <span className="text-sm font-extrabold">{asli ? "STRUK ASLI — TERCATAT" : "STRUK TIDAK COCOK"}</span>
                </div>

                <div className="px-5 py-4 font-mono text-[13px]">
                    <div className="flex justify-between" style={{ color: "var(--kabur)" }}>
                        <span>{r.tgl} {String(r.jam).padStart(2, "0")}:00</span>
                        <span>{r.txId}</span>
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: "var(--kabur)" }}>Nomor koperasi · {KOPERASI.koperasiRef}</div>
                    <div className="mt-1" style={{ color: "var(--kabur)" }}>Kasir/Sales: {r.sales} · Pelanggan: {DEMO_CUSTOMER.nama}</div>
                    <div className="my-3 border-t border-dashed" style={{ borderColor: "#D9CFB4" }} />
                    {r.items.map((it, i) => (
                        <div key={i} className="mb-1.5">
                            <div className="flex justify-between">
                                <span>{it.nama}</span>
                                <span className="tabular-nums">{rp(it.harga * it.qty)}</span>
                            </div>
                            <div className="flex justify-between text-[11px]" style={{ color: "var(--kabur)" }}>
                                <span>{it.qty} {it.unit} × {rp(it.harga)}{it.diskon > 0 && ` · diskon ${rp(it.diskon)}`}</span>
                                <span className="font-mono">{it.barcode}</span>
                            </div>
                        </div>
                    ))}
                    <div className="my-3 border-t border-dashed" style={{ borderColor: "#D9CFB4" }} />
                    <div className="flex justify-between text-[12px]" style={{ color: "var(--kabur)" }}>
                        <span>Subtotal</span><span className="tabular-nums">{rp(subtotal)}</span>
                    </div>
                    {r.hemat > 0 && (
                        <div className="flex justify-between text-[12px]" style={{ color: "var(--hijau)" }}>
                            <span>Hemat (Tebus Murah)</span><span className="tabular-nums">− {rp(r.hemat)}</span>
                        </div>
                    )}
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-sm font-bold">TOTAL</span>
                        <span className="text-2xl font-black tabular-nums">{rp(r.total)}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px]" style={{ color: "var(--kabur)" }}>
                        <span>Pembayaran: {r.metode}</span>
                        <span>Status: Lunas</span>
                    </div>
                </div>

                {/* Hash proof + stamp */}
                <div className="border-t px-5 py-3 text-center" style={{ borderColor: "#D9CFB4" }}>
                    <div className="inline-block rotate-[-4deg] rounded-lg border-2 px-3 py-1 text-xs font-black tracking-wider" style={{ borderColor: "var(--navy)", color: "var(--navy)" }}>
                        TERCATAT ✓
                    </div>
                    <div className="mt-2 font-mono text-[10px] break-all" style={{ color: "var(--kabur)" }}>Kode bukti: {r.txHash}</div>
                </div>
            </div>

            <ReceiptActions
                txId={r.txId}
                sales={r.sales}
                total={r.total}
                customerNama={DEMO_CUSTOMER.nama}
            />
        </div>
    );
}
