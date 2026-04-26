"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'Execution', icon: 'bolt', href: '/arbitrage' },
  { label: 'Simulator', icon: 'science', href: '/simulator' },
  { label: 'Risk Analysis', icon: 'security', href: '/risk' },
  { label: 'History', icon: 'history', href: '/history' },
];

export const SideNavBar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 z-40 bg-binance-dark flex-col pt-8 pb-8 border-r border-white/5">
      <div className="px-8 mb-10 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="SALA Logo" width={48} height={48} className="object-contain rounded-full" />
          <div className="hidden lg:block">
            <h1 className="font-bold text-white text-xl tracking-tighter leading-none">SALA</h1>
            <p className="text-[10px] text-slate font-bold uppercase tracking-[0.2em] mt-1">Stellar Assistant</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-md transition-all duration-200 group ${
                isActive 
                  ? 'bg-dark-card text-primary' 
                  : 'text-slate hover:text-white hover:bg-dark-card/50'
              }`}
            >
              <div className={`w-1 h-4 rounded-full mr-3 transition-all ${isActive ? 'bg-primary' : 'bg-transparent'}`} />
              <span className={`material-symbols-outlined mr-3 text-xl ${isActive ? 'fill' : ''}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <Link 
          href="/simulator"
          className="w-full py-3 px-4 rounded-md bg-primary text-ink font-bold text-center block text-sm hover:brightness-110 transition-all mb-8 shadow-pill"
        >
          New Simulation
        </Link>
        
        <div className="space-y-4 px-2">
          <Link href="/docs" className="flex items-center text-slate hover:text-white transition-colors text-xs font-medium">
            <span className="material-symbols-outlined mr-3 text-lg">description</span>
            Documentation
          </Link>
          <Link href="/support" className="flex items-center text-slate hover:text-white transition-colors text-xs font-medium">
            <span className="material-symbols-outlined mr-3 text-lg">help</span>
            Support Center
          </Link>
        </div>
      </div>
    </aside>
  );
};

