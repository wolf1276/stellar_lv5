"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { stellar, StellarTransaction } from '@/lib/stellar-helper';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionHistoryProps {
  address: string;
  refreshKey: number;
}

const TransactionHistory = ({ address, refreshKey }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<StellarTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stellar.getRecentTransactions(address, 8);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshKey]);

  const filteredTransactions = transactions.filter(tx => 
    tx.hash.toLowerCase().includes(search.toLowerCase()) ||
    tx.from.toLowerCase().includes(search.toLowerCase()) ||
    tx.to.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">Recent Activity</h3>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm">search</span>
          <input 
            type="text"
            placeholder="Search hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all w-48 md:w-64"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))
        ) : filteredTransactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-white/10 gap-3">
            <span className="material-symbols-outlined text-4xl">history</span>
            <p className="text-xs font-medium italic">No ledger activity found</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTransactions.map((tx, i) => {
              const isSent = tx.from === address;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      <span className="material-symbols-outlined text-sm">
                        {isSent ? 'north_east' : 'south_west'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">
                        {isSent ? 'Payment Sent' : 'Payment Received'}
                      </p>
                      <p className="text-[10px] text-white/30 font-mono">
                        {stellar.formatAddress(isSent ? tx.to : tx.from, 8, 8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-black font-mono ${isSent ? 'text-white/80' : 'text-green-400'}`}>
                      {isSent ? '-' : '+'}{parseFloat(tx.amount).toFixed(2)} <span className="text-[10px] opacity-40">XLM</span>
                    </p>
                    <a 
                      href={stellar.getExplorerLink(tx.hash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-primary hover:underline mt-1 uppercase tracking-widest"
                    >
                      Verify <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
