import { redirect } from "next/navigation";
import { getSession } from "@/lib/hackathon/session";
import DashboardApp from "./DashboardApp";

export default async function DashboardPage() {
    const s = await getSession();
    if (!s) redirect("/hackathon/login");
    if (s.role === "direktur") redirect("/hackathon/asisten");

    return (
        <DashboardApp
            role={s.role}
            nama={s.nama}
            employeeId={s.employeeId ?? null}
        />
    );
}
