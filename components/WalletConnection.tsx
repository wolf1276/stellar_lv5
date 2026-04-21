"use client";

import React, { useState } from 'react';
import { useStellar } from '@/context/StellarContext';

export default function WalletConnection() {
  const { address, setAddress, kit } = useStellar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!kit) return;
    setLoading(true);
    setError(null);
    try {
      await kit.openModal({
        onSelection: (pubKey: string) => {
          setAddress(pubKey);
        }
      });
    } catch (err: unknown) {
      console.error("Connection failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("User rejected")) {
        setError("Connection rejected");
      } else {
        setError("Failed to connect");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setError(null);
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border-light rounded-full shadow-binance">
          <div className="w-1.5 h-1.5 bg-crypto-green rounded-full" />
          <span className="text-xs font-semibold text-ink">
            {address.substring(0, 4)}...{address.substring(address.length - 4)}
          </span>
        </div>
        <button 
          onClick={handleDisconnect}
          className="p-2 text-slate hover:text-crypto-red transition-all"
          title="Disconnect Wallet"
        >
          <span className="material-symbols-outlined text-[20px]">
            logout
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={handleConnect} 
        disabled={loading}
        className="btn-primary btn-pill flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
        <span className="text-sm font-bold uppercase tracking-wider">{loading ? "Connecting..." : "Connect"}</span>
      </button>
      {error && (
        <span className="absolute -bottom-4 right-0 text-[9px] text-crypto-red font-bold uppercase tracking-tighter">
          {error}
        </span>
      )}
    </div>
  );
}

