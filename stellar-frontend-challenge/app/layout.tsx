import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Lora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SALA | Stellar Arbitrage & Liquidation Assistant",
  description: "Advanced dashboard for Stellar network arbitrage and liquidation monitoring.",
};

import { StellarProvider } from '@/context/StellarContext';
import { SideNavBar } from '@/components/SideNavBar';
import { TopNavBar } from '@/components/TopNavBar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#131313] text-white flex flex-col">
        <StellarProvider>
          <SideNavBar />
          <TopNavBar />
          <main className="flex-1 md:ml-64 pt-24 min-h-screen">
            {children}
          </main>
        </StellarProvider>
      </body>
    </html>
  );
}
