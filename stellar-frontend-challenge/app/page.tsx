"use client";

import React, { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { useStellar } from '@/context/StellarContext';

export default function MainDashboardPage() {
  const { address, balances, refreshBalances, kit } = useStellar();
  const [isExecuting, setIsExecuting] = useState(false);
  const [xlmPrice, setXlmPrice] = useState<number | null>(null);

  const hasFetched = React.useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    async function fetchPrice() {
      try {
        // XLM (Native) and USDC (Official Testnet Issuer)
        const price = await stellar.getPoolPrice('XLM', 'USDC', undefined, 'GBBD67V63DU7T7WGXX3ZW3SJGR4FB46GEHACXDVOFY76NCO27LYA6AXY');
        setXlmPrice(price);
      } catch (e) {
        console.error("Failed to fetch initial XLM price", e);
      }
    }
    fetchPrice();
  }, []);

  const handleExecuteArb = async () => {
    if (!address || !kit) return alert("Please connect your wallet first.");
    setIsExecuting(true);
    try {
      // Building a real "Proof of Execution" transaction
      const xdr = await stellar.buildPaymentXDR(
        address, 
        address, 
        "0.00001", 
        "sala-dashboard-proof"
      );
      
      const { signedTxXdr } = await kit.signTransaction(xdr);
      const result = await stellar.submitXDR(signedTxXdr);
      
      if (result.success) {
        alert(`Success! Transaction Hash: ${result.hash}\nVerified on Testnet.`);
        refreshBalances();
      } else {
        alert(`Execution failed: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error("Dashboard execution error:", error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Transaction failed: ${message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const totalUsdValue = xlmPrice ? (parseFloat(balances.xlm) * xlmPrice).toFixed(2) : null;

  return (
    <div className="px-6 md:px-12 pb-24 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-lora font-semibold text-white mb-2 tracking-tight">Treasury Overview</h1>
          <p className="text-gray-400 text-sm tracking-wide font-['Inter']">Real-time asset valuation on Stellar Testnet.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Total Portfolio Value */}
        <section className="lg:col-span-8 bg-[#1E1E1E] border border-white/5 rounded-xl p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h2 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Total Portfolio Value</h2>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
                  {address ? `${parseFloat(balances.xlm).toLocaleString()} XLM` : "Not Connected"}
                </span>
                {totalUsdValue && (
                  <span className="text-primary text-xl font-medium font-mono">
                    ≈ ${totalUsdValue}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
              <div>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Available Liquidity</p>
                <p className="text-2xl font-mono text-white">
                  {address ? `${balances.xlm} XLM` : "---"}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Stellar Network</p>
                <p className="text-2xl font-mono text-primary">TESTNET</p>
              </div>
            </div>
          </div>
        </section>

        {/* Asset Breakdown */}
        <section className="lg:col-span-4 bg-[#1E1E1E] border border-white/5 rounded-xl p-8 shadow-2xl flex flex-col">
          <h2 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">Asset Breakdown</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-primary text-xl">star</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">XLM</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold">Native</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-sm">{address ? parseFloat(balances.xlm).toFixed(2) : "0.00"}</p>
                <p className="text-primary text-[10px] font-bold">ACTIVE</p>
              </div>
            </div>

            {balances.assets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/40 text-[10px] font-bold">
                    {asset.code.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{asset.code}</p>
                    <p className="text-white/40 text-[10px] uppercase font-bold">Token</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono text-sm">{parseFloat(asset.balance).toFixed(2)}</p>
                  <p className="text-white/20 text-[10px] font-bold">TRUSTED</p>
                </div>
              </div>
            ))}
            
            {!address && (
              <div className="py-8 text-center">
                <p className="text-white/20 text-xs font-medium italic">Connect wallet to view assets</p>
              </div>
            )}
          </div>
        </section>

        {/* Active Arbitrage Routes */}
        <section className="lg:col-span-12 mt-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-lora font-semibold text-white">Market Opportunities</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-6 hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-primary/10 rounded text-primary text-[10px] font-bold uppercase tracking-widest">
                    Triangular Arb
                  </div>
                  <span className="text-white/20 text-[10px] font-mono">POOL: XLM/USDC</span>
                </div>
                <span className="text-primary font-mono text-lg font-bold">LIVE</span>
              </div>
              
              <div className="flex items-center justify-between mb-8 px-4">
                <span className="text-white font-bold">XLM</span>
                <span className="material-symbols-outlined text-white/20">arrow_forward</span>
                <span className="text-white font-bold">USDC</span>
                <span className="material-symbols-outlined text-white/20">arrow_forward</span>
                <span className="text-white font-bold">AQUA</span>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleExecuteArb}
                  disabled={isExecuting || !address}
                  className="flex-1 bg-[#FDDA24] text-black py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30"
                >
                  {isExecuting ? "Executing..." : "Execute Route"}
                </button>
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-6 opacity-50 cursor-not-allowed">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-white/5 rounded text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Cross-DEX
                  </div>
                  <span className="text-white/20 text-[10px] font-mono">WAITING</span>
                </div>
              </div>
              <p className="text-white/20 text-xs text-center py-4 italic">No profitable route detected</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
