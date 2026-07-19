import { redirect } from "next/navigation";
import { getSession } from "@/lib/hackathon/session";
import AssistantApp from "./AssistantApp";

export default async function AsistenPage() {
    const s = await getSession();
    if (!s) redirect("/hackathon/login");
    // Manager & sales use the dashboard; the chatbot is the director surface,
    // but managers may open it too (RBAC: optional for manager).
    return <AssistantApp nama={s.nama} role={s.role} />;
}
