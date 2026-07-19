import Link from "next/link";
import { kpi, healthScore, promoConversion, rp, rpShort } from "@/lib/hackathon/analytics";
import { KOPERASI, DATES } from "@/lib/hackathon/seed";

export default function HackathonLanding() {
    const total = kpi({});
    const health = healthScore();
    const topPromo = promoConversion()[0];

    return (
        <div className="nalar-root">
            <SiteNav />

            {/* Hero */}
            <header className="relative overflow-hidden">
                <div
                    className="absolute inset-0 -z-10"
                    style={{ background: "radial-gradient(1200px 400px at 20% -10%, #E7F1EB 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FAF6EC 0%, transparent 55%)" }}
                />
                <div className="mx-auto max-w-6xl px-5 pt-14 pb-12 sm:pt-20">
                    <div className="nalar-rise max-w-3xl">
                        <div className="flex flex-wrap gap-2">
                            <span className="nalar-chip" style={{ background: "var(--hijau-terang)", color: "var(--hijau)" }}>
                                ● Hackathon Kementerian Koperasi 2026 · Elaborasi Tema 1 · 2 · 3
                            </span>
                            <span className="nalar-chip" style={{ background: "var(--kertas)", color: "var(--kuning)" }}>
                                Selaras skema resmi Kemenkop · 27 tabel · 58 relasi
                            </span>
                        </div>
                        <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
                            Dari transaksi tepercaya,<br />
                            <span style={{ color: "var(--hijau)" }}>menjadi keputusan yang bisa dijalankan.</span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg" style={{ color: "var(--kabur)" }}>
                            <strong>NALAR</strong> mengubah data koperasi jadi keputusan: <strong>N</strong>avigasi,
                            {" "}<strong>A</strong>ktivitas, <strong>L</strong>aporan, <strong>A</strong>nalisa, <strong>R</strong>ekomendasi
                            — semuanya berdiri di atas data yang dijamin jujur lewat fitur <strong>SAKSI</strong>.
                        </p>
                        <p className="mt-3 max-w-2xl text-sm font-medium" style={{ color: "var(--kabur)" }}>
                            Untuk <strong>manager gerai</strong>, NALAR mengubah sinyal operasional menjadi prioritas eksekusi.
                            Untuk <strong>direktur</strong>, NALAR menyajikan brief keputusan yang ringkas, beralasan, dan siap ditindaklanjuti.
                        </p>
                        <p className="mt-3 text-sm font-semibold italic" style={{ color: "var(--hijau-aksi)" }}>
                            “Setiap Rupiah Ada Saksinya, Setiap Keputusan Ada Dasarnya.”
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/hackathon/login"
                                className="rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
                                style={{ background: "var(--hijau)" }}
                            >
                                Masuk Dashboard →
                            </Link>
                            <Link
                                href="/hackathon/verifikasi"
                                className="rounded-xl border px-6 py-3.5 text-sm font-bold transition hover:bg-white"
                                style={{ borderColor: "var(--garis)", color: "var(--hijau)" }}
                            >
                                Cek Struk (tanpa login)
                            </Link>
                        </div>
                    </div>

                    {/* Live metric strip — proves the engine is real */}
                    <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Metric label="Omzet 14 hari" value={rpShort(total.omzet)} sub={`${total.transaksi} transaksi teratestasi`} />
                        <Metric label="Skor Kesehatan Koperasi" value={`${health.skor}/100`} sub={health.status} />
                        <Metric label="Konversi Tebus Murah" value={`${Math.round(topPromo.rasio * 100)}%`} sub={`${topPromo.sales.nama.split(" ")[0]} (${topPromo.konversi}/${topPromo.dilayani})`} />
                        <Metric label="Integritas Ledger" value="100%" sub="anti scan-ganda (SAKSI)" />
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-6xl px-5 pt-2">
                <div className="grid gap-px overflow-hidden rounded-2xl border md:grid-cols-3" style={{ borderColor: "var(--garis)", background: "var(--garis)" }}>
                    <ValueCard eyebrow="01 · TRUSTED INPUT" title="Data yang dapat diverifikasi" d="SAKSI menjaga transaksi dan diskon tetap dapat ditelusuri, sehingga rekomendasi NALAR tidak berangkat dari data kotor." />
                    <ValueCard eyebrow="02 · DECISION ENGINE" title="Rekomendasi yang dapat dijelaskan" d="Bukan hanya grafik: NALAR menunjukkan prioritas, alasan, dan langkah yang dapat dilakukan pada shift berikutnya." />
                    <ValueCard eyebrow="03 · HUMAN CONTROL" title="Otomasi tanpa melepas kendali" d="Sistem mengusulkan. Manager dan direktur tetap menyetujui, mengubah, atau menolak keputusan." />
                </div>
            </section>

            {/* Problem */}
            <section className="mx-auto max-w-6xl px-5 py-14">
                <SectionTitle kicker="Masalah" title="Koperasi tahu ada uang masuk — tapi buta arah bisnis" />
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <Problem n="01" t="Data tidak bisa dipercaya" d="Pencatatan di satu tangan bisa diedit diam-diam. Insight dari data kotor hanya menyesatkan keputusan." />
                    <Problem n="02" t="Manajemen ambil keputusan pakai feeling" d="Tidak tahu produk apa laku, sales mana perform, kapan jam ramai, promo mana efektif → stok mati, omzet stagnan." />
                    <Problem n="03" t="Pengurus senior gaptek" d="Direktur harus mengawasi & memutuskan, tapi alergi tabel mentah. Butuh jawaban dalam bahasa manusia." />
                </div>
            </section>

            {/* NALAR — lima kemampuan + fondasi SAKSI */}
            <section className="mx-auto max-w-6xl px-5 py-6">
                <SectionTitle kicker="Solusi" title="NALAR — satu sistem, lima kemampuan" />
                <p className="mt-3 max-w-2xl text-sm" style={{ color: "var(--kabur)" }}>
                    <strong>NALAR</strong> = <strong>N</strong>avigasi · <strong>A</strong>ktivitas · <strong>L</strong>aporan · <strong>A</strong>nalisa · <strong>R</strong>ekomendasi.
                    Kelimanya berdiri di atas satu fondasi: data yang dijamin jujur oleh fitur <strong>SAKSI</strong>.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Cap letter="N" name="Navigasi" d="Monitoring nasional 1.026 koperasi + peta sebaran per wilayah & sektor." href="/hackathon/nasional" />
                    <Cap letter="A" name="Aktivitas" d="Kehadiran karyawan, rating pelanggan, transaksi & loyalti anggota." href="/hackathon/dashboard" />
                    <Cap letter="L" name="Laporan" d="Rekap otomatis, unduh CSV, laporan audit harian." href="/hackathon/dashboard" />
                    <Cap letter="A" name="Analisa" d="BI dashboard, skor kesehatan, prediksi omzet musiman." href="/hackathon/dashboard" />
                    <Cap letter="R" name="Rekomendasi" d="Produk, piket, restock + chatbot direktur grounded." href="/hackathon/asisten" />
                </div>

                {/* Fondasi: SAKSI (integritas data) */}
                <div className="mt-5 flex flex-col gap-5 rounded-2xl p-7 sm:flex-row sm:items-center" style={{ background: "var(--navy)", color: "#fff" }}>
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#A9C2E6" }}>Fondasi · Integritas data</div>
                        <div className="mt-2 flex items-baseline gap-3">
                            <h3 className="text-3xl font-black">SAKSI</h3>
                            <span className="text-sm font-semibold" style={{ color: "#CBD9EE" }}>data lahir jujur</span>
                        </div>
                        <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,.85)" }}>
                            Setiap transaksi terkunci rantai hash (bukan blockchain) & meninggalkan struk terverifikasi — kasir tak bisa scan-ganda atau sembunyikan diskon. Inilah data jujur yang membuat kelima kemampuan NALAR bisa dipercaya.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {["Rantai hash anti-utak-atik", "Struk publik: ASLI / TIDAK COCOK", "Offline-first, tanpa blockchain"].map((p) => (
                                <span key={p} className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: "rgba(255,255,255,.12)", color: "#E7EEF8" }}>✓ {p}</span>
                            ))}
                        </div>
                    </div>
                    <Link href="/hackathon/verifikasi" className="inline-block shrink-0 self-start rounded-xl px-5 py-2.5 text-sm font-bold transition hover:brightness-105 sm:self-center" style={{ background: "#fff", color: "var(--navy)" }}>
                        Coba verifikasi struk →
                    </Link>
                </div>
            </section>

            {/* Elaborasi tiga tema */}
            <section className="mx-auto max-w-6xl px-5 py-14">
                <SectionTitle kicker="Elaborasi Tema 1 · 2 · 3" title="Satu sistem, menjawab ketiga tema — berakar di Tema 1" />
                <p className="mt-3 max-w-2xl text-sm" style={{ color: "var(--kabur)" }}>
                    NALAR dibangun penuh untuk <strong>Tema 1</strong> (enam contoh solusi, semuanya jadi), lalu komponen yang sama meluas ke <strong>Tema 2 &amp; 3</strong>.
                    Tanda <span style={{ color: "var(--navy)" }}>✓</span> = sudah berjalan di demo, <span style={{ color: "var(--kabur)" }}>○</span> = ekstensi terpetakan.
                </p>
                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                    <ThemeCol n="1" accent="var(--hijau)" tema="Peningkatan Usaha Koperasi Melalui Teknologi Digital"
                        items={[
                            { on: true, t: "Business Intelligence Dashboard", d: "penjualan, kehadiran, audit harian, detail SKU" },
                            { on: true, t: "AI Business Recommendation", d: "produk didorong, piket prime-time, alert restock" },
                            { on: true, t: "Monitoring Kesehatan Koperasi", d: "skor komposit 0–100" },
                            { on: true, t: "Predictive Analytics", d: "prediksi omzet musiman · MAPE 14%" },
                            { on: true, t: "Digitalisasi Operasional", d: "POS gerai berstruk SAKSI" },
                            { on: true, t: "Smart Decision Support System", d: "chatbot direktur grounded" },
                        ]} />
                    <ThemeCol n="2" accent="var(--navy)" tema="Optimalisasi Potensi Desa Melalui Koperasi"
                        items={[
                            { on: true, t: "Smart Village/Koperasi Analytics", d: "monitoring 1.026 koperasi per provinsi & sektor KBLI" },
                            { on: true, t: "Village Potential Mapping", d: "peta sebaran + status transaksi per wilayah" },
                            { on: true, t: "AI Commodity Recommendation", d: "produk terlaris nasional + rekomendasi" },
                            { on: false, t: "Marketplace & Business Matching", d: "roadmap: pertemukan koperasi ↔ offtaker" },
                            { on: false, t: "Supply Chain Monitoring", d: "roadmap: rantai pasok komoditas desa" },
                        ]} />
                    <ThemeCol n="3" accent="#B26A00" tema="Peningkatan Keterlibatan Masyarakat dalam Berkoperasi"
                        items={[
                            { on: true, t: "Loyalty & Reward System", d: "poin, tier Perunggu→Perak→Emas, total hemat" },
                            { on: true, t: "Super App Anggota Koperasi", d: "struk digital, promo, loyalti, cek keaslian" },
                            { on: true, t: "Community Engagement & Transparansi", d: "anggota jadi SAKSI: verifikasi struk sendiri" },
                            { on: true, t: "Gamifikasi Aktivitas (ringan)", d: "progres tier & lencana Tebus Murah" },
                            { on: false, t: "Digital Voting & e-RAT", d: "roadmap: RAT digital anggota" },
                            { on: false, t: "AI Member Assistant", d: "roadmap: asisten khusus anggota" },
                        ]} />
                </div>
            </section>

            {/* Judge accounts */}
            <section className="mx-auto max-w-6xl px-5 pb-16">
                <div className="nalar-card overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
                        <div className="p-8">
                            <span className="nalar-chip" style={{ background: "var(--kertas)", color: "var(--kuning)" }}>Akun Demo Juri</span>
                            <h3 className="mt-4 text-2xl font-bold">Coba tiga peran sekarang</h3>
                            <p className="mt-2 text-sm" style={{ color: "var(--kabur)" }}>
                                Login membedakan peran: direktur tidak melihat tabel mentah, sales hanya melihat performa sendiri.
                                Data demo: <strong>{KOPERASI.nama}</strong> · {DATES[0]} s/d {DATES[DATES.length - 1]}.
                            </p>
                            <Link href="/hackathon/login" className="mt-6 inline-block rounded-xl px-5 py-3 text-sm font-bold text-white" style={{ background: "var(--hijau)" }}>
                                Buka halaman login →
                            </Link>
                        </div>
                        <div className="border-t p-8 md:border-l md:border-t-0" style={{ borderColor: "var(--garis)", background: "var(--latar)" }}>
                            <Cred role="Store Manager" user="manager.demo" pin="444444" />
                            <Cred role="Direktur" user="direktur.demo" pin="555555" />
                            <Cred role="Sales Gerai" user="sales.demo" pin="666666" />
                            <div className="flex items-center justify-between py-2.5 text-sm">
                                <span className="font-semibold">Pelanggan Gerai</span>
                                <Link href="/hackathon/pelanggan" className="font-semibold" style={{ color: "var(--hijau)" }}>buka app →</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t" style={{ borderColor: "var(--garis)" }}>
                <div className="mx-auto max-w-6xl px-5 py-8 text-sm" style={{ color: "var(--kabur)" }}>
                    <p className="font-bold" style={{ color: "var(--tinta)" }}>NALAR — Navigasi · Aktivitas · Laporan · Analisa · Rekomendasi</p>
                    <p className="mt-1">Prototipe Hackathon Kementerian Koperasi 2026 — berakar di Tema 1 (Peningkatan Usaha Koperasi Melalui Teknologi Digital), meluas ke Tema 2 (Optimalisasi Potensi Desa) &amp; Tema 3 (Keterlibatan Masyarakat). Data operasional gerai pada demo ini sintetis; data nasional dari dataset resmi panitia.</p>
                    <p className="mt-3 text-xs">Dibangun di atas plusthe.site · hackathon.plusthe.site</p>
                </div>
            </footer>
        </div>
    );
}

