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
  const { status } = getHealthStatus(healthFactor);

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
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Header Section */}
      <section className="px-8 md:px-12 py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold text-ink mb-2 tracking-tight">Risk & Liquidation</h1>
            <p className="text-slate text-sm max-w-xl font-medium">Real-time analysis of portfolio vulnerabilities and stress tests across active debt positions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={simulateMarketCrash}
              className="px-4 py-2 bg-crypto-red/5 text-crypto-red border border-crypto-red/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-crypto-red/10 transition-all"
            >
              Simulate Crash
            </button>
            <button 
              onClick={simulateRecovery}
              className="px-4 py-2 bg-crypto-green/5 text-crypto-green border border-crypto-green/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-crypto-green/10 transition-all"
            >
              Recovery
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-8 md:px-12 py-12 bg-snow flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Position Health Card */}
            <div className="md:col-span-5 card-binance p-8 flex flex-col justify-between min-h-[440px] bg-white">
              <div>
                <h3 className="text-xs font-bold text-slate uppercase tracking-widest mb-1">Health Metric</h3>
                <p className="text-[10px] text-slate font-medium">Real-time Liquidation Buffer</p>
              </div>
              
              <div className="flex justify-center items-center py-8">
                <div className="w-48 h-48 rounded-full border-[12px] border-snow relative flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-snow" cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeWidth="12"></circle>
                    <circle 
                      className="transition-all duration-1000 ease-in-out"
                      cx="50" cy="50" fill="none" r="44" stroke={healthFactor < 1 ? "#F6465D" : "#F0B90B"} strokeWidth="12"
                      strokeDasharray="276" strokeDashoffset={276 - (Math.min(healthFactor, 2) / 2 * 276)} strokeLinecap="round"
                    ></circle>
                  </svg>
                  <div className="text-center">
                    <span className={`block text-4xl font-bold tracking-tighter ${healthFactor < 1 ? 'text-crypto-red' : 'text-ink'}`}>{healthFactor.toFixed(2)}</span>
                    <span className={`block text-[10px] uppercase font-bold mt-1 ${healthFactor < 1 ? 'text-crypto-red' : 'text-primary'}`}>{status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border-light">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate tracking-wider mb-1">C:D Ratio</span>
                    <span className="block text-lg font-bold text-ink">${(position.collateralAmount * position.collateralPrice).toFixed(0)} <span className="text-slate text-xs font-medium">/</span> ${(position.debtAmount * position.debtPrice).toFixed(0)}</span>
                  </div>
                  {healthFactor < 1.0 && (
                    <button 
                      onClick={handleLiquidate}
                      disabled={isLiquidating}
                      className="bg-crypto-red text-white px-6 py-2.5 rounded-md text-[10px] font-bold uppercase hover:bg-red-600 transition-all shadow-lg animate-pulse"
                    >
                      {isLiquidating ? "LIQUIDATING..." : "LIQUIDATE NOW"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="md:col-span-7 grid grid-cols-1 gap-6">
              <div className="card-binance p-6 bg-white relative overflow-hidden flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-crypto-red/5 flex items-center justify-center text-crypto-red">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Collateral Price</h3>
                    <p className="text-xs text-slate font-medium">XLM / USD</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-ink">${position.collateralPrice.toFixed(3)}</p>
                  <p className="text-[10px] text-crypto-red font-bold">-0.12%</p>
                </div>
              </div>

              <div className="card-binance p-6 bg-white relative overflow-hidden flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Projected Yield</h3>
                    <p className="text-xs text-slate font-medium">Stellar y-Assets</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{(healthFactor * 2.4).toFixed(1)}% <span className="text-[10px] text-slate font-medium">APY</span></p>
                </div>
              </div>

              <div className="card-binance p-6 bg-white relative overflow-hidden flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-crypto-blue/5 flex items-center justify-center text-crypto-blue">
                    <span className="material-symbols-outlined">account_balance</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Available Borrow</h3>
                    <p className="text-xs text-slate font-medium">Max Limit (80%)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-ink">${(position.collateralAmount * position.collateralPrice * position.threshold).toFixed(0)} <span className="text-slate text-xs font-medium">USDC</span></p>
                </div>
              </div>
            </div>

            {/* Visualization Row */}
            <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
              <div className="card-binance p-8 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate">Volatility Feed</h3>
                    <p className="text-xs text-primary font-bold mt-1">SIMULATED LIVE STREAM</p>
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
                      className="text-primary/5 transition-all duration-1000" 
                      d={`${volatilityPath} L100,100 L0,100 Z`} 
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="card-binance p-8 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate">Liquidity Depth</h3>
                    <p className="text-xs text-primary font-bold mt-1">REAL-TIME ORDER FLOW</p>
                  </div>
                </div>
                <div className="h-48 w-full flex items-end justify-between gap-1.5 px-4 pb-2">
                  {[30, 45, 20, 80, 60, 35, 50, 90].map((h, i) => (
                    <div 
                      key={i}
                      style={{ height: `${(h * (healthFactor / 1.92)).toFixed(0)}%` }}
                      className={`flex-1 rounded-t-sm transition-all duration-700 ${h > 70 ? 'bg-primary' : 'bg-snow border border-border-light'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
