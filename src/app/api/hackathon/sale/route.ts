import { NextResponse } from "next/server";
import { hydrateLive, insertSale } from "@/lib/hackathon/store";
import { chainTip, chainHash, TODAY, productBySku, employeeById, type SaleTx, type SaleItem } from "@/lib/hackathon/seed";
import { getRequestSession } from "@/lib/hackathon/session";
import { requestIp, takeRateLimit } from "@/lib/hackathon/rate-limit";

export const dynamic = "force-dynamic";

interface RawSaleItem { sku?: string; qty?: number }

export function priceSaleItems(rawItems: RawSaleItem[]): { items: SaleItem[]; total: number; tebusMurah: boolean } {
    const items: SaleItem[] = [];
    let total = 0;
    for (const item of rawItems) {
        const product = productBySku(String(item?.sku));
        if (!product) continue;
        const qty = Math.max(1, Math.min(20, Number(item?.qty) || 1));
        items.push({ sku: product.sku, qty, harga: product.harga, diskon: 0 });
        total += product.harga * qty;
    }

    // Redeem Tebus Murah only when the gross basket passes the threshold and
    // contains an eligible product. The discount covers one unit, matching the seed.
    let tebusMurah = false;
    if (total > 50000) {
        const promoLine = items.find((item) => productBySku(item.sku)?.promo);
        if (promoLine) {
            promoLine.diskon = Math.round(promoLine.harga * 0.4);
            total -= promoLine.diskon;
            tebusMurah = true;
        }
    }
    return { items, total, tebusMurah };
}

// Create a new attested POS sale → appended to the shared ledger so every
// role's dashboard/insight/chatbot reflects it live.
export async function POST(req: Request) {
    const session = getRequestSession(req);
    if (!session || !["sales", "manager"].includes(session.role)) {
        return NextResponse.json({ error: "Silakan login sebagai kasir atau manager." }, { status: 401 });
    }
    if (!takeRateLimit(`sale:${session.user}:${requestIp(req.headers)}`, 12, 60_000)) {
        return NextResponse.json({ error: "Terlalu banyak transaksi. Tunggu sebentar lalu coba lagi." }, { status: 429 });
    }

    let body: { salesId?: string; items?: { sku?: string; qty?: number }[] };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
    }

    const salesId = String(body.salesId ?? "");
    if (!employeeById(salesId)) return NextResponse.json({ error: "Sales tidak valid" }, { status: 400 });
    if (session.role === "sales" && session.employeeId !== salesId) {
        return NextResponse.json({ error: "Sales hanya dapat mencatat transaksinya sendiri." }, { status: 403 });
    }

    const { items, total, tebusMurah } = priceSaleItems(body.items ?? []);
    if (!items.length) return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });

    // Load the current chain from Supabase so the new hash links correctly.
    const ev = await hydrateLive();
    if (!ev.ok) {
        return NextResponse.json(
            { error: "Store live belum aktif (jalankan migrasi Supabase nalar_sales)." },
            { status: 503 }
        );
    }
    const { prevHash, seq } = chainTip();
    const jam = new Date().getHours();
    const txId = `TX-${TODAY.replace(/-/g, "")}-L${String(seq).padStart(4, "0")}`;
    const txHash = chainHash(prevHash, txId, salesId, total, jam);
    const tx: SaleTx = {
        txId, tgl: TODAY, jam, salesId, items, total,
        metode: "tunai", tebusMurah, txHash, prevHash, seq,
    };

    const res = await insertSale(tx);
    if (!res.ok) return NextResponse.json({ error: res.error ?? "Gagal menyimpan" }, { status: 500 });
    return NextResponse.json({ ok: true, tx });
}
