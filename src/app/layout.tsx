import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Dawat RMG SOFT";

export const metadata: Metadata = {
  title: `${APP_NAME} | Bangladesh RMG Software`,
  description:
    "Dawat RMG SOFT — from order confirmation to shipment, in one ERP. Full-cycle garment export ERP for DAWAT GARMENTS LTD., Ashulia, Savar, Dhaka: buyers, orders, T&A, costing, procurement, production, QC, shipment and accounts.",
  keywords: [
    "RMG ERP",
    "Garments ERP Bangladesh",
    "Dawat Garments",
    "Order Management",
    "T&A Calendar",
    "Costing",
    "Procurement",
    "Production",
    "Quality Control",
    "Shipment",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0f4c5c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${sourceSerif.variable}`}>
      <body className="antialiased min-h-screen text-brand-ink">{children}</body>
    </html>
  );
}
