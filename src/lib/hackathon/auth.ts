// NALAR demo auth — judge accounts + cookie-based session.
//
// Not production auth: this is a hackathon demo. A signed-in role is stored in
// a first-party cookie so Server Components can gate the three surfaces:
//   manager  → /hackathon/dashboard (full BI dashboard)
//   direktur → /hackathon/asisten   (prompt-limited AI chatbot)
//   sales    → /hackathon/dashboard (own performance only)

export type NalarRole = "manager" | "direktur" | "sales";

export interface NalarAccount {
    user: string;
    pin: string;
    role: NalarRole;
    nama: string;
    employeeId?: string; // links a sales account to its ledger identity
}

export const ACCOUNTS: NalarAccount[] = [
    { user: "manager.demo", pin: "444444", role: "manager", nama: "Rina Wibowo" },
    { user: "direktur.demo", pin: "555555", role: "direktur", nama: "Hadi Santoso" },
    { user: "sales.demo", pin: "666666", role: "sales", nama: "Andi Saputra", employeeId: "s-andi" },
];

export const COOKIE = "nalar_session";

export function findAccount(user: string, pin: string): NalarAccount | null {
    const u = user.trim().toLowerCase();
    return ACCOUNTS.find((a) => a.user === u && a.pin === pin.trim()) ?? null;
}

export function roleLanding(role: NalarRole): string {
    return role === "direktur" ? "/hackathon/asisten" : "/hackathon/dashboard";
}

export const ROLE_LABEL: Record<NalarRole, string> = {
    manager: "Store Manager",
    direktur: "Direktur / Pengurus",
    sales: "Sales Gerai",
};
