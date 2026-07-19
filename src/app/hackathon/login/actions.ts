"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAccount, roleLanding, COOKIE } from "@/lib/hackathon/auth";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
    const user = String(formData.get("user") ?? "");
    const pin = String(formData.get("pin") ?? "");
    const acc = findAccount(user, pin);
    if (!acc) {
        return { error: "Akun atau PIN salah. Gunakan salah satu akun demo di bawah." };
    }
    const jar = await cookies();
    jar.set(COOKIE, JSON.stringify({ user: acc.user, role: acc.role, nama: acc.nama, employeeId: acc.employeeId }), {
        httpOnly: true,
        sameSite: "lax",
        // The authenticated POS writes through /api/hackathon/sale, so the
        // session cookie must cover both the page tree and its API route.
        path: "/",
        maxAge: 60 * 60 * 8,
    });
    redirect(roleLanding(acc.role));
}

export async function logoutAction() {
    const jar = await cookies();
    jar.delete(COOKIE);
    redirect("/hackathon");
}
