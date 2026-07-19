"use client";

// Lightweight, interactive SVG charts — no external dependency. Responsive via
// viewBox; hover tooltips + highlight states.

import { useState } from "react";

const HIJAU = "#D6222A";   // primary series (merah brand)
const HIJAU_D = "#B01B22"; // darker red (highlight/tooltip)
const NAVY = "#1B3A6B";    // positive / gauge-good
const KUNING = "#F2B807";
const KABUR = "#6B6F76";
const GARIS = "#E6E3E4";

export function BarChartH({
    data,
    format,
    color = HIJAU,
    highlightIndex,
    onSelect,
    selectedLabel,
}: {
    data: { label: string; value: number; sub?: string; tip?: string }[];
    format: (n: number) => string;
    color?: string;
    highlightIndex?: number;
    onSelect?: (label: string) => void;
    selectedLabel?: string;
}) {
    const [hov, setHov] = useState(-1);
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
        <div className="flex flex-col gap-2.5">
            {data.map((d, i) => {
                const pct = (d.value / max) * 100;
                const hot = i === highlightIndex || i === hov || d.label === selectedLabel;
                return (
                    <div
                        key={`${d.label}-${i}`}
                        className="flex items-center gap-3 rounded-md px-1 py-0.5 transition-colors"
                        style={{ background: i === hov ? "#F3F7F4" : "transparent", cursor: onSelect ? "pointer" : "default" }}
                        onMouseEnter={() => setHov(i)}
                        onMouseLeave={() => setHov(-1)}
                        onClick={() => onSelect?.(d.label)}
                        title={`${d.tip ?? d.label}: ${format(d.value)}${d.sub ? ` · ${d.sub}` : ""}`}
                    >
                        <div className="w-28 shrink-0 truncate text-[13px] font-medium">{d.label}</div>
                        <div className="relative h-6 flex-1 overflow-hidden rounded-md" style={{ background: "#EEF3EF" }}>
                            <div className="h-full rounded-md transition-[width] duration-500" style={{ width: `${pct}%`, background: hot ? HIJAU_D : color }} />
                        </div>
                        <div className="w-24 shrink-0 text-right text-[13px] font-semibold tabular-nums">
                            {format(d.value)}
                            {d.sub && <span className="block text-[11px] font-normal" style={{ color: KABUR }}>{d.sub}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function LineTrend({
    actual,
    forecast = [],
    labels,
    format,
}: {
    actual: number[];
    forecast?: number[];
    labels: string[];
    format: (n: number) => string;
}) {
    const W = 640;
    const H = 200;
    const pad = { l: 8, r: 8, t: 14, b: 22 };
    const all = [...actual, ...forecast];
    const max = Math.max(1, ...all);
    const n = all.length;
    const [hov, setHov] = useState(-1);
    const x = (i: number) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
    const pts = (arr: number[], offset = 0) => arr.map((v, i) => `${x(i + offset)},${y(v)}`).join(" ");
    const areaPath = `M ${x(0)},${y(actual[0])} L ${actual.map((v, i) => `${x(i)},${y(v)}`).join(" L ")} L ${x(actual.length - 1)},${H - pad.b} L ${x(0)},${H - pad.b} Z`;

    function move(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const rel = (e.clientX - rect.left) / rect.width;
        setHov(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))));
    }

    return (
        <div className="relative" onMouseMove={move} onMouseLeave={() => setHov(-1)}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
                <defs>
                    <linearGradient id="nalar-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={HIJAU} stopOpacity="0.18" />
                        <stop offset="1" stopColor={HIJAU} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((g) => (
                    <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + g * (H - pad.t - pad.b)} y2={pad.t + g * (H - pad.t - pad.b)} stroke={GARIS} strokeDasharray="3 4" />
                ))}
                <path d={areaPath} fill="url(#nalar-area)" />
                <polyline points={pts(actual)} fill="none" stroke={HIJAU} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {forecast.length > 0 && (
                    <polyline points={pts([actual[actual.length - 1], ...forecast], actual.length - 1)} fill="none" stroke={KUNING} strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
                )}
                {all.map((v, i) => (
                    <circle key={i} cx={x(i)} cy={y(v)} r={i === hov ? 4 : 2.5} fill={i >= actual.length ? KUNING : HIJAU} />
                ))}
                {hov >= 0 && <line x1={x(hov)} x2={x(hov)} y1={pad.t} y2={H - pad.b} stroke={KABUR} strokeDasharray="2 3" strokeWidth="1" />}
                {labels.map((l, i) => (i % 2 === 0 ? <text key={i} x={x(i)} y={H - 6} fontSize="10" fill={KABUR} textAnchor="middle">{l}</text> : null))}
            </svg>
            {hov >= 0 && (
                <div className="pointer-events-none absolute -translate-x-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-white shadow-md"
                    style={{ left: `${(x(hov) / W) * 100}%`, top: 0, background: hov >= actual.length ? "#A07800" : HIJAU_D }}>
                    {labels[hov]}: {format(all[hov])}{hov >= actual.length ? " (proyeksi)" : ""}
                </div>
            )}
        </div>
    );
}

export function HourBars({ data, prime }: { data: { jam: number; transaksi: number }[]; prime: number[] }) {
    const max = Math.max(1, ...data.map((d) => d.transaksi));
    const shown = data.filter((d) => d.transaksi > 0 || (d.jam >= 6 && d.jam <= 21));
    return (
        <div className="flex items-end gap-1" style={{ height: 120 }}>
            {shown.map((d) => {
                const hot = prime.includes(d.jam);
                return (
                    <div key={d.jam} className="flex flex-1 flex-col items-center gap-1">
                        <div className="w-full rounded-t transition-opacity hover:opacity-80" style={{ height: `${Math.max(4, (d.transaksi / max) * 96)}px`, background: hot ? KUNING : "#BFD6C7" }} title={`${d.jam}:00 — ${d.transaksi} transaksi`} />
                        <span className="text-[9px]" style={{ color: hot ? "#A07800" : KABUR }}>{d.jam}</span>
                    </div>
                );
            })}
        </div>
    );
}

export function Donut({ data, format, onSelect, selectedLabel }: { data: { label: string; value: number; color: string }[]; format: (n: number) => string; onSelect?: (label: string) => void; selectedLabel?: string }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const R = 52;
    const C = 2 * Math.PI * R;
    const [hov, setHov] = useState(-1);
    let acc = 0;
    const center = hov >= 0 ? data[hov] : null;
    return (
        <div className="flex items-center gap-5">
            <div className="relative h-32 w-32">
                <svg viewBox="0 0 140 140" className="h-32 w-32 -rotate-90">
                    {data.map((d, i) => {
                        const frac = d.value / total;
                        const dash = frac * C;
                        const el = (
                            <circle key={`${d.label}-${i}`} cx="70" cy="70" r={R} fill="none" stroke={d.color} strokeWidth={i === hov || d.label === selectedLabel ? 20 : 16}
                                strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-acc * C}
                                style={{ cursor: onSelect ? "pointer" : "default", transition: "stroke-width .15s" }}
                                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(-1)} onClick={() => onSelect?.(d.label)}>
                                <title>{`${d.label}: ${format(d.value)} (${Math.round(frac * 100)}%)`}</title>
                            </circle>
                        );
                        acc += frac;
                        return el;
                    })}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    {center ? (
                        <>
                            <span className="text-sm font-extrabold tabular-nums" style={{ color: center.color }}>{format(center.value)}</span>
                            <span className="text-[10px]" style={{ color: KABUR }}>{Math.round((center.value / total) * 100)}%</span>
                        </>
                    ) : (
                        <span className="text-[11px]" style={{ color: KABUR }}>{format(total)}</span>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                {data.map((d, i) => (
                    <div key={`${d.label}-${i}`} className="flex items-center gap-2 text-[13px]" style={{ opacity: hov < 0 || hov === i ? 1 : 0.5, cursor: onSelect ? "pointer" : "default" }}
                        onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(-1)} onClick={() => onSelect?.(d.label)}>
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                        <span className="capitalize">{d.label}</span>
                        <span className="ml-auto pl-3 font-semibold tabular-nums">{format(d.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function Gauge({ value, status }: { value: number; status: string }) {
    const R = 60;
    const C = Math.PI * R;
    const frac = Math.max(0, Math.min(100, value)) / 100;
    const color = value >= 80 ? NAVY : value >= 60 ? KUNING : "#C1121F";
    return (
        <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 160 92" className="w-44">
                <path d="M 20 82 A 60 60 0 0 1 140 82" fill="none" stroke="#EEF3EF" strokeWidth="14" strokeLinecap="round" />
                <path d="M 20 82 A 60 60 0 0 1 140 82" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${frac * C} ${C}`} />
            </svg>
            <div className="-mt-8 text-center">
                <div className="text-3xl font-extrabold tabular-nums" style={{ color }}>{value}</div>
                <div className="text-[12px] font-semibold" style={{ color }}>{status}</div>
            </div>
        </div>
    );
}
