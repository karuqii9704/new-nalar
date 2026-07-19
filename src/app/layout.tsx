import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hackathon.plusthe.site"),
  title: "NALAR — Navigasi · Aktivitas · Laporan · Analisa · Rekomendasi",
  description:
    "NALAR mengubah data koperasi jadi keputusan — Navigasi, Aktivitas, Laporan, Analisa, Rekomendasi — di atas fondasi data jujur (fitur SAKSI). Hackathon Kementerian Koperasi 2026.",
};

// Pass-through root. The real <html>/<body> live in app/hackathon/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
