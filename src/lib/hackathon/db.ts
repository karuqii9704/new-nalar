// Read-only adapter for the Hackathon Kemenkop 2026 committee dataset.
//
// A shared Postgres provided by the committee (host/credentials via env only).
// We ONLY read from it, over SSL, through a tiny pool, and cache aggregates so
// we never hammer a database that 100 teams share. Credentials live in
// .env.local / Netlify env — never in git. Degrades gracefully to null when
// unconfigured so the app still builds and the seed-based demo keeps working.

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let triedInit = false;

const REQUIRED_NATIONAL_TABLES = [
    "profil_koperasi",
    "referensi_koperasi_wilayah",
    "referensi_wilayah",
    "anggota_koperasi",
    "gerai_koperasi",
    "transaksi_penjualan",
    "simpanan_anggota",
    "kbli_koperasi",
    "barang_keluar_produk",
    "karyawan_koperasi",
] as const;

export interface HackDbAudit {
    configured: boolean;
    reachable: boolean;
    missingTables: string[];
}

export function isHackDbConfigured(): boolean {
    return Boolean(process.env.HACK_DB_HOST && process.env.HACK_DB_NAME && process.env.HACK_DB_USER);
}

function getPool(): Pool | null {
    if (triedInit) return pool;
    triedInit = true;
    if (!isHackDbConfigured()) return null;
    pool = new Pool({
        host: process.env.HACK_DB_HOST,
        port: Number(process.env.HACK_DB_PORT ?? 5432),
        database: process.env.HACK_DB_NAME,
        user: process.env.HACK_DB_USER,
        password: process.env.HACK_DB_PASSWORD,
        ssl: process.env.HACK_DB_SSL === "1" ? { rejectUnauthorized: false } : false,
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 12_000,
        statement_timeout: 12_000,
        // Belt-and-suspenders: never allow writes on this connection.
        options: "-c default_transaction_read_only=on",
    });
    pool.on("error", () => { /* swallow idle client errors — shared DB */ });
    return pool;
}

/** Run a read-only query. Returns [] on any failure (never throws to the UI). */
export async function hackQuery<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = []
): Promise<T[]> {
    const p = getPool();
    if (!p) return [];
    try {
        const res = await p.query<T>(sql, params);
        return res.rows;
    } catch (err) {
        console.error("[hackDb] query failed:", (err as Error).message);
        return [];
    }
}

/** Health check used by the national dashboard to show live/offline state. */
export async function hackDbPing(): Promise<boolean> {
    const rows = await hackQuery<{ ok: number }>("select 1 as ok");
    return rows[0]?.ok === 1;
}

/** Read-only readiness check for the committee dataset. */
export async function auditHackDb(): Promise<HackDbAudit> {
    if (!isHackDbConfigured()) {
        return { configured: false, reachable: false, missingTables: [...REQUIRED_NATIONAL_TABLES] };
    }

    const reachable = await hackDbPing();
    if (!reachable) return { configured: true, reachable: false, missingTables: [...REQUIRED_NATIONAL_TABLES] };

    const rows = await hackQuery<{ table_name: string }>(
        `select table_name
         from information_schema.tables
         where table_schema = current_schema()
           and table_name = any($1::text[])`,
        [[...REQUIRED_NATIONAL_TABLES]]
    );
    const available = new Set(rows.map((row) => row.table_name));
    return {
        configured: true,
        reachable: true,
        missingTables: REQUIRED_NATIONAL_TABLES.filter((table) => !available.has(table)),
    };
}
