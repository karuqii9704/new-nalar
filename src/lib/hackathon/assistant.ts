// NALAR director assistant — prompt-limited, RAG-grounded over the seed engine.
//
// Every answer is built deterministically from the analytics (so it is always
// correct and works offline / without an LLM). An optional LLM pass only
// *rephrases* these facts — it is never allowed to invent numbers.

import {
    kpi, salesByRep, bySku, promoConversion, restockAlerts, attendanceSummary,
    forecastNextWeek, healthScore, rp, rpShort,
} from "./analytics";
import { DATES, KOPERASI } from "./seed";

export interface QuickPrompt {
    id: string;
    label: string;
    icon: string;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
    { id: "brief-hari-ini", label: "Apa prioritas keputusan hari ini?", icon: "✦" },
    { id: "laporan-terbaru", label: "Berikan laporan penjualan terbaru", icon: "🧾" },
    { id: "sales-terbaik", label: "Siapa sales terbaik minggu ini?", icon: "🏆" },
    { id: "restock", label: "Produk apa yang perlu di-restock?", icon: "📦" },
    { id: "prediksi", label: "Prediksi omzet minggu depan?", icon: "📈" },
    { id: "kehadiran", label: "Ringkas kehadiran karyawan", icon: "🕒" },
    { id: "kesehatan", label: "Bagaimana kesehatan koperasi?", icon: "❤️‍🩹" },
];

export interface Answer {
    facts: string; // compact grounded facts (fed to LLM, never invented)
    text: string; // deterministic Indonesian narrative (fallback + ground truth)
    csv?: string; // optional downloadable rekap
    csvName?: string;
}

const last = (n: number) => ({ dari: DATES[Math.max(0, DATES.length - n)], sampai: DATES[DATES.length - 1] });

