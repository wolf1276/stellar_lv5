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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, [fetchTransactions, refreshKey]);

  const filteredTransactions = transactions.filter(tx => 
    tx.hash.toLowerCase().includes(search.toLowerCase()) ||
    tx.from.toLowerCase().includes(search.toLowerCase()) ||
    tx.to.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border-light bg-white">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate">Activity Ledger</h3>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate text-sm">search</span>
          <input 
            type="text"
            placeholder="Search by hash or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-snow border border-border-light rounded-md py-1.5 pl-9 pr-4 text-xs text-ink placeholder:text-slate focus:outline-none focus:border-ink transition-all w-48 md:w-80"
          />
        </div>
      </div>

      <div className="divide-y divide-border-light">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-snow animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-snow animate-pulse rounded" />
                  <div className="h-2 w-20 bg-snow animate-pulse rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-snow animate-pulse rounded" />
            </div>
          ))
        ) : filteredTransactions.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate/40 gap-4">
            <span className="material-symbols-outlined text-5xl">history</span>
            <p className="text-sm font-medium">No transaction activity recorded</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTransactions.map((tx, i) => {
              const isSent = tx.from === address;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-6 bg-white hover:bg-snow transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-crypto-red/5 text-crypto-red' : 'bg-crypto-green/5 text-crypto-green'}`}>
                      <span className="material-symbols-outlined text-lg">
                        {isSent ? 'north_east' : 'south_west'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {isSent ? 'Sent XLM' : 'Received XLM'}
                      </p>
                      <p className="text-xs text-slate font-medium mt-0.5">
                        {isSent ? 'To: ' : 'From: '}
                        <span className="font-mono text-[11px]">{stellar.formatAddress(isSent ? tx.to : tx.from, 12, 12)}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isSent ? 'text-ink' : 'text-crypto-green'}`}>
                      {isSent ? '-' : '+'}{parseFloat(tx.amount).toLocaleString()} <span className="text-[10px] text-slate ml-1">XLM</span>
                    </p>
                    <a 
                      href={stellar.getExplorerLink(tx.hash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate hover:text-primary mt-1 transition-colors"
                    >
                      EXPLORER <span className="material-symbols-outlined text-[12px]">open_in_new</span>
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

