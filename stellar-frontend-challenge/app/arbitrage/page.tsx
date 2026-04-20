"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { useStellar } from '@/context/StellarContext';
import { stellar } from '@/lib/stellar-helper';
import { calculateOpportunityScore } from '@/lib/scoring';

export default function ArbitrageExecutionPage() {
  const { address, balances, refreshBalances, kit } = useStellar();
  const [isExecuting, setIsExecuting] = useState(false);
  const [spread, setSpread] = useState(0.45);
  const [score, setScore] = useState(75);

  useEffect(() => {
    const fetchPrices = async () => {
      const price = await stellar.getPoolPrice("XLM", "USDC", undefined, "GBBD67IF65Y6XGIBYI4L6T5XTA6O5PWHSTWVCX6O36S67554YTSAWBXI");
      const simulatedSpread = price ? Math.abs(price - 0.12) / 0.12 * 100 : 0.45;
      setSpread(simulatedSpread);
      setScore(calculateOpportunityScore(simulatedSpread, 50000, 2));
    };
    fetchPrices();
  }, []);

  const handleExecuteArb = async () => {
    if (!address || !kit) return alert("Please connect wallet first");
    setIsExecuting(true);
    try {
      // Step 1: Build XDR
      const xdr = await stellar.buildPaymentXDR(
        address, 
        address, 
        "0.00001", 
        "arb-proof"
      );

      // Step 2: Sign with Wallet Kit
      const { signedTxXdr } = await kit.signTransaction(xdr);

      // Step 3: Submit to Horizon
      const result = await stellar.submitXDR(signedTxXdr);

      if (result.success) {
        alert(`Arbitrage Transaction Successful!\nHash: ${result.hash}\nExplorer: ${stellar.getExplorerLink(result.hash)}`);
        refreshBalances();
      } else {
        alert(`Execution failed: ${result.error}`);
      }
    } catch (e: any) {
      console.error("Arb execution error:", e);
      if (e.message?.includes("User rejected")) {
        alert("Transaction was rejected by the user.");
      } else {
        alert(`Execution error: ${e.message}`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="px-6 md:px-12 pb-24 max-w-5xl mx-auto w-full">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="font-lora text-3xl md:text-4xl text-white mb-2">One-Click Arbitrage</h2>
          <p className="text-sm text-gray-400 font-light">Execute optimized multi-hop pathways across the Stellar network.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden ambient-shadow ghost-border">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Heuristic Score: {score}</span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface-variant mb-6 uppercase tracking-widest">Identified Pathway</h3>
            <div className="flex items-center justify-between mt-8 relative">
              <div className="absolute left-0 top-1/2 w-full h-px bg-surface-variant -z-10"></div>
              <div className="flex flex-col items-center bg-surface-container-low px-2">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mb-3">
                  <span className="font-bold text-on-surface">XLM</span>
                </div>
                <span className="text-xs text-on-surface-variant">Start</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-sm">arrow_forward</span>
              <div className="flex flex-col items-center bg-surface-container-low px-2">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mb-3">
                  <span className="font-bold text-on-surface">USDC</span>
                </div>
                <span className="text-xs text-secondary">+{spread.toFixed(2)}%</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-sm">arrow_forward</span>
              <div className="flex flex-col items-center bg-surface-container-low px-2">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mb-3">
                  <span className="font-bold text-on-surface">yXLM</span>
                </div>
                <span className="text-xs text-secondary">+0.45%</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-sm">arrow_forward</span>
              <div className="flex flex-col items-center bg-surface-container-low px-2">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(253,218,36,0.3)]">
                  <span className="font-bold text-on-primary-container">XLM</span>
                </div>
                <span className="text-xs text-primary-container font-semibold">End</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-highest rounded-xl p-8 ghost-border">
            <label className="block text-sm font-semibold text-on-surface-variant mb-4 uppercase tracking-widest">Execution Amount</label>
            <div className="relative flex items-center border-b-2 border-outline-variant focus-within:border-primary-container transition-colors pb-2">
              <input className="bg-transparent border-none text-4xl md:text-5xl font-light text-on-surface w-full focus:ring-0 p-0" placeholder="0.00" type="text" defaultValue="10,000.00"/>
              <span className="text-xl font-medium text-on-surface-variant ml-4">XLM</span>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="text-xs text-on-surface-variant">Available Balance: {address ? `${balances.xlm} XLM` : "0.00 XLM"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6 ghost-border h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-on-surface-variant mb-6 uppercase tracking-widest">Trade Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-on-surface-variant">Estimated Profit</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-secondary">~{(10000 * spread / 100).toFixed(2)} XLM</div>
                    <div className="text-xs text-on-surface-variant mt-1">≈ ${((10000 * spread / 100) * 0.12).toFixed(2)} USD</div>
                  </div>
                </div>
                <div className="w-full h-px bg-surface-variant"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Gross Spread</span>
                  <span className="text-sm font-medium text-on-surface">{spread.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Network Fees</span>
                  <span className="text-sm font-medium text-on-surface">0.00004 XLM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Slippage Tolerance</span>
                  <span className="text-sm font-medium text-on-surface">0.10%</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleExecuteArb}
              disabled={isExecuting}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(253,218,36,0.15)] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">{isExecuting ? 'sync' : 'bolt'}</span>
              <span>{isExecuting ? 'Processing...' : 'Execute Arbitrage'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
