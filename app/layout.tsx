import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModAi Fen | Canlıların Yapısına Yolculuk",
  description: "5. sınıf Fen Bilimleri için öğretmen yönlendirmeli, etkileşimli model tabanlı öğrenme uygulaması.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "ModAi Fen", description: "Canlıların Yapısına Yolculuk", images: [{ url: "/og.png", width: 1536, height: 1024 }] },
  twitter: { card: "summary_large_image", title: "ModAi Fen", description: "Canlıların Yapısına Yolculuk", images: ["/og.png"] },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ModAi Fen" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
