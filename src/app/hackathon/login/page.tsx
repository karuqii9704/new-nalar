import Link from "next/link";
import { getSession } from "@/lib/hackathon/session";
import { roleLanding } from "@/lib/hackathon/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
    const s = await getSession();
    if (s) redirect(roleLanding(s.role));

    return (
        <div className="nalar-root grid min-h-screen place-items-center px-5 py-10">
            <div className="w-full max-w-md">
                <Link href="/hackathon" className="mb-6 flex items-center justify-center gap-2 font-extrabold tracking-tight">
                    <img src="/nalar-logo.jpg" alt="NALAR" className="h-8 w-8 rounded-lg object-cover object-left" />
                    NALAR
                </Link>
                <div className="nalar-card nalar-rise p-7">
                    <h1 className="text-xl font-bold">Masuk ke NALAR</h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--kabur)" }}>
                        Peran menentukan tampilan: manager lihat dashboard, direktur lewat AI chatbot.
                    </p>
                    <LoginForm />
                </div>

                <div className="mt-4 nalar-card p-5">
                    <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--kuning)" }}>Akun Demo Juri</div>
                    <div className="mt-3 grid gap-2">
                        <DemoRow role="Store Manager — dashboard penuh" user="manager.demo" pin="444444" />
                        <DemoRow role="Direktur — AI chatbot" user="direktur.demo" pin="555555" />
                        <DemoRow role="Sales — performa sendiri" user="sales.demo" pin="666666" />
                    </div>
                </div>

                <p className="mt-5 text-center text-xs" style={{ color: "var(--kabur)" }}>
                    <Link href="/hackathon/verifikasi" className="font-semibold" style={{ color: "var(--hijau)" }}>Cek struk publik</Link> tidak perlu login.
                </p>
            </div>
        </div>
    );
}

function DemoRow({ role, user, pin }: { role: string; user: string; pin: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--latar)" }}>
            <span className="text-[13px] font-medium">{role}</span>
            <span className="font-mono text-xs" style={{ color: "var(--kabur)" }}>{user} · {pin}</span>
        </div>
    );
}
