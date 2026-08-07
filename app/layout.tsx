import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModAi Fen | Işığın Kırılması",
  description: "7. sınıf Fen Bilimleri için ışığın kırılması konusunda etkileşimli model tabanlı öğrenme uygulaması.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "ModAi Fen", description: "7. Sınıf • Işığın Kırılması", images: [{ url: "/og.png", width: 1536, height: 1024 }] },
  twitter: { card: "summary_large_image", title: "ModAi Fen", description: "7. Sınıf • Işığın Kırılması", images: ["/og.png"] },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ModAi Fen" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
