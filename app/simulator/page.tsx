"use client";

import React, { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';

export default function ProfitSimulatorPage() {
  const [capital, setCapital] = useState(10000);
  const [leverage, setLeverage] = useState(1.0);
  const [horizon, setHorizon] = useState('4H');
  const [xlmPrice, setXlmPrice] = useState<number | null>(null);

  const hasFetched = React.useRef(false);
  
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    async function fetchPrice() {
      try {
        const price = await stellar.getPoolPrice('XLM', 'USDC', undefined, 'GBBD67V63DU7T7WGXX3ZW3SJGR4FB46GEHACXDVOFY76NCO27LYA6AXY');
        setXlmPrice(price && price > 0 ? price : 0.115);
      } catch (e) {
        console.error("Failed to fetch pool price in simulator", e);
        setXlmPrice(0.115);
      }
    }
    fetchPrice();
  }, []);

  const horizonMultipliers: Record<string, number> = {
    '1H': 0.25,
    '4H': 1,
    '24H': 6,
    '7D': 42
  };
  const currentMultiplier = horizonMultipliers[horizon] || 1;
  const expectedReturn = (capital * leverage * 0.042 * currentMultiplier).toFixed(2);

  const generatePath = (cap: number, lev: number, isOptimized: boolean) => {
    const startY = 85; 
    const normalizedCap = Math.max(0.1, cap / 100000); 
    const normalizedLev = Math.max(0.1, lev / 10);
    const normalizedTime = Math.max(0.2, currentMultiplier / 6);
    
    const boost = isOptimized ? 1.5 : 0.7;
    const endY = Math.max(10, 85 - (normalizedCap * 30 + normalizedLev * 20 + normalizedTime * 20) * boost);
    const midY = (startY + endY) / 2;
    
    if (isOptimized) {
      return `M0 ${startY} Q 30 ${midY + 5}, 50 ${midY - 10} T 80 ${endY + 10} T 100 ${endY}`;
    } else {
      return `M0 ${startY} Q 25 ${midY + 15}, 45 ${midY + 5} T 75 ${endY + 20} T 100 ${endY + 15}`;
    }
  };

  const optimizedPath = generatePath(capital, leverage, true);
  const basePath = generatePath(capital, leverage, false);
  const fillPath = `${optimizedPath} L 100 100 L 0 100 Z`;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Header Section */}
      <section className="px-8 md:px-12 py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-ink mb-2 tracking-tight">Profit Simulator</h1>
          <p className="text-slate text-sm max-w-2xl font-medium">Model arbitrage opportunities across Stellar liquidity pools. Adjust parameters to forecast potential returns based on real network liquidity.</p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-8 md:px-12 py-12 bg-snow flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Controls */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="card-binance p-6 bg-white shadow-sm">
                <h3 className="text-slate text-[10px] font-bold tracking-widest uppercase mb-6">Trading Pair</h3>
                <div className="flex items-center justify-between bg-snow p-4 rounded-lg border border-border-light mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-[10px] font-bold text-white">XLM</div>
                    <span className="text-ink font-bold text-sm tracking-tight">Native</span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl">swap_horiz</span>
                  <div className="flex items-center gap-3">
                    <span className="text-ink font-bold text-sm tracking-tight">USDC</span>
                    <div className="w-8 h-8 rounded-full bg-crypto-blue flex items-center justify-center text-[10px] font-bold text-white">USDC</div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate font-bold">
                  <span>Rate: <strong className="text-primary">{xlmPrice ? `1 XLM = ${xlmPrice.toFixed(4)} USDC` : "Fetching..."}</strong></span>
                  <span>Spread: <span className="text-crypto-red">0.02%</span></span>
                </div>
              </div>

              <div className="card-binance p-6 bg-white shadow-sm flex-grow">
                <h3 className="text-slate text-[10px] font-bold tracking-widest uppercase mb-8">Simulation Parameters</h3>
                
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-widest">Capital Allocation</label>
                    <span className="text-xl font-bold text-ink tracking-tighter">{capital.toLocaleString()} <span className="text-slate text-xs">XLM</span></span>
                  </div>
                  <input 
                    className="w-full h-1.5 bg-snow rounded-lg appearance-none cursor-pointer accent-primary" 
                    max="100000" 
                    min="1000" 
                    type="range" 
                    value={capital}
                    onChange={(e) => setCapital(parseInt(e.target.value))}
                  />
                </div>

                <div className="mb-10">
                  <label className="block text-[10px] font-bold text-slate uppercase tracking-widest mb-4">Leverage Multiplier</label>
                  <div className="bg-snow rounded-lg px-4 py-3 border border-border-light focus-within:border-primary transition-all flex justify-between items-center">
                    <input 
                      className="bg-transparent border-none p-0 text-ink font-bold focus:ring-0 w-24 outline-none" 
                      step="0.1" 
                      type="number" 
                      value={leverage}
                      onChange={(e) => setLeverage(parseFloat(e.target.value))}
                    />
                    <span className="text-slate text-sm font-bold">x</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate uppercase tracking-widest mb-4">Horizon</label>
                  <div className="flex gap-2">
                    {['1H', '4H', '24H', '7D'].map((time) => (
                      <button 
                        key={time} 
                        onClick={() => setHorizon(time)}
                        className={`flex-1 py-2.5 rounded-md text-[10px] font-bold border transition-all ${time === horizon ? 'bg-primary text-ink border-primary' : 'bg-white border-border-light text-slate hover:text-ink hover:border-slate'}`}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Metrics */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-binance p-6 bg-white shadow-sm border-l-4 border-primary">
                  <span className="text-slate text-[10px] font-bold uppercase tracking-widest block mb-2">Projected Profit</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-ink tracking-tighter">+{expectedReturn}</span>
                    <span className="text-[10px] text-primary font-bold">XLM</span>
                  </div>
                </div>
                
                <div className="card-binance p-6 bg-white shadow-sm">
                  <span className="text-slate text-[10px] font-bold uppercase tracking-widest block mb-2">Risk Assessment</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-ink">Moderate</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                      <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                      <div className="w-1.5 h-4 bg-snow rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="card-binance p-6 bg-white shadow-sm">
                  <span className="text-slate text-[10px] font-bold uppercase tracking-widest block mb-2">Confidence Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary tracking-tighter">87</span>
                    <span className="text-[10px] text-slate font-bold">/100</span>
                  </div>
                </div>
              </div>

              <div className="card-binance p-8 bg-white shadow-sm flex-grow flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-ink font-bold text-sm tracking-tight">Yield Projection Matrix</h3>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-snow border border-border-light"></div>
                      <span className="text-[10px] font-bold text-slate uppercase tracking-widest">Base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Optimized</span>
                    </div>
                  </div>
                </div>

                <div className="flex-grow relative z-10 flex items-end">
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d={optimizedPath} fill="none" stroke="#F0B90B" strokeWidth="2" className="transition-all duration-700 ease-out"></path>
                    <path d={basePath} fill="none" stroke="#707A8A" strokeDasharray="2 2" strokeWidth="0.5" className="opacity-40 transition-all duration-700 ease-out"></path>
                    <path d={fillPath} fill="url(#yellow-glow)" opacity="0.05" className="transition-all duration-700 ease-out"></path>
                    <defs>
                      <linearGradient id="yellow-glow" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#F0B90B"></stop>
                        <stop offset="100%" stopColor="transparent"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="w-full flex justify-between text-[10px] font-bold text-slate border-t border-border-light pt-4 uppercase tracking-widest">
                    <span>Entry Point</span>
                    <span>Peak Efficiency</span>
                    <span>Horizon End</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
