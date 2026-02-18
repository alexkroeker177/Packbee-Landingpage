import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "PackBee – Barcode-basierte Packverifikation",
  description:
    "PackBee verifiziert jede Sendung per Barcode-Scan. Keine falsche Lieferung, kein unvollständiges Paket. Nahtlose BillBee-Integration für fehlerfreien Versand.",
  icons: {
    icon: "/images/packbee-favicon.svg",
  },
  openGraph: {
    title: "PackBee – Barcode-basierte Packverifikation",
    description:
      "Scannen. Packen. Fertig. Barcode-basierte Packverifikation für fehlerfreien E-Commerce-Versand.",
    locale: "de_DE",
    siteName: "PackBee",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-palette="a">
      <body className={`${inter.variable} ${jakarta.variable} font-[family-name:var(--font-body)] bg-white`}>
        {children}
      </body>
    </html>
  );
}
