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
    <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 relative overflow-hidden group shadow-2xl">
      {/* Decorative background element */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
      
      <div className="flex justify-between items-start mb-10">
        <div>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">Available Treasury</p>
          <h2 className="text-5xl font-black mt-2 flex items-baseline gap-3">
            <AnimatePresence mode="wait">
              <motion.span
                key={balances?.xlm}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white tracking-tighter"
              >
                {loading ? "---" : parseFloat(balances?.xlm || "0").toLocaleString()}
              </motion.span>
            </AnimatePresence>
            <span className="text-xl text-primary font-bold">XLM</span>
          </h2>
        </div>
        <button 
          onClick={fetchBalances}
          disabled={loading}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all active:rotate-180 duration-500 disabled:opacity-50 flex items-center justify-center border border-white/5"
        >
          <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
        </button>
      </div>

      <div className="space-y-6">
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2">Asset Allocation</p>
        <div className="grid grid-cols-2 gap-4">
          {balances?.assets.length === 0 ? (
            <div className="col-span-2 py-4 text-white/20 text-xs italic font-medium">No secondary assets detected</div>
          ) : (
            balances?.assets.map((asset) => (
              <div key={asset.code} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group/asset">
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1 group-hover/asset:text-primary transition-colors">{asset.code}</p>
                <p className="text-white font-mono text-sm font-bold">{parseFloat(asset.balance).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-primary/60 text-[10px] font-bold uppercase tracking-widest">
        <span className="material-symbols-outlined text-sm">verified</span>
        <span>Verified on Stellar Testnet</span>
      </div>
    </div>
  );
};

export default BalanceDisplay;
