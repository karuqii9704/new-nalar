import { cookies } from "next/headers";
import { ACCOUNTS, COOKIE, type NalarRole } from "./auth";

export interface NalarSession {
    user: string;
    role: NalarRole;
    nama: string;
    employeeId?: string;
}

export function parseSession(raw: string | undefined): NalarSession | null {
    if (!raw) return null;
    try {
        const candidate = JSON.parse(decodeURIComponent(raw)) as NalarSession;
        const account = ACCOUNTS.find((item) => item.user === candidate.user);
        if (!account || account.role !== candidate.role || account.nama !== candidate.nama || account.employeeId !== candidate.employeeId) {
            return null;
        }
        return candidate;
    } catch {
        return null;
    }
}

export function getRequestSession(request: Request): NalarSession | null {
    const cookie = request.headers.get("cookie")
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE}=`));
    return parseSession(cookie?.slice(COOKIE.length + 1));
}

export async function getSession(): Promise<NalarSession | null> {
    const jar = await cookies();
    const raw = jar.get(COOKIE)?.value;
    return parseSession(raw);
}
