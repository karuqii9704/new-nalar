"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
    const [state, action, pending] = useActionState(loginAction, undefined);
    return (
        <form action={action} className="mt-6 flex flex-col gap-3">
            <label className="text-sm font-semibold">
                Akun
                <input
                    name="user"
                    autoComplete="username"
                    placeholder="manager.demo"
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                    style={{ borderColor: "var(--garis)" }}
                    required
                />
            </label>
            <label className="text-sm font-semibold">
                PIN
                <input
                    name="pin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    placeholder="••••••"
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                    style={{ borderColor: "var(--garis)" }}
                    required
                />
            </label>
            {state?.error && (
                <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "#FBE9E7", color: "var(--merah)" }}>
                    {state.error}
                </p>
            )}
            <button
                type="submit"
                disabled={pending}
                className="mt-1 rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                style={{ background: "var(--hijau)" }}
            >
                {pending ? "Memeriksa…" : "Masuk →"}
            </button>
        </form>
    );
}
