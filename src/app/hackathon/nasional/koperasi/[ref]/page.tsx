import Link from "next/link";
import { notFound } from "next/navigation";
import { getKoperasiByRef } from "@/lib/hackathon/national";

export const dynamic = "force-dynamic";

type DetailPageProps = { params: Promise<{ ref: string }> };

export default async function KoperasiDetailPage({ params }: DetailPageProps) {
    const { ref } = await params;
    const koperasi = await getKoperasiByRef(ref);
    if (!koperasi) notFound();

    const mapsHref = koperasi.lat !== null && koperasi.lng !== null
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${koperasi.lat},${koperasi.lng}`)}`
        : null;

    return (
        <div className="nalar-root min-h-screen">
            <header className="border-b" style={{ borderColor: "var(--garis)", background: "rgba(241,244,239,.9)" }}>
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
                    <Link href="/hackathon/nasional" className="text-sm font-bold" style={{ color: "var(--hijau)" }}>← Peta Nasional</Link>
                    <span className="text-xs font-semibold" style={{ color: "var(--kabur)" }}>Pusat Informasi Kopdes</span>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-5 py-8">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--kuning)" }}>Koperasi Desa / Kelurahan Merah Putih</p>
                <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{koperasi.nama}</h1>
                <p className="mt-2 text-sm" style={{ color: "var(--kabur)" }}>{koperasi.provinsi} · {koperasi.sektor}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                    <StatusChip active={koperasi.tx > 0} />
                    <span className="nalar-chip" style={{ background: "var(--kertas)", color: "var(--kabur)" }}>Ref: {koperasi.ref}</span>
                    {mapsHref && <a href={mapsHref} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ background: "var(--navy)" }}>Buka lokasi di Google Maps ↗</a>}
                </div>

                <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric label="Omzet transaksi" value={rupiah(koperasi.omzet)} />
                    <Metric label="Jumlah transaksi" value={angka(koperasi.tx)} />
                    <Metric label="Simpanan anggota" value={rupiah(koperasi.simpanan)} />
                    <Metric label="Anggota aktif" value={`${angka(koperasi.anggotaAktif)} / ${angka(koperasi.anggota)}`} />
                    <Metric label="Gerai aktif" value={`${angka(koperasi.geraiAktif)} / ${angka(koperasi.gerai)}`} />
                    <Metric label="Provinsi" value={koperasi.provinsi} />
                    <Metric label="Sektor usaha" value={koperasi.sektor} />
                    <Metric label="Koordinat" value={koperasi.lat !== null && koperasi.lng !== null ? `${koperasi.lat.toFixed(5)}, ${koperasi.lng.toFixed(5)}` : "Belum tersedia"} />
                </section>

                <p className="mt-7 text-xs" style={{ color: "var(--kabur)" }}>
                    Sumber data: database panitia hackathon, dibaca read-only dan di-cache. Data detail mengikuti pembaruan cache nasional.
                </p>
            </main>
        </div>
    );
}

function StatusChip({ active }: { active: boolean }) {
    return <span className="nalar-chip" style={{ background: active ? "var(--navy-terang)" : "#FFF7D6", color: active ? "var(--navy)" : "#8A6500" }}>{active ? "Sudah bertransaksi" : "Belum bertransaksi"}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
    return <div className="nalar-card p-4"><div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--kabur)" }}>{label}</div><div className="mt-2 break-words text-base font-extrabold">{value}</div></div>;
}

function angka(value: number) {
    return value.toLocaleString("id-ID");
}

function rupiah(value: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}
