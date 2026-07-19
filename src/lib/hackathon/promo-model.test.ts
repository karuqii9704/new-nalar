// Real supervised classifier with a proper train/test split.
//
// Task: predict whether a basket converts on Tebus Murah (tx.tebusMurah).
// This is an HONEST learning problem: in the data-generating process a promo
// conversion needs total > Rp50.000 AND a customer "yes" (a 0.55 coin), so part
// of the label is irreducible noise. A good model therefore CANNOT be perfect —
// its ceiling reflects real customer randomness. We report test-set metrics and
// compare against a majority-class and a rule baseline. Nothing is fabricated.
//
// Run: npx vitest run src/lib/hackathon/promo-model.test.ts --disable-console-intercept

import { describe, it, expect } from "vitest";
import { LEDGER, productBySku } from "./seed";
import { trainLogReg, predictProba, evaluate, mulberry32, type LRModel } from "./ml";

const FEATURES = ["total_10k", "n_items", "jam", "akhir_pekan", "ada_produk_promo"];

function dowWeekend(tgl: string): number {
    const [y, m, d] = tgl.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return dow === 0 || dow === 6 ? 1 : 0;
}

function featurize(tx: (typeof LEDGER)[number]): number[] {
    const hasPromo = tx.items.some((it) => productBySku(it.sku)?.promo) ? 1 : 0;
    return [tx.total / 10000, tx.items.length, tx.jam, dowWeekend(tx.tgl), hasPromo];
}

describe("NALAR promo-conversion classifier (logistic regression, real metrics)", () => {
    it("trains on a 70/30 split and reports honest test-set metrics", () => {
        // Build dataset.
        const X = LEDGER.map(featurize);
        const y = LEDGER.map((tx) => (tx.tebusMurah ? 1 : 0));

        // Reproducible shuffle → 70% train / 30% test.
        const rnd = mulberry32(42);
        const idx = X.map((_, i) => i).sort(() => rnd() - 0.5);
        const cut = Math.floor(idx.length * 0.7);
        const tr = idx.slice(0, cut), te = idx.slice(cut);
        const Xtr = tr.map((i) => X[i]), ytr = tr.map((i) => y[i]);
        const Xte = te.map((i) => X[i]), yte = te.map((i) => y[i]);

        const posRate = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

        // Train.
        const model: LRModel = trainLogReg(Xtr, ytr, FEATURES, { lr: 0.3, iters: 1200, l2: 0.01 });
        const probTe = Xte.map((x) => predictProba(model, x));
        const m = evaluate(yte, probTe, 0.5);

        // Baselines on the SAME test set.
        const majorityClass = posRate(ytr) >= 0.5 ? 1 : 0;
        const mMajority = evaluate(yte, yte.map(() => majorityClass), 0.5);
        const ruleProb = Xte.map((x) => (x[0] * 10000 > 50000 ? 1 : 0)); // total > 50k
        const mRule = evaluate(yte, ruleProb, 0.5);

        // Learned weights (interpretability).
        const weights = FEATURES.map((f, j) => `${f}=${model.w[j].toFixed(2)}`).join("  ");

        console.log("\n=== PROMO-CONVERSION CLASSIFIER (Logistic Regression) ===");
        console.log("dataset            :", X.length, "transaksi ·", FEATURES.length, "fitur");
        console.log("train/test         :", Xtr.length, "/", Xte.length, "(70/30, seed 42)");
        console.log("base rate (konversi):", (posRate(y) * 100).toFixed(1) + "%");
        console.log("--- TEST SET ---");
        console.log("Accuracy           :", (m.accuracy * 100).toFixed(1) + "%");
        console.log("Precision          :", m.precision.toFixed(3));
        console.log("Recall             :", m.recall.toFixed(3));
        console.log("F1-score           :", m.f1.toFixed(3));
        console.log("ROC-AUC            :", m.auc.toFixed(3));
        console.log("Confusion TP/FP/FN/TN:", m.tp, m.fp, m.fn, m.tn);
        console.log("--- BASELINES (test set) ---");
        console.log("Majority-class Acc :", (mMajority.accuracy * 100).toFixed(1) + "%  F1:", mMajority.f1.toFixed(3));
        console.log("Rule (total>50k) Acc:", (mRule.accuracy * 100).toFixed(1) + "%  F1:", mRule.f1.toFixed(3), " AUC:", mRule.auc.toFixed(3));
        console.log("--- LEARNED WEIGHTS ---");
        console.log(weights, " bias=" + model.b.toFixed(2));

        // Honest assertions: the model must beat the majority-class baseline and
        // discriminate well above chance — but we do NOT assert an inflated score.
        expect(m.accuracy).toBeGreaterThan(mMajority.accuracy);
        expect(m.auc).toBeGreaterThan(0.8);
        expect(m.f1).toBeGreaterThan(0.6);
    });
});