function SiteNav() {
    return (
        <nav className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: "var(--garis)", background: "rgba(246,243,242,.85)" }}>
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
                <Link href="/hackathon" className="flex items-center gap-2.5 font-extrabold tracking-tight">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/nalar-logo.jpg" alt="NALAR" className="h-8 w-auto" />
                </Link>
                <div className="flex items-center gap-2">
                    <Link href="/hackathon/nasional" className="hidden rounded-lg px-3 py-2 text-sm font-semibold sm:block" style={{ color: "var(--hijau)" }}>Nasional</Link>
                    <Link href="/hackathon/pelanggan" className="hidden rounded-lg px-3 py-2 text-sm font-semibold sm:block" style={{ color: "var(--hijau)" }}>Pelanggan</Link>
                    <Link href="/hackathon/verifikasi" className="hidden rounded-lg px-3 py-2 text-sm font-semibold sm:block" style={{ color: "var(--hijau)" }}>Cek Struk</Link>
                    <Link href="/hackathon/login" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: "var(--hijau)" }}>Masuk</Link>

                    {/* Mobile menu — pure-CSS disclosure (no client JS needed) */}
                    <details className="nalar-menu relative sm:hidden">
                        <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg border" style={{ borderColor: "var(--garis)", color: "var(--hijau)" }} aria-label="Menu">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                        </summary>
                        <div className="nalar-card absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden p-1.5 shadow-lg">
                            <Link href="/hackathon/nasional" className="block rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ color: "var(--tinta)" }}>📊 Monitoring Nasional</Link>
                            <Link href="/hackathon/pelanggan" className="block rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ color: "var(--tinta)" }}>🛍️ App Pelanggan</Link>
                            <Link href="/hackathon/verifikasi" className="block rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ color: "var(--tinta)" }}>🛡️ Cek Struk</Link>
                        </div>
                    </details>
                </div>
            </div>
        </nav>
    );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="nalar-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--kabur)" }}>{label}</div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: "var(--hijau)" }}>{value}</div>
            <div className="text-[11px]" style={{ color: "var(--kabur)" }}>{sub}</div>
        </div>
    );
}

