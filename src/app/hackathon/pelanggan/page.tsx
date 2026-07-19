import Link from "next/link";
import { DEMO_CUSTOMER, customerReceipts, customerInsights, loyalty, CUSTOMER_PROMOS } from "@/lib/hackathon/customer";
import ReceiptList from "./ReceiptList";
import PelangganInsights from "./PelangganInsights";

const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const rpShort = (n: number) => (n >= 1_000_000 ? "Rp " + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " jt" : n >= 1000 ? "Rp " + Math.round(n / 1000) + " rb" : "Rp " + n);

export default function PelangganHome() {
    const c = DEMO_CUSTOMER;
    const l = loyalty();
    const ins = customerInsights();
    const receipts = customerReceipts();
    // Tier ladder: Perunggu → Perak (200) → Emas (800).
    const next = l.poin < 200 ? 200 : l.poin < 800 ? 800 : null;
    const floor = l.poin < 200 ? 0 : 200;
    const progress = next ? Math.min(100, Math.round(((l.poin - floor) / (next - floor)) * 100)) : 100;
    const nextTier = l.poin < 200 ? "Perak" : "Emas";

    // Warna chip mengikuti tier (perunggu / perak / emas) — bukan selalu emas.
    const TIER_STYLE: Record<string, { bg: string; fg: string }> = {
        Perunggu: { bg: "#C67F3A", fg: "#2A1500" },
        Perak: { bg: "#D3D8DD", fg: "#2D2D2D" },
        Emas: { bg: "#F2B807", fg: "#3A2C00" },
    };
    const tierS = TIER_STYLE[l.tier] ?? TIER_STYLE.Perunggu;

    // Lencana diturunkan dari data nyata (bukan karangan).
    const badges = [
        { emoji: "🛡️", label: "Saksi Terverifikasi", on: true },
        { emoji: "💸", label: "Hemat Hero", on: ins.hemat > 0 },
        { emoji: "🏷️", label: `Kolektor Tebus ×${ins.tebusCount}`, on: ins.tebusCount > 0 },
        { emoji: "🔁", label: "Pelanggan Setia", on: ins.transaksi >= 5 },
    ].filter((b) => b.on);

    return (
        <div className="nalar-root mx-auto min-h-screen max-w-md pb-24">
            {/* Greeting header */}
            <header className="rounded-b-3xl px-5 pb-8 pt-6 text-white" style={{ background: "linear-gradient(160deg, var(--hijau) 0%, var(--hijau-aksi) 100%)" }}>
                <div className="flex items-center justify-between">
                    <Link href="/hackathon" className="text-sm font-semibold opacity-90">← NALAR</Link>
                    <span className="nalar-chip" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>Kartu {c.kartu}</span>
                </div>
                <p className="mt-5 text-sm opacity-90">Selamat datang,</p>
                <h1 className="text-2xl font-extrabold">{c.nama}</h1>
                <p className="text-xs opacity-80">Anggota koperasi sejak {c.anggotaSejak}</p>

                {/* Loyalty card — big number (UI law: nominal = elemen terbesar) */}
                <div className="mt-5 rounded-2xl bg-white/12 p-4 backdrop-blur">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-xs opacity-80">Poin Loyalti</div>
                            <div className="text-4xl font-black tabular-nums">{l.poin.toLocaleString("id-ID")}</div>
                        </div>
                        <div className="text-right">
                            <div className="nalar-chip" style={{ background: tierS.bg, color: tierS.fg }}>Tier {l.tier}</div>
                            <div className="mt-1 text-xs opacity-85">Total hemat {rp(l.hemat)}</div>
                        </div>
                    </div>
                    {/* Tier progress */}
                    <div className="mt-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                            <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-1.5 text-[11px] opacity-90">
                            {next ? <>{(next - l.poin).toLocaleString("id-ID")} poin lagi menuju <strong>Tier {nextTier}</strong></> : <>Tier tertinggi tercapai 🎉</>}
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-5">
                {/* Quick actions — max simple, big tap targets */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Action href={`/hackathon/pelanggan/struk/${receipts[0]?.txId ?? ""}`} icon="🧾" label="Struk Terakhir" />
                    <Action href="/hackathon/verifikasi" icon="🛡️" label="Cek Keaslian" />
                </div>

                {/* Ringkasan belanja — insight dari struk teratestasi */}
                <h2 className="mt-7 text-sm font-bold">Ringkasan Belanjamu</h2>
                <p className="mb-3 text-[12px]" style={{ color: "var(--kabur)" }}>Dihitung dari {ins.transaksi} struk teratestasi SAKSI — angka nyata, bukan karangan.</p>
                <PelangganInsights ins={ins} />

                {/* Dampak keanggotaan — Tema 3: keterlibatan → manfaat koperasi */}
                <h2 className="mt-7 text-sm font-bold">Dampak Keanggotaanmu</h2>
                <div className="mt-3 overflow-hidden rounded-2xl p-5 text-white" style={{ background: "linear-gradient(150deg, var(--navy) 0%, #12294d 100%)" }}>
                    <p className="text-sm opacity-90">Belanjamu bukan sekadar transaksi — kamu ikut menghidupi koperasi.</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-[11px] opacity-80">Nilai transaksi kamu</div>
                            <div className="text-2xl font-black tabular-nums">{rpShort(ins.belanja)}</div>
                            <div className="text-[11px] opacity-75">omzet untuk gerai</div>
                        </div>
                        <div>
                            <div className="text-[11px] opacity-80">Kontribusi ke SHU</div>
                            <div className="text-2xl font-black tabular-nums" style={{ color: "#F2B807" }}>{rpShort(ins.margin)}</div>
                            <div className="text-[11px] opacity-75">margin koperasi dari belanjamu</div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 p-3 text-[12px]">
                        <span>🛡️</span>
                        <span className="opacity-90">Tiap rupiah tercatat jujur lewat <strong>SAKSI</strong> — kamu jadi saksinya. Keuntungan koperasi kembali ke anggota sebagai <strong>SHU</strong>.</span>
                    </div>
                </div>

                {/* Misi & lencana — gamifikasi keterlibatan */}
                <h2 className="mt-7 text-sm font-bold">Misi &amp; Lencana</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                    {badges.map((b) => (
                        <span key={b.label} className="nalar-chip" style={{ background: "var(--navy-terang)", color: "var(--navy)" }}>{b.emoji} {b.label}</span>
                    ))}
                </div>
                <div className="mt-3 space-y-2">
                    <Misi icon="⭐" teks={next ? <>Belanja <strong>{(next - l.poin).toLocaleString("id-ID")} poin</strong> lagi untuk naik ke <strong>Tier {nextTier}</strong>.</> : <>Kamu di tier tertinggi — pertahankan!</>} progress={progress} />
                    <Misi icon="📱" teks={<>Bayar pakai <strong>QRIS</strong> di kunjungan berikutnya untuk transaksi lebih cepat &amp; tercatat rapi.</>} />
                    <Misi icon="🤝" teks={<>Ajak <strong>1 tetangga</strong> jadi anggota — perkuat koperasi desamu.</>} />
                </div>

                {/* Promo untukmu */}
                <h2 className="mt-7 text-sm font-bold">Promo untukmu</h2>
                <div className="mt-3 space-y-3">
                    {CUSTOMER_PROMOS.map((p) => (
                        <div key={p.id} className="nalar-card flex items-start gap-3 p-4">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl" style={{ background: "var(--kertas)" }}>
                                {p.jenis === "tebus_murah" ? "🏷️" : "🗓️"}
                            </span>
                            <div>
                                <div className="font-bold">{p.nama}</div>
                                <p className="text-[13px]" style={{ color: "var(--kabur)" }}>{p.syarat}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Struk Saya */}
                <h2 className="mt-7 text-sm font-bold">Struk Saya</h2>
                <div className="mt-3">
                    <ReceiptList receipts={receipts} />
                </div>

                <p className="mt-6 text-center text-[11px]" style={{ color: "var(--kabur)" }}>
                    Setiap struk teratestasi SAKSI — buktinya ada di tanganmu.
                </p>
            </main>
        </div>
    );
}

function Action({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link href={href} className="nalar-card flex flex-col items-center gap-1.5 p-4 text-center transition active:scale-[.98]">
            <span className="text-2xl">{icon}</span>
            <span className="text-[13px] font-semibold">{label}</span>
        </Link>
    );
}

function Misi({ icon, teks, progress }: { icon: string; teks: React.ReactNode; progress?: number }) {
    return (
        <div className="nalar-card flex items-start gap-3 p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg" style={{ background: "var(--kertas)" }}>{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-[13px]" style={{ color: "var(--tinta)" }}>{teks}</p>
                {progress !== undefined && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--garis)" }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "var(--hijau)" }} />
                    </div>
                )}
            </div>
        </div>
    );
}
