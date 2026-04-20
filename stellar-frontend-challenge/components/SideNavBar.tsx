"use client";

import Link from 'next/link';
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
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 z-40 bg-[#1B1B1B] flex-col pt-24 pb-8">
      <div className="px-6 mb-12">
        <h1 className="font-lora text-lg text-white mb-1">Stellar Arbitrage</h1>
        <p className="text-xs text-gray-500 font-medium tracking-wide">Digital Treasury</p>
      </div>

      <nav className="flex-1 px-2 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 rounded-r-full mr-4 transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#2A2A2A] text-[#FDDA24]' 
                  : 'text-gray-500 hover:text-white hover:bg-[#2A2A2A]/50'
              }`}
            >
              <span className={`material-symbols-outlined mr-4 group-hover:translate-x-1 duration-300 ${isActive ? 'fill' : ''}`}>
                {item.icon}
              </span>
              <span className="font-['Inter'] font-semibold tracking-wide uppercase text-[10px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <button className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity mb-8 shadow-lg">
          New Simulation
        </button>
        
        <div className="space-y-4">
          <Link href="/docs" className="flex items-center px-4 text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined mr-3 text-sm">description</span>
            Docs
          </Link>
          <Link href="/support" className="flex items-center px-4 text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined mr-3 text-sm">help</span>
            Support
          </Link>
        </div>
      </div>
    </aside>
  );
};
