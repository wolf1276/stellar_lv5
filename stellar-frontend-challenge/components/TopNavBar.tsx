"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const WalletConnection = dynamic(() => import('./WalletConnection'), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-white/5 rounded-md animate-pulse" />
});

export const TopNavBar = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-sm md:pl-72 border-b border-white/5">
      <div className="flex items-center">
        <div className="md:hidden font-lora text-2xl font-semibold italic text-[#FDDA24]">SALA</div>
        
        <div className="hidden md:flex items-center bg-[#1B1B1B] rounded-full px-4 py-2 border border-white/10">
          <span className="material-symbols-outlined text-gray-500 mr-2 text-sm">search</span>
          <input 
            className="bg-transparent border-none text-sm text-white focus:ring-0 placeholder-gray-600 w-48" 
            placeholder="Search parameters..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="text-gray-500 hover:text-[#FDDA24] transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-gray-500 hover:text-[#FDDA24] transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <WalletConnection />
      </div>
    </header>
  );
};
