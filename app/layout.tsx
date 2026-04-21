import '@/lib/polyfills';
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
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


export const metadata: Metadata = {
  title: "SALA | Stellar Arbitrage & Liquidation Assistant",
  description: "Advanced dashboard for Stellar network arbitrage and liquidation monitoring.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
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
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-background text-ink flex flex-col font-inter">
        <StellarProvider>
          <SideNavBar />
          <div className="flex flex-col flex-1 md:ml-64">
            <TopNavBar />
            <main className="flex-1 pt-16 min-h-screen">
              {children}
            </main>
          </div>
        </StellarProvider>
      </body>
    </html>
  );
}

