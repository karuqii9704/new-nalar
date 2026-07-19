import { describe, it, expect } from "vitest";
import {
    kpi, salesByRep, promoConversion, verifyReceipt, sampleReceiptIds,
    healthScore, forecastNextWeek, byCategory,
} from "./analytics";
import { LEDGER, productBySku } from "./seed";

// Ground-truth omzet computed straight off the raw ledger (net of discounts).
function ledgerOmzet() {
    let sum = 0;
    for (const tx of LEDGER) {
        for (const it of tx.items) {
            if (!productBySku(it.sku)) continue;
            sum += it.harga * it.qty - it.diskon;
        }
    }
    return sum;
}

describe("NALAR acceptance criteria", () => {
    it("reconciles dashboard omzet with the attested ledger (0 selisih)", () => {
        expect(Math.round(kpi({}).omzet)).toBe(Math.round(ledgerOmzet()));
    });

    it("surfaces Andi as the Tebus Murah champion at ~51% (180/350)", () => {
        const top = promoConversion()[0];
        expect(top.sales.id).toBe("s-andi");
        expect(top.konversi).toBe(180);
        expect(top.dilayani).toBe(350);
        expect(Math.round(top.rasio * 100)).toBe(51);
    });

    it("filtering by one sales reduces omzet and stays consistent", () => {
        const total = kpi({}).omzet;
        const andi = kpi({ salesId: "s-andi" }).omzet;
        expect(andi).toBeGreaterThan(0);
        expect(andi).toBeLessThan(total);
        // Sum of per-rep omzet equals the total (no leakage/double counting).
        const perRep = salesByRep({}).reduce((s, r) => s + r.omzet, 0);
        expect(Math.round(perRep)).toBe(Math.round(total));
    });

    it("category split sums to the total omzet", () => {
        const catSum = byCategory({}).reduce((s, c) => s + c.omzet, 0);
        expect(Math.round(catSum)).toBe(Math.round(kpi({}).omzet));
    });

    it("verifies a real receipt as ASLI and rejects an unknown one", () => {
        const [id] = sampleReceiptIds(1);
        expect(verifyReceipt(id).status).toBe("asli");
        expect(verifyReceipt("TX-00000000-9999").status).toBe("tidak_ada");
    });

    it("produces a bounded health score and a 7-day forecast", () => {
        const h = healthScore();
        expect(h.skor).toBeGreaterThanOrEqual(0);
        expect(h.skor).toBeLessThanOrEqual(100);
        const f = forecastNextWeek({});
        expect(f.proyeksi).toHaveLength(7);
        expect(f.total).toBeGreaterThan(0);
    });
});
