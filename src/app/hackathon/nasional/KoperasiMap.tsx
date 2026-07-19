"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export interface KoperasiPoint {
    ref: string;
    lat: number;
    lng: number;
    tx: boolean;
    nama: string;
    provinsi?: string;
    sektor?: string;
    omzet?: number;
}

const LNG_MIN = 95, LNG_MAX = 141, LAT_MIN = -11, LAT_MAX = 6;
const HIJAU = "#1B3A6B", KUNING = "#F2B807";

export default function KoperasiMap({ points }: { points: KoperasiPoint[]; mapsKey?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const leafletRef = useRef<typeof import("leaflet") | null>(null);
    const mapRef = useRef<import("leaflet").Map | null>(null);
    const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
    const heatRef = useRef<import("leaflet").Layer | null>(null);
    const firstRef = useRef(true);
    const [failed, setFailed] = useState(false);
    const [mode, setMode] = useState<"titik" | "heat">("titik");
    const bertransaksi = points.filter((point) => point.tx).length;

    function draw(nextPoints: KoperasiPoint[], fly: boolean) {
        const L = leafletRef.current;
        const layer = layerRef.current;
        const map = mapRef.current;
        if (!L || !layer || !map) return;

        layer.clearLayers();
        if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; }
        const latlngs: [number, number][] = nextPoints.map((p) => [p.lat, p.lng]);

        // leaflet.heat patches L.heatLayer (fall back to the default export if the
        // ESM namespace snapshot doesn't carry the late-added property).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = typeof window !== "undefined" ? (window as any).L : undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heatFn: any = (L as any).heatLayer ?? (L as any).default?.heatLayer ?? w?.heatLayer;
        if (mode === "heat" && heatFn) {
            const max = Math.max(1, ...nextPoints.map((p) => p.omzet ?? 0));
            const data: [number, number, number][] = nextPoints.map((p) => {
                const o = p.omzet ?? 0;
                return [p.lat, p.lng, o > 0 ? 0.3 + 0.7 * (o / max) : 0.06];
            });
            const heat = heatFn(data, { radius: 22, blur: 18, maxZoom: 9, minOpacity: 0.25, gradient: { 0.2: "#1B3A6B", 0.5: "#F2B807", 1: "#D6222A" } }) as import("leaflet").Layer;
            heat.addTo(map);
            heatRef.current = heat;
        } else {
            for (const point of nextPoints) {
                L.circleMarker([point.lat, point.lng], {
                    radius: point.tx ? 5 : 4,
                    weight: 1,
                    color: "#fff",
                    opacity: 0.75,
                    fillColor: point.tx ? HIJAU : KUNING,
                    fillOpacity: point.tx ? 0.92 : 0.65,
                })
                    .bindPopup(renderInfoWindow(point), { maxWidth: 280 })
                    .addTo(layer);
            }
        }
        if (fly && latlngs.length) {
            try {
                map.flyToBounds(L.latLngBounds(latlngs), { padding: [36, 36], maxZoom: 9, duration: 0.6 });
            } catch { /* Map stays at its current extent if bounds fail. */ }
        }
    }

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const L = await import("leaflet");
                await import("leaflet.heat"); // patches L.heatLayer for the heatmap mode
                if (cancelled || !ref.current || mapRef.current) return;

                const map = L.map(ref.current, {
                    preferCanvas: true,
                    scrollWheelZoom: false,
                    minZoom: 4,
                    maxZoom: 17,
                    zoomControl: true,
                    attributionControl: true,
                }).setView([-2.55, 118.02], 5);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);

                leafletRef.current = L;
                mapRef.current = map;
                layerRef.current = L.layerGroup().addTo(map);
                window.setTimeout(() => map.invalidateSize(), 120);
                draw(points, false);
                firstRef.current = false;
            } catch {
                if (!cancelled) setFailed(true);
            }
        })();

        return () => {
            cancelled = true;
            mapRef.current?.remove();
            mapRef.current = null;
            layerRef.current = null;
            leafletRef.current = null;
        };
        // Initialise the map once; the separate effect below handles filters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (firstRef.current) return;
        draw(points, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points]);

    useEffect(() => {
        if (firstRef.current) return;
        draw(points, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px]">
                <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: "var(--garis)" }}>
                    <button onClick={() => setMode("titik")} className="rounded-md px-2.5 py-1 font-semibold transition" style={mode === "titik" ? { background: "var(--navy)", color: "#fff" } : { color: "var(--kabur)" }}>Titik</button>
                    <button onClick={() => setMode("heat")} className="rounded-md px-2.5 py-1 font-semibold transition" style={mode === "heat" ? { background: "var(--navy)", color: "#fff" } : { color: "var(--kabur)" }}>Heatmap</button>
                </div>
                {mode === "heat" ? (
                    <span className="flex items-center gap-2">
                        <span className="text-[11px]" style={{ color: "var(--kabur)" }}>Sepi</span>
                        <span className="h-2.5 w-24 rounded-full" style={{ background: "linear-gradient(90deg,#1B3A6B,#F2B807,#D6222A)" }} />
                        <span className="text-[11px]" style={{ color: "var(--kabur)" }}>Padat omzet</span>
                    </span>
                ) : (
                    <>
                        <span className="flex items-center gap-1.5"><Dot c={HIJAU} /> Bertransaksi ({bertransaksi.toLocaleString("id-ID")})</span>
                        <span className="flex items-center gap-1.5"><Dot c={KUNING} /> Belum bertransaksi ({(points.length - bertransaksi).toLocaleString("id-ID")})</span>
                    </>
                )}
                <span className="ml-auto" style={{ color: "var(--kabur)" }}>{points.length.toLocaleString("id-ID")} koperasi · OpenStreetMap</span>
            </div>
            {failed ? (
                <SvgScatter points={points} />
            ) : (
                <div ref={ref} className="h-[440px] w-full overflow-hidden rounded-xl" style={{ background: "#DCE7F0", zIndex: 0 }} role="img" aria-label="Peta sebaran koperasi di Indonesia" />
            )}
        </div>
    );
}

