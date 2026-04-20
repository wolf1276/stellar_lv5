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
      // Reverting to authModal as openModal was reported as non-existent
      const result = await kit.authModal();
      
      if (result && result.address) {
        setAddress(result.address);
      }
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
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-mono text-white/60 tracking-wider">
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </span>
          </div>
        </div>
        <button 
          onClick={handleDisconnect}
          className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-full transition-all group"
          title="Disconnect Wallet"
        >
          <span className="material-symbols-outlined text-lg text-white/40 group-hover:text-red-400 transition-colors">
            logout
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button 
        onClick={handleConnect} 
        disabled={loading}
        className="bg-[#FDDA24] text-black px-5 py-2.5 rounded-md text-sm font-bold tracking-tight hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <span className="text-[10px] text-red-400 font-medium animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
}
