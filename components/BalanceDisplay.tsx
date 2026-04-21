"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { stellar, StellarAsset } from '@/lib/stellar-helper';
import { motion, AnimatePresence } from 'framer-motion';

interface BalanceDisplayProps {
  address: string;
}

const BalanceDisplay = ({ address }: BalanceDisplayProps) => {
  const [balances, setBalances] = useState<{ xlm: string; assets: StellarAsset[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stellar.getBalance(address);
      setBalances(data);
    } catch (error) {
      console.error("Failed to fetch balances", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBalances();
  }, [fetchBalances]);

  return (
    <div className="card-binance p-8 flex flex-col relative overflow-hidden bg-white">
      {/* Subtle brand mark */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex justify-between items-start mb-10">
        <div>
          <p className="text-slate text-[11px] font-bold uppercase tracking-widest">Estimated Balance</p>
          <div className="mt-3 flex items-baseline gap-2">
            <h2 className="text-5xl font-bold text-ink tracking-tight">
              <AnimatePresence mode="wait">
                <motion.span
                  key={balances?.xlm}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {loading ? "0.00" : parseFloat(balances?.xlm || "0").toLocaleString()}
                </motion.span>
              </AnimatePresence>
            </h2>
            <span className="text-lg text-primary font-black">XLM</span>
          </div>
          <p className="text-slate text-xs mt-1 font-medium italic opacity-70">≈ ${(parseFloat(balances?.xlm || "0") * 0.12).toFixed(2)} USD</p>
        </div>
        <button 
          onClick={fetchBalances}
          disabled={loading}
          className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center text-slate hover:text-ink hover:border-ink transition-all disabled:opacity-30 bg-white"
        >
          <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-light pb-2">
          <p className="text-slate text-[11px] font-bold uppercase tracking-widest">Asset Allocation</p>
          <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">STELLAR NETWORK</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {balances?.assets.length === 0 ? (
            <div className="col-span-full py-6 text-center bg-snow rounded-lg border border-dashed border-border-light">
              <p className="text-slate text-xs font-medium italic">No custom assets found in this vault</p>
            </div>
          ) : (
            balances?.assets.map((asset) => (
              <div key={asset.code} className="bg-snow p-4 rounded-lg border border-border-light hover:border-primary/30 transition-all flex justify-between items-center group">
                <div>
                  <p className="text-ink font-bold text-sm tracking-tight">{asset.code}</p>
                  <p className="text-[10px] text-slate font-medium uppercase tracking-tighter">Stellar Asset</p>
                </div>
                <div className="text-right">
                  <p className="text-ink font-bold text-sm">{parseFloat(asset.balance).toLocaleString()}</p>
                  <p className="text-[9px] text-primary font-black opacity-0 group-hover:opacity-100 transition-opacity">TRADE</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border-light flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate text-[10px] font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm text-crypto-green">verified</span>
          <span>Stellar Testnet Sync</span>
        </div>
        <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">
          View Details
        </button>
      </div>
    </div>
  );
};

export default BalanceDisplay;

