// src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FasalAI — Mandi Price Tracker for Farmers",
  description:
    "Real-time mandi prices, AI-powered predictions, and smart alerts — helping Indian farmers sell at the right price, every time.",
  keywords: ["mandi price", "kisan", "fasal", "crop price", "agmarknet", "mandi tracker", "किसान"],
  openGraph: {
    title: "FasalAI — Mandi Price Intelligence",
    description: "AI-powered mandi price tracker for Indian farmers",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="hi" className={`${dmSans.variable} ${syne.variable}`}>
        <body className="font-sans antialiased bg-cream text-forest">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
