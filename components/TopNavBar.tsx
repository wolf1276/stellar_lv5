"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { searchIndex, SearchItem } from '@/lib/search-index';
import { useStellar } from '@/context/StellarContext';

const WalletConnection = dynamic(() => import('./WalletConnection'), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-slate/10 rounded-full animate-pulse" />,
});

export const TopNavBar = () => {
  const router = useRouter();
  const { notifications, clearAlerts } = useStellar();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Filter search index on query change
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const filtered = searchIndex.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 6));
    setIsOpen(true);
  }, [query]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item: SearchItem) => {
    router.push(item.href);
    setQuery('');
    setIsOpen(false);
  };

  const typeColors: Record<SearchItem['type'], string> = {
    page: 'text-primary bg-primary/10',
    route: 'text-crypto-green bg-crypto-green/10',
    asset: 'text-slate bg-slate/10',
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 z-50 bg-white/95 backdrop-blur-md flex justify-between items-center px-4 md:px-8 h-16 shadow-binance border-b border-border-light gap-2">
      <div className="flex items-center min-w-0 flex-shrink">
        {/* Mobile Logo */}
        <Link href="/" className="flex items-center gap-2 md:hidden max-w-[160px]">
          <Image src="/logo.png" alt="SALA Logo" width={32} height={32} className="object-contain rounded-full flex-shrink-0" />
          <span className="font-bold text-ink tracking-tight text-xl truncate">SALA</span>
        </Link>

        {/* Search Bar with Dropdown */}
        <div ref={searchRef} className="hidden md:block relative">
          <div className="flex items-center bg-background border border-border-light rounded-md px-4 py-1.5 focus-within:border-ink transition-all">
            <span className="material-symbols-outlined text-slate mr-2 text-lg">search</span>
            <input
              className="bg-transparent border-none text-sm text-ink focus:ring-0 placeholder-slate w-64 outline-none"
              placeholder="Search assets, pools, or routes..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
            />
            {query && (
              <button onClick={() => { setQuery(''); setIsOpen(false); }} className="text-slate hover:text-ink ml-1">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-border-light rounded-md shadow-binance overflow-hidden z-50">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-snow transition-colors text-left border-b border-border-light last:border-0"
                >
                  <span className="material-symbols-outlined text-slate text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink">{item.label}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate truncate">{item.description}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate/40 text-sm">arrow_forward</span>
                </button>
              ))}
            </div>
          )}

          {isOpen && results.length === 0 && query.length > 1 && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-border-light rounded-md shadow-binance z-50 px-4 py-6 text-center">
              <span className="material-symbols-outlined text-slate text-2xl">search_off</span>
              <p className="text-sm text-slate mt-2">No results for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6 flex-shrink-0">
        {/* Notification Bell with Badge */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="text-slate hover:text-ink transition-colors flex items-center relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-ink text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-border-light rounded-md shadow-binance z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                <span className="text-xs font-bold text-ink uppercase tracking-widest">Alerts</span>
                {notifications.length > 0 && (
                  <button onClick={clearAlerts} className="text-[10px] text-slate hover:text-ink font-medium">
                    Clear all
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <span className="material-symbols-outlined text-slate text-2xl">notifications_none</span>
                  <p className="text-xs text-slate mt-2">No alerts yet</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-border-light">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-snow transition-colors">
                      <div className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-base mt-0.5 ${n.type === 'opportunity' ? 'text-primary' : n.type === 'success' ? 'text-crypto-green' : 'text-slate'}`}>
                          {n.type === 'opportunity' ? 'bolt' : n.type === 'success' ? 'check_circle' : 'warning'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-ink">{n.title}</p>
                          <p className="text-[11px] text-slate mt-0.5 truncate">{n.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button className="text-slate hover:text-ink transition-colors flex items-center">
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>
        <WalletConnection />
      </div>
    </header>
  );
};
