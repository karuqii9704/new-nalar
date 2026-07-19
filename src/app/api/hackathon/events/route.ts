import { NextResponse } from "next/server";
import { readLiveEvents } from "@/lib/hackathon/store";

// Live events for the dashboard/customer to merge over the seed baseline.
export const dynamic = "force-dynamic";

export async function GET() {
    const ev = await readLiveEvents();
    return NextResponse.json(ev, { headers: { "Cache-Control": "no-store" } });
}
