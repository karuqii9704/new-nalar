import Link from "next/link";
import { sampleReceiptIds } from "@/lib/hackathon/analytics";
import VerifyForm from "./VerifyForm";

export default function VerifikasiPage() {
    const samples = sampleReceiptIds(3);
    return (
        <div className="nalar-root min-h-screen">
            <nav className="border-b" style={{ borderColor: "var(--garis)" }}>
                <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
                    <Link href="/hackathon" className="flex items-center gap-2 font-extrabold">
                        <img src="/nalar-logo.jpg" alt="NALAR" className="h-8 w-8 rounded-lg object-cover object-left" />
                        NALAR
                    </Link>
                    <Link href="/hackathon/login" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: "var(--hijau)" }}>Masuk</Link>
                </div>
            </nav>

            <main className="mx-auto max-w-3xl px-5 py-10">
                <span className="nalar-chip" style={{ background: "var(--hijau-terang)", color: "var(--hijau)" }}>Fitur SAKSI · Integritas · Tanpa login</span>
                <h1 className="mt-4 text-3xl font-extrabold">Cek Keaslian Struk</h1>
                <p className="mt-2 text-sm" style={{ color: "var(--kabur)" }}>
                    Siapa pun bisa memverifikasi struk koperasi. Sistem menghitung ulang rantai hash transaksi — bila cocok, struk <strong>ASLI</strong>; bila ada yang mengubah data diam-diam, struk <strong>TIDAK COCOK</strong>. Inilah yang membuat angka di dashboard NALAR jujur.
                </p>

                <VerifyForm samples={samples} />

                <div className="mt-8 nalar-card p-5">
                    <h3 className="text-sm font-bold">Kenapa ini penting untuk usaha koperasi?</h3>
                    <p className="mt-2 text-[13px]" style={{ color: "var(--kabur)" }}>
                        Kasir tak bisa scan 1 barang 2× atau menyembunyikan diskon promo — setiap upaya terdeteksi saat verifikasi.
                        Data penjualan yang bersih inilah yang dianalisis NALAR menjadi keputusan bisnis. <em>Insight dari data kotor hanya menyesatkan.</em>
                    </p>
                </div>
            </main>
        </div>
    );
}
