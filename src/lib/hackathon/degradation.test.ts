// Stage-demo degradation guardrail.
//
// The demo runs on the deterministic in-repo seed with NO external env
// (no Supabase, no committee Postgres, no Gemini, no Maps). Every surface
// the demo touches must degrade to a safe empty/deterministic value instead
// of throwing when that env is absent. This file pins that contract down so
// a future change can't silently make a screen break live on stage.
//
// `next/cache`'s unstable_cache requires a live Next.js request/build
// context (an "incrementalCache") to run at all — calling it from plain
// Node (as this Vitest suite does) throws regardless of env, which is a
// test-harness limitation, not an env-driven degradation path. We stub it
// to a passthrough so we can exercise national.ts's actual env-driven logic
// (isHackDbConfigured() gate) in isolation.
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";

vi.mock("next/cache", () => ({
    unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

import {
    fnv1a, chainHash, LEDGER, KOPERASI, EMPLOYEES, PRODUCTS, chainTip, setLiveTx, setLiveReviews,
} from "./seed";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { auditHackDb, hackQuery, hackDbPing, isHackDbConfigured } from "./db";
import { getKoperasiByRef, getNationalBundle } from "./national";
import { answerPrompt, QUICK_PROMPTS } from "./assistant";
import { customerReceipts, customerReceipt, loyalty } from "./customer";
import { readLiveEvents, hydrateLive, insertSale, insertReview } from "./store";
import { askAssistant } from "@/app/hackathon/asisten/actions";
import { POST as saleRoutePOST, priceSaleItems } from "@/app/api/hackathon/sale/route";
import { COOKIE } from "./auth";
import { resetRateLimitsForTests, takeRateLimit } from "./rate-limit";

// Env vars the real deployment would set. Wiped for the whole file so the
// suite always exercises the "unconfigured" demo path, regardless of what
// the host shell happens to export.
const ENV_KEYS = [
    "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
    "HACK_DB_HOST", "HACK_DB_PORT", "HACK_DB_NAME", "HACK_DB_USER", "HACK_DB_PASSWORD", "HACK_DB_SSL",
    "GEMINI_API_KEY", "NEXT_PUBLIC_MAPS_KEY",
] as const;
const saved: Record<string, string | undefined> = {};

beforeAll(() => {
    for (const k of ENV_KEYS) {
        saved[k] = process.env[k];
        delete process.env[k];
    }
    // No live POS sale/review has been recorded in this run — start from the
    // pure seed baseline so the chain/tip assertions below are unambiguous.
    setLiveTx([]);
    setLiveReviews([]);
    resetRateLimitsForTests();
});
afterAll(() => {
    for (const k of ENV_KEYS) {
        if (saved[k] !== undefined) process.env[k] = saved[k];
    }
});

describe("stage-demo degradation guardrail (all external env unset)", () => {
    // ── Seed determinism ────────────────────────────────────────────────────
    it("fnv1a and chainHash are pure — same input always yields the same hash", () => {
        expect(fnv1a("hello")).toBe(fnv1a("hello"));
        expect(chainHash("00000000", "TX-1", "s-andi", 12000, 8)).toBe(
            chainHash("00000000", "TX-1", "s-andi", 12000, 8)
        );
    });

    it("the seed ledger forms one unbroken hash chain from genesis to tip", () => {
        expect(LEDGER.length).toBeGreaterThan(0);
        expect(LEDGER[0].prevHash).toBe("00000000");
        for (let i = 1; i < LEDGER.length; i++) {
            expect(LEDGER[i].prevHash).toBe(LEDGER[i - 1].txHash);
            expect(LEDGER[i].seq).toBe(LEDGER[i - 1].seq + 1);
        }
        // chainTip() (used to append the next live sale) must agree with the
        // ledger's actual tail, so a demo restart reproduces the same chain.
        const tip = chainTip();
        expect(tip.prevHash).toBe(LEDGER[LEDGER.length - 1].txHash);
        expect(tip.seq).toBe(LEDGER[LEDGER.length - 1].seq + 1);
    });

    it("the fixed PRNG seed reproduces the same key totals every run", () => {
        // Pinning a few load-bearing, seed-derived facts the demo narrates
        // live (07-NALAR-SPEC §N-FR-2's tebus-murah champion, roster shape).
        expect(KOPERASI.koperasiRef).toBe("KOP-7A3F91C2D5E8");
        expect(EMPLOYEES.filter((e) => e.peran === "sales")).toHaveLength(6);
        expect(PRODUCTS).toHaveLength(40);
        expect(LEDGER.reduce((s, t) => s + t.items.length, 0)).toBeGreaterThan(0);
    });

    // ── Committee Postgres (national.ts / db.ts) ────────────────────────────
    it("db.ts: isHackDbConfigured() is false and hackQuery/hackDbPing degrade to safe empties, no throw", async () => {
        expect(isHackDbConfigured()).toBe(false);
        await expect(hackQuery("select 1 as ok")).resolves.toEqual([]);
        await expect(hackDbPing()).resolves.toBe(false);
        await expect(auditHackDb()).resolves.toMatchObject({ configured: false, reachable: false });
    });

    it("national.ts: getNationalBundle() uses the embedded snapshot when the DB is unconfigured", async () => {
        const bundle = await getNationalBundle();
        expect(bundle.ok).toBe(true);
        expect(bundle.live).toBe(false);
        expect(bundle.koperasi.length).toBeGreaterThan(0);
        await expect(getKoperasiByRef(bundle.koperasi[0].ref)).resolves.toEqual(bundle.koperasi[0]);
        await expect(getKoperasiByRef("../../unsafe")).resolves.toBeNull();
    });

    // ── Supabase (supabase.ts / store.ts) ───────────────────────────────────
    it("supabase.ts: getSupabaseAdmin() returns null and isSupabaseConfigured() is false", () => {
        expect(getSupabaseAdmin()).toBeNull();
        expect(isSupabaseConfigured()).toBe(false);
    });

    it("store.ts: readLiveEvents/hydrateLive degrade to empty+ok:false without throwing", async () => {
        await expect(readLiveEvents()).resolves.toEqual({ sales: [], reviews: [], ok: false });
        await expect(hydrateLive()).resolves.toEqual({ sales: [], reviews: [], ok: false });
    });

    it("store.ts: insertSale/insertReview report a clean failure instead of throwing", async () => {
        const tx = LEDGER[0];
        await expect(insertSale(tx)).resolves.toEqual({ ok: false, error: "Supabase belum dikonfigurasi." });
        await expect(
            insertReview({ txId: tx.txId, salesId: tx.salesId, rating: 5, komentar: "ok" })
        ).resolves.toEqual({ ok: false, error: "Supabase belum dikonfigurasi." });
    });

    // ── Customer surface (pure seed reads, no env involved) ─────────────────
    it("customer.ts: receipts/loyalty derive safely from the seed alone", () => {
        const receipts = customerReceipts();
        expect(receipts.length).toBeGreaterThan(0);
        expect(loyalty().poin).toBeGreaterThanOrEqual(0);
        expect(customerReceipt("TX-NOT-A-REAL-ID")).toBeNull();
    });

    // ── Director assistant (assistant.ts deterministic path + actions.ts) ───
    it("assistant.ts: every quick prompt answers deterministically, no throw", () => {
        for (const p of QUICK_PROMPTS) {
            const a = answerPrompt(p.id);
            expect(a.text.length).toBeGreaterThan(0);
            expect(a.facts.length).toBeGreaterThan(0);
        }
        // Unknown prompt id -> guardrail message, not a crash.
        const unknown = answerPrompt("not-a-real-prompt-id");
        expect(unknown.facts).toBe("");
        expect(unknown.text.length).toBeGreaterThan(0);
    });

    it("actions.ts: askAssistant falls back to the deterministic template without a Gemini key", async () => {
        const reply = await askAssistant("kesehatan");
        expect(reply.source).toBe("template");
        expect(reply.text).toBe(answerPrompt("kesehatan").text);
    });

    // ── API boundary: /api/hackathon/sale must fail closed, not crash ───────
    it("sale API rejects unauthenticated writes before touching the store", async () => {
        const req = new Request("http://localhost/api/hackathon/sale", {
            method: "POST",
            body: JSON.stringify({ salesId: "s-andi", items: [{ sku: PRODUCTS[0].sku, qty: 1 }] }),
        });
        const res = await saleRoutePOST(req);
        expect(res.status).toBe(401);
    });

    it("authenticated sale API returns 503 instead of throwing when Supabase is unconfigured", async () => {
        const session = encodeURIComponent(JSON.stringify({
            user: "sales.demo", role: "sales", nama: "Andi Saputra", employeeId: "s-andi",
        }));
        const req = new Request("http://localhost/api/hackathon/sale", {
            method: "POST",
            headers: { cookie: `${COOKIE}=${session}` },
            body: JSON.stringify({ salesId: "s-andi", items: [{ sku: PRODUCTS[0].sku, qty: 1 }] }),
        });
        const res = await saleRoutePOST(req);
        expect(res.status).toBe(503);
        const body = await res.json();
        expect(body.error).toMatch(/belum aktif/i);
    });

    it("local rate limiter closes after its configured allowance", () => {
        expect(takeRateLimit("test", 2, 1000, 0)).toBe(true);
        expect(takeRateLimit("test", 2, 1000, 1)).toBe(true);
        expect(takeRateLimit("test", 2, 1000, 2)).toBe(false);
        expect(takeRateLimit("test", 2, 1000, 1000)).toBe(true);
    });

    it("live Tebus Murah records a real 40% saving on one eligible unit", () => {
        const promo = PRODUCTS.find((product) => product.promo)!;
        const priced = priceSaleItems([{ sku: promo.sku, qty: 20 }]);
        expect(priced.tebusMurah).toBe(true);
        expect(priced.items[0].diskon).toBe(Math.round(promo.harga * 0.4));
        expect(priced.total).toBe(promo.harga * 20 - priced.items[0].diskon);
    });
});
