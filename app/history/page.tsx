"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStellar } from '@/context/StellarContext';

const TransactionHistory = dynamic(() => import('@/components/TransactionHistory'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate/5 rounded-xl animate-pulse" />
});

export default function TransactionHistoryPage() {
  const { address } = useStellar();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Page Header */}
      <section className="px-8 md:px-12 py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-ink mb-2">Ledger History</h1>
            <p className="text-slate text-sm max-w-lg">Comprehensive record of all on-chain executions and treasury movements on the Stellar Testnet.</p>
          </div>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-2.5 border border-border-light rounded-full hover:bg-slate/5 transition-all text-xs font-bold uppercase tracking-widest text-ink"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh Data
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-8 md:px-12 py-12 bg-snow">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-binance p-8 flex flex-col justify-center">
              <p className="text-[10px] text-slate mb-3 uppercase tracking-widest font-bold">Account Status</p>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${address ? 'bg-crypto-green' : 'bg-crypto-red'}`} />
                <span className="text-xl font-bold text-ink">
                  {address ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
            </div>
            
            <div className="card-binance p-8 flex flex-col justify-center">
              <p className="text-[10px] text-slate mb-3 uppercase tracking-widest font-bold">Execution Network</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-primary">STELLAR TESTNET</span>
              </div>
            </div>
          </div>

          {/* Transaction List Container */}
          <div className="card-binance overflow-hidden">
            <div className="px-8 py-6 border-b border-border-light bg-white">
              <h3 className="text-ink font-bold text-lg">Transaction Record</h3>
            </div>
            <div className="bg-white min-h-[400px]">
              {address ? (
                <TransactionHistory address={address} refreshKey={refreshKey} />
              ) : (
                <div className="py-32 text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-slate/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate/40 text-4xl">account_balance_wallet</span>
                  </div>
                  <div className="max-w-xs">
                    <p className="text-ink font-bold text-lg mb-1">Wallet Not Connected</p>
                    <p className="text-slate text-sm">Please connect your Stellar wallet to view your historical on-chain activity.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

