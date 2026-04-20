"use client";

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useStellar } from '@/context/StellarContext';

const TransactionHistory = dynamic(() => import('@/components/TransactionHistory'), {
  ssr: false,
  loading: () => <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
});

export default function TransactionHistoryPage() {
  const { address } = useStellar();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-8 md:p-12 lg:p-16 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-lora font-semibold text-white mb-2">Ledger History</h2>
          <p className="text-gray-400 text-sm max-w-lg">Comprehensive record of all on-chain executions and treasury movements.</p>
        </div>
      </div>

      {/* Summary Metrics (Real data only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E1E1E] border border-white/5 p-6 rounded-xl shadow-2xl">
          <p className="text-[10px] text-white/40 mb-2 uppercase tracking-widest font-bold">Account Status</p>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${address ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
            <span className="text-xl font-mono text-white">
              {address ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
        
        <div className="bg-[#1E1E1E] border border-white/5 p-6 rounded-xl shadow-2xl">
          <p className="text-[10px] text-white/40 mb-2 uppercase tracking-widest font-bold">Network</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-mono text-primary font-bold">STELLAR TESTNET</span>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl shadow-2xl overflow-hidden">
        {address ? (
          <TransactionHistory address={address} refreshKey={refreshKey} />
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-white/10 text-6xl">account_balance_wallet</span>
            <p className="text-white/40 text-sm italic font-medium tracking-wide">Please connect your wallet to view transaction history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
