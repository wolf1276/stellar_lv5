"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { stellar } from '@/lib/stellar-helper';
import { useStellar } from '@/context/StellarContext';
import { DashboardModals } from '@/components/DashboardModals';

export default function MainDashboardPage() {
  const { address, balances, refreshBalances, kit } = useStellar();
  const [isExecuting, setIsExecuting] = useState(false);
  const [xlmPrice, setXlmPrice] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'deposit' | 'transfer' | null>(null);

  const hasFetched = React.useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    async function fetchPrice() {
      try {
        const price = await stellar.getPoolPrice('XLM', 'USDC', undefined, 'GBBD67V63DU7T7WGXX3ZW3SJGR4FB46GEHACXDVOFY76NCO27LYA6AXY');
        setXlmPrice(price);
      } catch (e) {
        console.error("Failed to fetch initial XLM price", e);
      }
    }
    fetchPrice();
  }, []);

  const handleExecuteArb = async () => {
    if (!address || !kit) {
      toast.error('Connect your wallet to execute a strategy.', {
        description: 'Use the Connect button in the top-right corner.',
      });
      return;
    }
    setIsExecuting(true);
    try {
      const xdr = await stellar.buildPaymentXDR(
        address, 
        address, 
        "0.00001", 
        "sala-dashboard-proof"
      );
      
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: "Test SDF Network ; September 2015"
      });
      const result = await stellar.submitXDR(signedTxXdr);
      
      if (result.success) {
        toast.success('Transaction confirmed on Testnet!', {
          description: `Hash: ${result.hash?.substring(0, 16)}...`,
        });
        refreshBalances();
      } else {
        toast.error('Execution failed', { description: result.error });
      }
    } catch (error: unknown) {
      console.error("Dashboard execution error:", error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error('Transaction failed', { description: message });
    } finally {
      setIsExecuting(false);
    }
  };

  const totalUsdValue = xlmPrice ? (parseFloat(balances.xlm) * xlmPrice).toFixed(2) : null;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* SECTION 1: Portfolio Hero (Light) */}
      <section className="bg-white px-6 md:px-12 py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex-1">
            <h1 className="text-slate text-[12px] font-bold uppercase tracking-[0.2em] mb-4">Total Portfolio Value</h1>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl md:text-6xl font-bold text-ink tracking-tighter">
                {address ? `${parseFloat(balances.xlm).toLocaleString()}` : "0.00"}
                <span className="text-2xl md:text-3xl ml-3 text-slate">XLM</span>
              </span>
              {totalUsdValue && (
                <span className="text-crypto-green text-xl font-semibold">
                  ≈ ${totalUsdValue}
                </span>
              )}
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-crypto-green" />
                <span className="text-slate text-xs font-medium">Stellar Testnet: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate text-sm">shield</span>
                <span className="text-slate text-xs font-medium">Secure Custody</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveModal('deposit')}
              className="btn-primary btn-pill shadow-pill active:scale-[0.98]"
            >
              Deposit Assets
            </button>
            <button 
              onClick={() => setActiveModal('transfer')}
              className="px-8 py-2.5 border border-primary text-primary font-bold text-sm rounded-full hover:bg-primary/5 transition-all active:scale-[0.98]"
            >
              Transfer
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Asset Breakdown (Light/Snow) */}
      <section className="bg-snow px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <h2 className="text-ink text-2xl font-bold mb-8">Asset Allocation</h2>
            <div className="card-binance bg-white overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 px-6 py-4 border-b border-border-light text-slate text-[10px] font-bold uppercase tracking-widest bg-white">
                <div className="col-span-4">Asset</div>
                <div className="col-span-4 text-right">Balance</div>
                <div className="col-span-4 text-right">Value (USD)</div>
              </div>
              
              <div className="divide-y divide-border-light">
                {/* XLM Row */}
                <div className="grid grid-cols-12 px-6 py-5 hover:bg-snow transition-colors items-center bg-white">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-ink text-lg font-bold">star</span>
                    </div>
                    <span className="text-ink font-bold">XLM</span>
                  </div>
                  <div className="col-span-4 text-right text-ink font-bold">{address ? parseFloat(balances.xlm).toLocaleString() : "0.00"}</div>
                  <div className="col-span-4 text-right text-crypto-green font-bold">${totalUsdValue || "0.00"}</div>
                </div>

                {/* Other Assets */}
                {balances.assets.map((asset, idx) => (
                  <div key={idx} className="grid grid-cols-12 px-6 py-5 hover:bg-snow transition-colors items-center bg-white">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-snow border border-border-light flex items-center justify-center text-ink text-[10px] font-bold">
                        {asset.code.substring(0, 2)}
                      </div>
                      <span className="text-ink font-bold">{asset.code}</span>
                    </div>
                    <div className="col-span-4 text-right text-ink font-bold">{parseFloat(asset.balance).toLocaleString()}</div>
                    <div className="col-span-4 text-right text-slate font-medium">---</div>
                  </div>
                ))}

                {!address && (
                  <div className="py-12 text-center text-slate text-sm font-medium italic bg-white">
                    Connect wallet to view your asset allocation
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-ink text-2xl font-bold mb-8">Performance</h2>
            <div className="card-binance bg-white p-8 flex flex-col gap-6 shadow-sm">
              <div>
                <p className="text-slate text-[10px] font-bold uppercase tracking-widest mb-1">24h Change</p>
                <p className="text-3xl font-bold text-crypto-green">+4.12%</p>
              </div>
              <div className="h-24 w-full bg-snow rounded-md border border-border-light flex items-end p-2 gap-1">
                {[40, 60, 45, 80, 70, 90, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-crypto-green/30 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <button className="w-full py-3 bg-snow hover:bg-border-light text-ink font-bold rounded-md transition-all text-xs uppercase tracking-widest">
                View History
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Opportunities (Light) */}
      <section className="bg-white px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-ink text-3xl font-bold mb-2">Market Opportunities</h2>
              <p className="text-slate text-sm">Active routes identified by the SALA Arbitrage Engine.</p>
            </div>
            <button className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
              View All Routes <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Opportunity Card 1 */}
            <div className="card-binance p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="px-2 py-0.5 bg-crypto-green/10 text-crypto-green text-[9px] font-bold rounded border border-crypto-green/20">
                  TRIANGULAR
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-ink font-bold text-xl">1.2%</span>
                  <span className="text-slate text-[9px] font-bold uppercase">Estimated ROI</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate/5 border border-slate/10 flex items-center justify-center font-bold text-xs">XLM</div>
                </div>
                <span className="material-symbols-outlined text-slate/30 text-sm">arrow_forward</span>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate/5 border border-slate/10 flex items-center justify-center font-bold text-xs">USDC</div>
                </div>
                <span className="material-symbols-outlined text-slate/30 text-sm">arrow_forward</span>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate/5 border border-slate/10 flex items-center justify-center font-bold text-xs">AQUA</div>
                </div>
              </div>

              <button 
                onClick={handleExecuteArb}
                disabled={isExecuting || !address}
                className="w-full btn-primary active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {isExecuting ? "Processing..." : "Execute Strategy"}
              </button>
            </div>

            {/* Opportunity Card 2 — Skeleton (scanning) */}
            <div className="card-binance p-8 flex flex-col animate-pulse">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-block" />
                  <div className="h-3 w-16 bg-slate/20 rounded" />
                </div>
                <div className="h-5 w-10 bg-slate/20 rounded" />
              </div>
              <div className="flex-1 flex flex-col gap-3 py-6">
                <div className="h-3 w-full bg-slate/10 rounded" />
                <div className="h-3 w-3/4 bg-slate/10 rounded" />
                <div className="h-3 w-1/2 bg-slate/10 rounded" />
              </div>
              <p className="text-center text-[10px] text-slate font-medium italic mb-4">Scanning live Soroban pools...</p>
              <div className="h-10 w-full bg-slate/10 rounded-md" />
            </div>

            {/* Opportunity Card 3 — Skeleton (scanning) */}
            <div className="card-binance p-8 flex flex-col animate-pulse">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-block" />
                  <div className="h-3 w-20 bg-slate/20 rounded" />
                </div>
                <div className="h-5 w-10 bg-slate/20 rounded" />
              </div>
              <div className="flex-1 flex flex-col gap-3 py-6">
                <div className="h-3 w-full bg-slate/10 rounded" />
                <div className="h-3 w-2/3 bg-slate/10 rounded" />
                <div className="h-3 w-1/2 bg-slate/10 rounded" />
              </div>
              <p className="text-center text-[10px] text-slate font-medium italic mb-4">Monitoring lending protocols...</p>
              <div className="h-10 w-full bg-slate/10 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      <DashboardModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
}