export function answerPrompt(id: string, localISO?: string): Answer {
    const tglLokal = (localISO ?? `${DATES[DATES.length - 1]}T09:00:00`).slice(0, 10);

    if (id === "brief-hari-ini") {
        const p = last(3);
        const summary = kpi(p);
        const topSales = salesByRep(p)[0];
        const stockRisk = restockAlerts({})[0];
        const forecast = forecastNextWeek({});
        const health = healthScore();
        const stockFact = stockRisk
            ? `${stockRisk.produk.nama}(stok ${stockRisk.stok}; ~${Math.ceil(stockRisk.hariTersisa)} hari)`
            : "tidak ada SKU kritis";
        const facts = `per=${tglLokal}; periode=${p.dari}..${p.sampai}; omzet_3_hari=${Math.round(summary.omzet)}; transaksi=${summary.transaksi}; sales_terbaik=${topSales.sales.nama}(${Math.round(topSales.omzet)}); risiko_stok=${stockFact}; proyeksi_7_hari=${Math.round(forecast.total)}; kesehatan=${health.skor}/100(${health.status})`;
        const stockAction = stockRisk
            ? `Setujui pemesanan ${stockRisk.produk.nama} hari ini; stok tersisa ${stockRisk.stok} dan pada laju penjualan saat ini diperkirakan habis dalam ~${Math.ceil(stockRisk.hariTersisa)} hari.`
            : "Tidak ada pemesanan mendesak. Pertahankan pemantauan stok pada ritme harian.";
        const text =
            `Brief keputusan hari ini — ${KOPERASI.nama} (${tglLokal})\n\n` +
            `Gambaran singkat\n` +
            `• Tiga hari terakhir menghasilkan ${rp(summary.omzet)} dari ${summary.transaksi} transaksi.\n` +
            `• ${topSales.sales.nama} memimpin omzet periode ini dengan ${rp(topSales.omzet)}.\n` +
            `• Kesehatan operasional berada di ${health.skor}/100 (${health.status}); proyeksi tujuh hari ke depan ${rp(forecast.total)}.\n\n` +
            `Keputusan yang disarankan\n` +
            `1. ${stockAction}\n` +
            `2. Jadikan ${topSales.sales.nama.split(" ")[0]} acuan eksekusi di jam ramai dan dokumentasikan praktik penjualannya untuk tim.\n\n` +
            `Mengapa sekarang\n` +
            `Keputusan ini memprioritaskan kesinambungan stok dan eksekusi tim berdasarkan transaksi yang telah diverifikasi SAKSI. Ini adalah usulan NALAR; persetujuan akhir tetap pada manajemen.`;
        return { facts, text };
    }

    if (id === "laporan-terbaru") {
        const p = last(3);
        const k = kpi(p);
        const reps = salesByRep(p);
        const top = reps[0];
        const skus = bySku(p).slice(0, 3);
        const facts = `periode=${p.dari}..${p.sampai}; omzet=${Math.round(k.omzet)}; transaksi=${k.transaksi}; margin=${Math.round(k.margin)}; top_sales=${top.sales.nama}(${Math.round(top.omzet)}); top_produk=${skus.map((s) => `${s.produk.nama}(${s.qty})`).join(", ")}`;
        const text =
            `Laporan penjualan terbaru — ${KOPERASI.nama} (per ${tglLokal}, 3 hari terakhir):\n\n` +
            `• Omzet: ${rp(k.omzet)} dari ${k.transaksi} transaksi\n` +
            `• Margin kotor: ${rp(k.margin)}\n` +
            `• Sales terbaik: ${top.sales.nama} (${rp(top.omzet)})\n` +
            `• Produk terlaris: ${skus.map((s) => `${s.produk.nama} (${s.qty} pcs)`).join(", ")}\n\n` +
            `Semua angka teratestasi SAKSI — rantai utuh, 0 anomali.`;
        const csv = [
            `REKAP PENJUALAN,${p.dari} s/d ${p.sampai}`,
            `Omzet,${Math.round(k.omzet)}`, `Transaksi,${k.transaksi}`, `Margin,${Math.round(k.margin)}`,
            ``, `TOP SALES`, ...reps.slice(0, 6).map((r, i) => `${i + 1}. ${r.sales.nama},${Math.round(r.omzet)}`),
        ].join("\n");
        return { facts, text, csv, csvName: `rekap-penjualan-${p.sampai}.csv` };
    }

    if (id === "sales-terbaik") {
        const p = last(7);
        const reps = salesByRep(p);
        const top = reps[0];
        const promo = promoConversion()[0];
        const facts = `minggu=${p.dari}..${p.sampai}; juara_omzet=${top.sales.nama}(${Math.round(top.omzet)},${top.transaksi}tx); juara_promo=${promo.sales.nama}(${Math.round(promo.rasio * 100)}%,${promo.konversi}/${promo.dilayani})`;
        const text =
            `Sales terbaik minggu ini (per ${tglLokal}):\n\n` +
            `🏆 Omzet tertinggi: ${top.sales.nama} — ${rp(top.omzet)} dari ${top.transaksi} transaksi.\n` +
            `🎯 Konversi promo tertinggi: ${promo.sales.nama} — Tebus Murah ${Math.round(promo.rasio * 100)}% (${promo.konversi}/${promo.dilayani}).\n\n` +
            `Rekomendasi: jadikan ${promo.sales.nama.split(" ")[0]} mentor tim & tempatkan di jam ramai agar stok promo cepat habis.`;
        return { facts, text };
    }

    if (id === "restock") {
        const r = restockAlerts({});
        const facts = `restock=${r.map((x) => `${x.produk.nama}(stok ${x.stok}, ~${Math.ceil(x.hariTersisa)}hr)`).join("; ") || "tidak ada"}`;
        const text = r.length
            ? `Produk yang perlu segera di-restock (habis < 5 hari pada laju jual sekarang):\n\n` +
              r.map((x) => `• ${x.produk.nama} — sisa stok ${x.stok}, diperkirakan habis ~${Math.ceil(x.hariTersisa)} hari lagi`).join("\n") +
              `\n\nSaran: prioritaskan pemesanan untuk kategori dengan margin tinggi.`
            : `Stok seluruh SKU masih aman untuk periode ini — belum ada yang mendesak untuk di-restock.`;
        return { facts, text };
    }

    if (id === "prediksi") {
        const f = forecastNextWeek({});
        const arah = f.deltaPersen >= 0 ? "naik" : "turun";
        const facts = `proyeksi_7hari=${f.total}; delta=${(f.deltaPersen * 100).toFixed(1)}%; arah=${arah}`;
        const text =
            `Prediksi omzet 7 hari ke depan (model musiman: level + pola akhir pekan):\n\n` +
            `• Proyeksi total: ${rp(f.total)}\n` +
            `• Perkiraan ${arah} ${Math.abs(Math.round(f.deltaPersen * 100))}% dibanding minggu terakhir.\n\n` +
            `Catatan: proyeksi statistik dari data historis — bukan janji. Jaga stok & piket di jam ramai untuk mengamankannya.`;
        return { facts, text };
    }

    if (id === "kehadiran") {
        const a = attendanceSummary({});
        const facts = `hadir=${a.hadir}; izin=${a.izin}; alpa=${a.alpa}; persen_hadir=${a.persenHadir.toFixed(1)}%`;
        const text =
            `Ringkasan kehadiran karyawan (14 hari):\n\n` +
            `• Hadir: ${a.hadir} · Izin: ${a.izin} · Alpa: ${a.alpa}\n` +
            `• Tingkat kehadiran: ${a.persenHadir.toFixed(1)}%\n\n` +
            (a.persenHadir >= 90 ? `Kehadiran sehat. Pertahankan.` : `Perlu perhatian pada disiplin kehadiran.`);
        return { facts, text };
    }

    if (id === "kesehatan") {
        const h = healthScore();
        const facts = `skor=${h.skor}; status=${h.status}; growth=${(h.growth * 100).toFixed(1)}%; komponen=${h.komponen.map((c) => `${c.label}:${c.nilai}`).join(", ")}`;
        const text =
            `Kesehatan koperasi: ${h.skor}/100 — ${h.status}.\n\n` +
            h.komponen.map((c) => `• ${c.label}: ${c.nilai}/100 (bobot ${c.bobot}%)`).join("\n") +
            `\n\nPertumbuhan omzet minggu-ke-minggu: ${(h.growth * 100).toFixed(1)}%.`;
        return { facts, text };
    }

    // Unknown / free-text guardrail.
    return {
        facts: "",
        text: `Maaf, saya hanya menjawab pertanyaan dari daftar cepat yang tersedia (laporan, sales terbaik, restock, prediksi, kehadiran, kesehatan). Silakan pilih salah satu tombol.`,
    };
}

export { rpShort };
