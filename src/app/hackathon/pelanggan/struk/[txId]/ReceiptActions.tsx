"use client";

import { useState } from "react";
import { submitReview } from "../../actions";

const rp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

export default function ReceiptActions({ txId, sales, total, customerNama }: { txId: string; sales: string; total: number; customerNama: string }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [komentar, setKomentar] = useState("");
    const [done, setDone] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    function speak() {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const u = new SpeechSynthesisUtterance(
            `Struk asli. Total belanja ${customerNama}, ${rp(total).replace("Rp", "")} rupiah, dilayani oleh ${sales.split(" ")[0]}. Tercatat aman di koperasi.`
        );
        u.lang = "id-ID";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    }

    async function kirim() {
        if (rating < 1 || busy) return;
        setBusy(true);
        const res = await submitReview(txId, rating, komentar);
        setBusy(false);
        setDone(res.message);
    }

    return (
        <div className="mt-4 space-y-3">
            <button onClick={speak} className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold" style={{ borderColor: "var(--garis)", color: "var(--hijau)", background: "#fff" }}>
                🔊 Dengarkan struk
            </button>

            {!done ? (
                <div className="nalar-card p-5">
                    <h3 className="text-sm font-bold">Beri ulasan pelayanan</h3>
                    <p className="text-[12px]" style={{ color: "var(--kabur)" }}>Bagaimana pelayanan {sales.split(" ")[0]} hari ini?</p>
                    <div className="mt-3 flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                onClick={() => setRating(n)}
                                onMouseEnter={() => setHover(n)}
                                onMouseLeave={() => setHover(0)}
                                className="text-4xl transition"
                                style={{ color: (hover || rating) >= n ? "var(--kuning)" : "#D8DED9" }}
                                aria-label={`${n} bintang`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={komentar}
                        onChange={(e) => setKomentar(e.target.value)}
                        placeholder="Komentar (opsional)…"
                        rows={2}
                        className="mt-3 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                        style={{ borderColor: "var(--garis)" }}
                    />
                    <button
                        onClick={kirim}
                        disabled={rating < 1 || busy}
                        className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50"
                        style={{ background: "var(--hijau)" }}
                    >
                        {busy ? "Mengirim…" : "Kirim Ulasan"}
                    </button>
                </div>
            ) : (
                <div className="nalar-card p-5 text-center">
                    <div className="text-3xl">🙏</div>
                    <p className="mt-2 text-sm font-semibold" style={{ color: "var(--hijau)" }}>{done}</p>
                </div>
            )}
        </div>
    );
}
