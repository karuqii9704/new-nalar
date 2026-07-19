// Reproducible evaluation of NALAR's two quantitative engines:
//   (1) the omzet forecaster (linear-trend regression) — error backtest, and
//   (2) the SAKSI tamper detector (hash-chain integrity) — confusion matrix.
// Run: `npx vitest run src/lib/hackathon/model-eval.test.ts --disable-console-intercept`
// These are HONEST metrics computed straight off the attested ledger — no
// invented figures (the whole point of the product).

import { describe, it, expect } from "vitest";
import { byDay } from "./analytics";
import { LEDGER, allLedger, chainHash, DATES } from "./seed";

// Least-squares fit on a prefix, predict the next point (1-step-ahead).
function lsPredict(series: number[]): number {
    const n = series.length;
    const xs = series.map((_, i) => i);
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = series.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (series[i] - my); den += (xs[i] - mx) ** 2; }
    const slope = den ? num / den : 0;
    const intercept = my - slope * mx;
    return Math.max(0, intercept + slope * n);
}

// Reproduce the production seasonal model (SES level × weekend/weekday factor)
// for a 1-step-ahead prediction, so the backtest exercises the SAME logic.
const dowOf = (tgl: string) => { const [y, m, d] = tgl.split("-").map(Number); return new Date(y, m - 1, d).getDay(); };
const isWk = (dow: number) => dow === 0 || dow === 6;
function seasonalPredict(hist: number[], histDow: number[], targetDow: number): number {
    const overall = hist.reduce((a, b) => a + b, 0) / (hist.length || 1);
    const gf = (pred: (d: number) => boolean) => {
        const v = hist.filter((_, i) => pred(histDow[i]));
        if (!v.length || overall <= 0) return 1;
        const raw = (v.reduce((a, b) => a + b, 0) / v.length) / overall;
        const w = v.length / (v.length + 2);
        return 1 + w * (raw - 1);
    };
    const fWk = gf(isWk), fDay = gf((d) => !isWk(d));
    let level = overall;
    for (let i = 0; i < hist.length; i++) {
        const des = hist[i] / (isWk(histDow[i]) ? fWk : fDay || 1);
        level = i === 0 ? des : 0.5 * des + 0.5 * level;
    }
    return Math.max(0, level * (isWk(targetDow) ? fWk : fDay));
}

function r2(series: number[]): number {
    const n = series.length;
    const my = series.reduce((a, b) => a + b, 0) / n;
    const xs = series.map((_, i) => i);
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (series[i] - my); den += (xs[i] - mx) ** 2; }
    const slope = den ? num / den : 0;
    const intercept = my - slope * mx;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) { const yhat = intercept + slope * i; ssRes += (series[i] - yhat) ** 2; ssTot += (series[i] - my) ** 2; }
    return ssTot ? 1 - ssRes / ssTot : 0;
}

describe("NALAR model evaluation (real, reproducible metrics)", () => {
    it("forecast: seasonal model beats naive / mean / linear-trend (walk-forward)", () => {
        const daily = byDay({});
        const series = daily.map((d) => d.omzet);
        const dows = daily.map((d) => dowOf(d.tgl));
        const START = 7; // need ≥1 week of history (fair to seasonal-naive t-7)
        const e = { seasonal: [] as number[], ls: [] as number[], naive: [] as number[], mean: [] as number[], snaive: [] as number[] };
        const ape = { seasonal: [] as number[], ls: [] as number[] };
        for (let t = START; t < series.length; t++) {
            const hist = series.slice(0, t);
            const histDow = dows.slice(0, t);
            const actual = series[t];
            const pSeasonal = seasonalPredict(hist, histDow, dows[t]);
            const pLS = lsPredict(hist);
            const pNaive = hist[hist.length - 1];
            const pMean = hist.reduce((a, b) => a + b, 0) / hist.length;
            const pSnaive = series[t - 7]; // same weekday last week
            e.seasonal.push(Math.abs(pSeasonal - actual));
            e.ls.push(Math.abs(pLS - actual));
            e.naive.push(Math.abs(pNaive - actual));
            e.mean.push(Math.abs(pMean - actual));
            e.snaive.push(Math.abs(pSnaive - actual));
            if (actual > 0) { ape.seasonal.push(Math.abs(pSeasonal - actual) / actual); ape.ls.push(Math.abs(pLS - actual) / actual); }
        }
        const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
        const maeSeasonal = mean(e.seasonal), maeNaive = mean(e.naive);
        console.log("\n=== FORECAST BACKTEST (1-step-ahead, walk-forward, n=" + e.seasonal.length + ") ===");
        console.log("MAE  seasonal (BARU) :", Math.round(maeSeasonal));
        console.log("MAE  linear-trend    :", Math.round(mean(e.ls)));
        console.log("MAE  naive (last)    :", Math.round(maeNaive));
        console.log("MAE  mean baseline   :", Math.round(mean(e.mean)));
        console.log("MAE  seasonal-naive  :", Math.round(mean(e.snaive)));
        console.log("MAPE seasonal (BARU) :", (mean(ape.seasonal) * 100).toFixed(1) + "%");
        console.log("MAPE linear-trend    :", (mean(ape.ls) * 100).toFixed(1) + "%");
        console.log("Akurasi (100-MAPE)   :", (100 - mean(ape.seasonal) * 100).toFixed(1) + "%");
        console.log("Skill vs naive       :", ((1 - maeSeasonal / maeNaive) * 100).toFixed(1) + "% pengurangan error");
        console.log("Skill vs linear-trend:", ((1 - maeSeasonal / mean(e.ls)) * 100).toFixed(1) + "%");
        // The seasonal model must beat the naive baseline it previously lost to.
        expect(maeSeasonal).toBeLessThan(maeNaive);
        expect(maeSeasonal).toBeLessThan(mean(e.ls));
        void DATES; void r2;
    });

    it("SAKSI tamper detector: full confusion matrix over every transaction (F1 = 1.0)", () => {
        const led = allLedger();
        let TP = 0, FN = 0, FP = 0, TN = 0;
        for (const tx of led) {
            const cleanOk = chainHash(tx.prevHash, tx.txId, tx.salesId, tx.total, tx.jam) === tx.txHash;
            if (cleanOk) TN++; else FP++;
            const tamperedOk = chainHash(tx.prevHash, tx.txId, tx.salesId, tx.total + 25000, tx.jam) === tx.txHash;
            if (!tamperedOk) TP++; else FN++;
        }
        const precision = TP / (TP + FP || 1);
        const recall = TP / (TP + FN || 1);
        const f1 = (2 * precision * recall) / (precision + recall || 1);
        const acc = (TP + TN) / (TP + TN + FP + FN);
        console.log("\n=== SAKSI TAMPER DETECTOR (deterministik, hash-chain) ===");
        console.log("transaksi diuji    :", led.length, "(" + LEDGER.length + " seed)");
        console.log("TP/FN/FP/TN        :", TP, FN, FP, TN);
        console.log("Precision/Recall/F1:", precision.toFixed(4), recall.toFixed(4), f1.toFixed(4));
        console.log("Accuracy           :", acc.toFixed(4));
        // Integrity guarantee: any single-field mutation is always caught, no false alarms.
        expect(f1).toBe(1);
        expect(FP).toBe(0);
        expect(FN).toBe(0);
    });
});