function Dot({ c }: { c: string }) {
    return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />;
}

function renderInfoWindow(point: KoperasiPoint) {
    const status = point.tx ? "Sudah bertransaksi" : "Belum bertransaksi";
    const detail = [point.provinsi, point.sektor]
        .filter((value): value is string => Boolean(value))
        .map(escapeHtml)
        .join(" &middot; ");
    const omzet = point.omzet ? `<div style="margin-top:6px;font-weight:700;color:${HIJAU}">Omzet ${rupiah(point.omzet)}</div>` : "";
    return `
        <div style="font-family:Inter,system-ui,sans-serif;min-width:190px">
            <div style="font-weight:800;color:#111827">${escapeHtml(point.nama)}</div>
            ${detail ? `<div style="margin-top:4px;color:#64748B;font-size:12px">${detail}</div>` : ""}
            <div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:3px 8px;background:${point.tx ? "#E9EEF6" : "#FFF7D6"};color:${point.tx ? HIJAU : "#8A6500"};font-size:12px;font-weight:700">${status}</div>
            ${omzet}
            <a href="/hackathon/nasional/koperasi/${encodeURIComponent(point.ref)}" style="display:inline-block;margin-top:10px;border-radius:8px;padding:7px 10px;background:${HIJAU};color:#fff;text-decoration:none;font-size:12px;font-weight:800">Pusat Informasi</a>
        </div>
    `;
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}

function rupiah(value: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function SvgScatter({ points }: { points: KoperasiPoint[] }) {
    const W = 1000, H = 380;
    const x = (lng: number) => ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
    const y = (lat: number) => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
    return (
        <div className="overflow-hidden rounded-xl" style={{ background: "linear-gradient(180deg,#EAF3ED,#F1F4EF)" }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Sebaran koperasi">
                {[0.25, 0.5, 0.75].map((guide) => <line key={guide} x1={0} x2={W} y1={guide * H} y2={guide * H} stroke="#DCE5DE" strokeDasharray="2 6" />)}
                {points.map((point) => <circle key={point.ref} cx={x(point.lng)} cy={y(point.lat)} r={point.tx ? 3.4 : 2.6} fill={point.tx ? HIJAU : KUNING} fillOpacity={point.tx ? 0.9 : 0.55} />)}
            </svg>
        </div>
    );
}
