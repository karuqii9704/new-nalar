import { redirect } from "next/navigation";
import { getSession } from "@/lib/hackathon/session";
import KasirApp from "./KasirApp";

export default async function KasirPage() {
    const s = await getSession();
    if (!s) redirect("/hackathon/login");
    if (s.role === "direktur") redirect("/hackathon/asisten");
    return <KasirApp role={s.role} nama={s.nama} employeeId={s.employeeId ?? "s-andi"} />;
}
