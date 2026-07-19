"use client";

import { logoutAction } from "../login/actions";

export default function LogoutButton() {
    return (
        <form action={logoutAction}>
            <button
                type="submit"
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-white"
                style={{ borderColor: "var(--garis)", color: "var(--kabur)" }}
            >
                Keluar
            </button>
        </form>
    );
}