function ValueCard({ eyebrow, title, d }: { eyebrow: string; title: string; d: string }) {
    return (
        <div className="bg-white p-6">
            <div className="text-[10px] font-bold tracking-[0.14em]" style={{ color: "var(--hijau)" }}>{eyebrow}</div>
            <h3 className="mt-3 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--kabur)" }}>{d}</p>
        </div>
    );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
    return (
        <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--kuning)" }}>{kicker}</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        </div>
    );
}

function Problem({ n, t, d }: { n: string; t: string; d: string }) {
    return (
        <div className="nalar-card p-6">
            <div className="text-3xl font-black" style={{ color: "var(--garis)" }}>{n}</div>
            <h3 className="mt-2 text-lg font-bold">{t}</h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--kabur)" }}>{d}</p>
        </div>
    );
}

function Cap({ letter, name, d, href }: { letter: string; name: string; d: string; href: string }) {
    return (
        <Link href={href} className="nalar-card flex flex-col p-5 transition hover:brightness-[1.02] active:scale-[.99]">
            <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg font-black text-white" style={{ background: "var(--hijau)" }}>{letter}</span>
                <h3 className="font-bold">{name}</h3>
            </div>
            <p className="mt-3 text-[13px]" style={{ color: "var(--kabur)" }}>{d}</p>
        </Link>
    );
}

