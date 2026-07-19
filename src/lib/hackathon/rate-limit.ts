interface Bucket {
    count: number;
    resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Lightweight abuse guard for the public demo. It is intentionally local to
 * each server instance; durable/global throttling belongs at the hosting edge. */
export function takeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
}

export function requestIp(headers: Headers): string {
    return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || headers.get("x-real-ip")?.trim()
        || "unknown";
}

export function resetRateLimitsForTests() {
    buckets.clear();
}
