"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const WalletConnection = dynamic(() => import('./WalletConnection'), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-slate/10 rounded-full animate-pulse" />
});

export const TopNavBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 z-50 bg-white/95 backdrop-blur-md flex justify-between items-center px-4 md:px-8 h-16 shadow-binance border-b border-border-light gap-2">
      <div className="flex items-center min-w-0 flex-shrink">
        {/* Mobile Logo */}
        <Link href="/" className="flex items-center gap-2 md:hidden max-w-[160px]">
          <Image src="/logo.png" alt="SALA Logo" width={32} height={32} className="object-contain rounded-full flex-shrink-0" />
          <span className="font-bold text-ink tracking-tight text-xl truncate">SALA</span>
        </Link>
        
        {/* Search Bar - Binance Style */}
        <div className="hidden md:flex items-center bg-background border border-border-light rounded-md px-4 py-1.5 focus-within:border-ink transition-all">
          <span className="material-symbols-outlined text-slate mr-2 text-lg">search</span>
          <input 
            className="bg-transparent border-none text-sm text-ink focus:ring-0 placeholder-slate w-64 outline-none" 
            placeholder="Search assets, pools, or routes..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 flex-shrink-0">
        <button className="text-slate hover:text-ink transition-colors flex items-center">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <button className="text-slate hover:text-ink transition-colors flex items-center">
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>
        <WalletConnection />
      </div>
    </header>
  );
};

