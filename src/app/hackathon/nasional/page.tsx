import Link from "next/link";
import { getNationalBundle, getNationalDbAudit, memberForecast } from "@/lib/hackathon/national";
import NasionalView from "./NasionalView";

export const dynamic = "force-dynamic";

export default async function NasionalPage() {
    const [bundle, audit] = await Promise.all([getNationalBundle(), getNationalDbAudit()]);

    if (!bundle.ok) {
        return (
            <div className="nalar-root grid min-h-screen place-items-center px-5">
                <div className="nalar-card max-w-md p-8 text-center">
                    <div className="text-3xl">🔌</div>
                    <h1 className="mt-3 text-lg font-bold">Data nasional belum tersambung</h1>
                    <p className="mt-2 text-sm" style={{ color: "var(--kabur)" }}>
                        Set kredensial <code>HACK_DB_*</code> (env panitia) untuk mengaktifkan monitoring nasional. Demo operasional gerai tetap jalan.
                    </p>
                    <Link href="/hackathon" className="mt-4 inline-block font-semibold" style={{ color: "var(--hijau)" }}>← Kembali</Link>
                </div>
            </div>
        );
    }

    const forecast = memberForecast(bundle.growth);
    const mapsKey = process.env.NEXT_PUBLIC_MAPS_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    return <NasionalView bundle={bundle} forecast={forecast} mapsKey={mapsKey} audit={audit} />;
}
