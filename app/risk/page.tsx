"use client";

import React, { useState, useEffect } from 'react';
import { useStellar } from '@/context/StellarContext';
import { stellar } from '@/lib/stellar-helper';
import { calculateHealthFactor, getHealthStatus, Position } from '@/lib/liquidation';

export default function RiskDashboardPage() {
  const { address, kit } = useStellar();
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [position, setPosition] = useState<Position>({
    collateralAmount: 1000,
    collateralPrice: 0.12,
    debtAmount: 50,
    debtPrice: 1.0,
    threshold: 0.8
  });
  const [volatility, setVolatility] = useState([80, 60, 70, 50, 30, 40, 20]);

  const healthFactor = calculateHealthFactor(position);
  const { status, color } = getHealthStatus(healthFactor);

  // Simulate market fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setVolatility(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 80) + 10];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const simulateMarketCrash = () => {
    setPosition(prev => ({
      ...prev,
      collateralPrice: prev.collateralPrice * 0.5 // 50% drop
    }));
  };

  const simulateRecovery = () => {
    setPosition(prev => ({
      ...prev,
      collateralPrice: 0.12 // Restore to base
    }));
  };

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
        alert(`Liquidation Transaction Successful!\nHash: ${result.hash}`);
        simulateRecovery(); // Reset after successful liquidation
      } else {
        alert(`Execution failed: ${result.error}`);
      }
    } catch (e: unknown) {
      console.error("Liquidation error:", e);
      alert("Execution error. Check console for details.");
    } finally {
      setIsLiquidating(false);
    }
  };

  const volatilityPath = `M0,${volatility[0]} ${volatility.map((v, i) => `T${i * 15},${v}`).join(' ')}`;

  return (
    <div className="px-6 md:px-12 pb-24 max-w-[1600px] mx-auto w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="font-lora text-4xl md:text-5xl font-medium text-white mb-2">Risk Exposure</h1>
          <p className="text-gray-400 text-sm max-w-xl">Real-time analysis of portfolio vulnerabilities and stress tests across active positions.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={simulateMarketCrash}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
          >
            Simulate Crash
          </button>
          <button 
            onClick={simulateRecovery}
            className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/20 transition-all"
          >
            Recovery
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-surface-container-low rounded-xl p-8 relative overflow-hidden shadow-ambient border border-outline-variant/15 flex flex-col justify-between min-h-[400px]">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-on-surface-variant mb-1">Position Health</h2>
            <p className="text-xs text-on-surface-variant/70">Dynamic Health Factor</p>
          </div>
          <div className="flex justify-center items-center my-8 relative">
            <div className="w-48 h-48 rounded-full border-[12px] border-surface-container-highest relative flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container-highest" cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeWidth="12"></circle>
                <circle 
                  className="transition-all duration-1000 ease-in-out"
                  cx="50" cy="50" fill="none" r="44" stroke={healthFactor < 1 ? "#EF4444" : "#FDDA24"} strokeWidth="12"
                  strokeDasharray="276" strokeDashoffset={276 - (Math.min(healthFactor, 2) / 2 * 276)} strokeLinecap="round"
                ></circle>
              </svg>
              <div className="text-center">
                <span className={`block text-4xl font-bold ${healthFactor < 1 ? 'text-red-500' : 'text-white'}`}>{healthFactor.toFixed(2)}</span>
                <span className={`block text-xs uppercase font-bold ${healthFactor < 1 ? 'text-red-500' : 'text-primary'}`}>{status}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-outline-variant/10 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Collateral/Debt</span>
                <span className="block text-lg font-medium text-on-surface">${(position.collateralAmount * position.collateralPrice).toFixed(0)} / ${(position.debtAmount * position.debtPrice).toFixed(0)}</span>
              </div>
              {healthFactor < 1.0 && (
                <button 
                  onClick={handleLiquidate}
                  disabled={isLiquidating}
                  className="bg-red-500 text-white px-6 py-2 rounded-md text-xs font-bold uppercase hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                >
                  {isLiquidating ? "Processing..." : "Liquidate Now"}
                </button>
              )}
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
                  <h3 className="text-sm font-semibold text-white">Collateral Price</h3>
                  <p className="text-xs text-on-surface-variant">${position.collateralPrice.toFixed(3)}</p>
                </div>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-white/40">Native Asset</span>
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
                  <h3 className="text-sm font-semibold text-white">Projected Yield</h3>
                  <p className="text-xs text-primary">{(healthFactor * 2.4).toFixed(1)}% APY</p>
                </div>
              </div>
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
                  <h3 className="text-sm font-semibold text-white">Max Borrow</h3>
                  <p className="text-xs text-blue-500">${(position.collateralAmount * position.collateralPrice * position.threshold).toFixed(0)} USDC</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="bg-[#1E1E1E] rounded-xl p-8 border border-white/5 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">Market Volatility</h3>
                <p className="text-xs text-primary mt-1">Simulated live feed</p>
              </div>
            </div>
            <div className="h-48 w-full relative flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path 
                  className="text-primary transition-all duration-1000" 
                  d={volatilityPath} 
                  fill="none" stroke="currentColor" strokeWidth="2"
                ></path>
                <path 
                  className="text-primary/10 transition-all duration-1000" 
                  d={`${volatilityPath} L100,100 L0,100 Z`} 
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-8 border border-white/5 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">Liquidity Depth</h3>
                <p className="text-xs text-primary mt-1">Real-time order book density</p>
              </div>
            </div>
            <div className="h-48 w-full flex items-end justify-between gap-1 px-4 pb-4">
              {[30, 45, 20, 80, 60, 35, 50, 90].map((h, i) => (
                <div 
                  key={i}
                  style={{ height: `${(h * (healthFactor / 1.92)).toFixed(0)}%` }}
                  className={`w-1/12 rounded-t-sm transition-all duration-700 ${h > 70 ? 'bg-primary' : 'bg-white/10'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
