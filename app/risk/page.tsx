"use client";

import React, { useState } from 'react';
import { useStellar } from '@/context/StellarContext';
import { stellar } from '@/lib/stellar-helper';
import { calculateHealthFactor, getHealthStatus, Position } from '@/lib/liquidation';

export default function RiskDashboardPage() {
  const { address, kit } = useStellar();
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [position] = useState<Position>({
    collateralAmount: 1000,
    collateralPrice: 0.12,
    debtAmount: 50,
    debtPrice: 1.0,
    threshold: 0.8
  });

  const healthFactor = calculateHealthFactor(position);
  const { status, color } = getHealthStatus(healthFactor);

  const handleLiquidate = async () => {
    if (!address || !kit) return alert("Please connect wallet first");
    setIsLiquidating(true);
    try {
      const xdr = await stellar.buildPaymentXDR(
        address,
        address,
        "0.00001",
        "liq-proof"
      );

      const { signedTxXdr } = await kit.signTransaction(xdr);

      const result = await stellar.submitXDR(signedTxXdr);

      if (result.success) {
        alert(`Liquidation Transaction Successful!\nHash: ${result.hash}\nExplorer: ${stellar.getExplorerLink(result.hash)}`);
      } else {
        alert(`Execution failed: ${result.error}`);
      }
    } catch (e: unknown) {
      console.error("Liquidation error:", e);
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("User rejected")) {
        alert("Transaction was rejected by the user.");
      } else {
        alert(`Execution error: ${message}`);
      }
    } finally {
      setIsLiquidating(false);
    }
  };

  return (
    <div className="px-6 md:px-12 pb-24 max-w-[1600px] mx-auto w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="font-lora text-4xl md:text-5xl font-medium text-white mb-2">Risk Exposure</h1>
          <p className="text-gray-400 text-sm max-w-xl">Real-time analysis of portfolio vulnerabilities, liquidity depth, and market volatility stress tests across active positions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#1B1B1B] px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FDDA24]"></div>
            <span className="text-xs font-medium text-gray-400">Live Sync Active</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-surface-container-low rounded-xl p-8 relative overflow-hidden shadow-ambient border border-outline-variant/15 flex flex-col justify-between min-h-[400px]">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-on-surface-variant mb-1">Position Health</h2>
            <p className="text-xs text-on-surface-variant/70">Health Factor Verification</p>
          </div>
          <div className="flex justify-center items-center my-8 relative">
            <div className="w-48 h-48 rounded-full border-[12px] border-surface-container-highest relative flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container-highest" cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeWidth="12"></circle>
                <circle className={color.replace('text-', 'text-[#FDDA24]')} cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeDasharray="276" strokeDashoffset={276 - (Math.min(healthFactor, 2) / 2 * 276)} strokeLinecap="round" strokeWidth="12"></circle>
              </svg>
              <div className="text-center">
                <span className={`block text-4xl font-bold ${color}`}>{healthFactor.toFixed(2)}</span>
                <span className={`block text-xs ${color} mt-1 uppercase font-bold`}>{status}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-outline-variant/10 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Collateral/Debt</span>
                <span className="block text-lg font-medium text-on-surface">${(position.collateralAmount * position.collateralPrice).toFixed(0)} / ${(position.debtAmount * position.debtPrice).toFixed(0)}</span>
              </div>
              <button 
                onClick={handleLiquidate}
                disabled={isLiquidating}
                className="bg-red-900/20 text-red-500 px-4 py-2 rounded-md text-xs font-bold uppercase hover:bg-red-900/40 transition-all border border-red-500/20 disabled:opacity-50"
              >
                {isLiquidating ? "Processing..." : "Liquidate Position"}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 grid grid-cols-1 gap-6">
          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">High Volatility Assets</h3>
                  <p className="text-xs text-red-500">Requires Attention</p>
                </div>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-white/40">12% Portfolio</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-white font-mono">$245,102<span className="text-sm text-white/40 font-normal">.00</span></span>
              <span className="material-symbols-outlined text-white/20">arrow_forward</span>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Yield Generation</h3>
                  <p className="text-xs text-primary">Stable Accumulation</p>
                </div>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-white/40">45% Portfolio</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-white font-mono">$918,400<span className="text-sm text-white/40 font-normal">.50</span></span>
              <span className="material-symbols-outlined text-white/20">arrow_forward</span>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Core Treasury</h3>
                  <p className="text-xs text-blue-500">Capital Preservation</p>
                </div>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-white/40">43% Portfolio</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-white font-mono">$877,650<span className="text-sm text-white/40 font-normal">.00</span></span>
              <span className="material-symbols-outlined text-white/20">arrow_forward</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="bg-[#1E1E1E] rounded-xl p-8 border border-white/5 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">30-Day Volatility</h3>
                <p className="text-xs text-primary mt-1">Variance against Stellar baseline</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-[10px] font-bold bg-white/10 text-white rounded-md">1W</button>
                <button className="px-3 py-1 text-[10px] font-bold bg-primary text-black rounded-md">1M</button>
                <button className="px-3 py-1 text-[10px] font-bold bg-white/5 text-white/40 rounded-md">3M</button>
              </div>
            </div>
            <div className="h-48 w-full relative flex items-end gap-2 px-2 pb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
              <div className="w-full h-full absolute inset-0 flex items-end">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path className="text-primary" d="M0,80 Q10,60 20,70 T40,50 T60,30 T80,40 T100,20" fill="none" stroke="currentColor" strokeWidth="2"></path>
                  <path className="text-primary/10" d="M0,80 Q10,60 20,70 T40,50 T60,30 T80,40 T100,20 L100,100 L0,100 Z" fill="currentColor"></path>
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <span>Oct 01</span>
                <span>Oct 15</span>
                <span>Oct 31</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-8 border border-white/5 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">Liquidity Depth</h3>
                <p className="text-xs text-primary mt-1">Order book density across active pairs</p>
              </div>
              <span className="material-symbols-outlined text-white/20">water_drop</span>
            </div>
            <div className="h-48 w-full flex items-end justify-between gap-1 px-4 pb-4 relative">
              <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-white/5 z-0"></div>
              <div className="w-1/12 bg-white/10 h-[30%] rounded-t-sm z-10 transition-colors"></div>
              <div className="w-1/12 bg-white/10 h-[45%] rounded-t-sm z-10 transition-colors"></div>
              <div className="w-1/12 bg-white/10 h-[20%] rounded-t-sm z-10 transition-colors"></div>
              <div className="w-1/12 bg-primary h-[80%] rounded-t-sm z-10 relative"></div>
              <div className="w-1/12 bg-white/10 h-[60%] rounded-t-sm z-10 transition-colors"></div>
              <div className="w-1/12 bg-white/10 h-[35%] rounded-t-sm z-10 transition-colors"></div>
              <div className="w-1/12 bg-white/10 h-[50%] rounded-t-sm z-10 transition-colors"></div>
              <div className="w-1/12 bg-white/10 h-[90%] rounded-t-sm z-10 transition-colors"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