function ThemeCol({ n, accent, tema, items }: {
    n: string; accent: string; tema: string; items: { on: boolean; t: string; d: string }[];
}) {
    const jadi = items.filter((i) => i.on).length;
    return (
        <div className="nalar-card flex flex-col p-5" style={{ borderTop: `3px solid ${accent}` }}>
            <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black" style={{ color: accent }}>{n}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--kabur)" }}>Tema {n}</span>
                <span className="nalar-chip ml-auto" style={{ background: "var(--latar)", color: "var(--kabur)" }}>{jadi}/{items.length} jadi</span>
            </div>
            <h3 className="mt-2 text-[15px] font-bold leading-snug" style={{ minHeight: "2.6em" }}>{tema}</h3>
            <ul className="mt-3 flex flex-col gap-2">
                {items.map((i) => (
                    <li key={i.t} className="flex items-start gap-2 text-[13px]">
                        <span className="mt-0.5 shrink-0 font-bold" style={{ color: i.on ? "var(--navy)" : "var(--kabur)" }}>{i.on ? "✓" : "○"}</span>
                        <span>
                            <span className="font-semibold" style={{ color: i.on ? "var(--tinta)" : "var(--kabur)" }}>{i.t}</span>
                            <span style={{ color: "var(--kabur)" }}> — {i.d}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Cred({ role, user, pin }: { role: string; user: string; pin: string }) {
    return (
        <div className="flex items-center justify-between border-b py-2.5 last:border-0" style={{ borderColor: "var(--garis)" }}>
            <span className="text-sm font-semibold">{role}</span>
            <span className="font-mono text-[13px]" style={{ color: "var(--kabur)" }}>{user} · {pin}</span>
        </div>
    );
}
