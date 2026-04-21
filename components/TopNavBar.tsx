"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const WalletConnection = dynamic(() => import('./WalletConnection'), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-slate/10 rounded-full animate-pulse" />
});

export const TopNavBar = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md flex justify-between items-center px-8 h-16 shadow-binance md:pl-72 border-b border-border-light">
      <div className="flex items-center">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-ink text-xl font-bold">account_balance_wallet</span>
          </div>
          <span className="font-bold text-ink tracking-tight text-xl">SALA</span>
        </div>
        
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

      <div className="flex items-center space-x-6">
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

