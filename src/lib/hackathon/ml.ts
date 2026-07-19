// NALAR — a small, from-scratch logistic-regression classifier.
//
// Deliberately interpretable (linear weights you can read), no black box and no
// external ML dependency. Used to score propensity — e.g. "will this basket
// convert on Tebus Murah?" — so a manager can target the right customers.
// Training standardises features, then does full-batch gradient descent with L2.

export interface LRModel {
    w: number[];
    b: number;
    mean: number[];
    std: number[];
    features: string[];
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export function trainLogReg(
    X: number[][],
    y: number[],
    features: string[],
    opts: { lr?: number; iters?: number; l2?: number } = {}
): LRModel {
    const lr = opts.lr ?? 0.2;
    const iters = opts.iters ?? 800;
    const l2 = opts.l2 ?? 0.01;
    const n = X.length;
    const d = X[0]?.length ?? 0;

    // Standardise features (z-score) — fit on the training set only.
    const mean = new Array(d).fill(0);
    const std = new Array(d).fill(0);
    for (const row of X) for (let j = 0; j < d; j++) mean[j] += row[j] / n;
    for (const row of X) for (let j = 0; j < d; j++) std[j] += (row[j] - mean[j]) ** 2 / n;
    for (let j = 0; j < d; j++) std[j] = Math.sqrt(std[j]) || 1;
    const Z = X.map((row) => row.map((v, j) => (v - mean[j]) / std[j]));

    const w = new Array(d).fill(0);
    let b = 0;
    for (let it = 0; it < iters; it++) {
        const gw = new Array(d).fill(0);
        let gb = 0;
        for (let i = 0; i < n; i++) {
            const p = sigmoid(Z[i].reduce((s, v, j) => s + v * w[j], b));
            const err = p - y[i];
            for (let j = 0; j < d; j++) gw[j] += (err * Z[i][j]) / n;
            gb += err / n;
        }
        for (let j = 0; j < d; j++) w[j] -= lr * (gw[j] + l2 * w[j]);
        b -= lr * gb;
    }
    return { w, b, mean, std, features };
}

export function predictProba(m: LRModel, x: number[]): number {
    let z = m.b;
    for (let j = 0; j < x.length; j++) z += ((x[j] - m.mean[j]) / m.std[j]) * m.w[j];
    return sigmoid(z);
}

export interface Metrics {
    tp: number; fp: number; fn: number; tn: number;
    accuracy: number; precision: number; recall: number; f1: number; auc: number; n: number;
}

/** Confusion-matrix metrics + ROC-AUC (Mann–Whitney) at a probability threshold. */
export function evaluate(yTrue: number[], yProb: number[], threshold = 0.5): Metrics {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (let i = 0; i < yTrue.length; i++) {
        const pred = yProb[i] >= threshold ? 1 : 0;
        if (pred === 1 && yTrue[i] === 1) tp++;
        else if (pred === 1 && yTrue[i] === 0) fp++;
        else if (pred === 0 && yTrue[i] === 1) fn++;
        else tn++;
    }
    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1 = (2 * precision * recall) / (precision + recall || 1);
    const accuracy = (tp + tn) / (yTrue.length || 1);
    return { tp, fp, fn, tn, accuracy, precision, recall, f1, auc: auc(yTrue, yProb), n: yTrue.length };
}

/** ROC-AUC via the rank-sum (Mann–Whitney U) identity. */
export function auc(yTrue: number[], yProb: number[]): number {
    const pos = yProb.filter((_, i) => yTrue[i] === 1);
    const neg = yProb.filter((_, i) => yTrue[i] === 0);
    if (!pos.length || !neg.length) return 0.5;
    const idx = yProb.map((p, i) => ({ p, y: yTrue[i] })).sort((a, b) => a.p - b.p);
    let rank = 0, sumRankPos = 0;
    for (let i = 0; i < idx.length; i++) { rank = i + 1; if (idx[i].y === 1) sumRankPos += rank; }
    return (sumRankPos - (pos.length * (pos.length + 1)) / 2) / (pos.length * neg.length);
}

/** Deterministic PRNG (mulberry32) so the train/test split is reproducible. */
export function mulberry32(seed: number) {
    return function () {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
