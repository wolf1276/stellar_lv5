"use client";

import React, { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { useStellar } from '@/context/StellarContext';

export default function ProfitSimulatorPage() {
  const [capital, setCapital] = useState(10000);
  const [leverage, setLeverage] = useState(1.0);
  const [xlmPrice, setXlmPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      const price = await stellar.getPoolPrice('XLM', 'USDC', undefined, 'GBBD67V63DU7T7WGXX3ZW3SJGR4FB46GEHACXDVOFY76NCO27LYA6AXY');
      setXlmPrice(price);
    }
    fetchPrice();
  }, []);

  const expectedReturn = (capital * leverage * 0.042).toFixed(2);

  return (
    <div className="px-6 md:px-12 pb-24 max-w-7xl mx-auto w-full flex flex-col gap-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-lora text-4xl md:text-5xl text-white mb-2 tracking-tight">Profit Simulator</h1>
          <p className="text-gray-400 text-sm max-w-2xl font-['Inter']">Model arbitrage opportunities across Stellar liquidity pools. Adjust parameters to forecast potential returns based on real network liquidity.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-6 shadow-2xl">
            <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">Trading Pair</h3>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/10 text-[10px] font-bold text-white">XLM</div>
                <span className="text-white font-medium text-sm">Native</span>
              </div>
              <span className="material-symbols-outlined text-primary text-sm">swap_horiz</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium text-sm">USDC</span>
                <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center border border-white/10 text-[10px] font-bold text-white">USDC</div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-white/40 font-mono">
              <span>Rate: <strong className="text-primary">{xlmPrice ? `1 XLM = ${xlmPrice.toFixed(4)} USDC` : "Fetching..."}</strong></span>
              <span>Spread: <span className="text-red-400">0.02%</span></span>
            </div>
          </div>

          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-6 shadow-2xl flex-grow">
            <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">Simulation Parameters</h3>
            
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Capital Allocation</label>
                <span className="text-xl font-mono text-primary">{capital.toLocaleString()} XLM</span>
              </div>
              <input 
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary" 
                max="100000" 
                min="1000" 
                type="range" 
                value={capital}
                onChange={(e) => setCapital(parseInt(e.target.value))}
              />
            </div>

            <div className="mb-10">
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Leverage Multiplier</label>
              <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10 focus-within:border-primary/50 transition-all flex justify-between items-center">
                <input 
                  className="bg-transparent border-none p-0 text-white font-mono focus:ring-0 w-24 outline-none" 
                  step="0.1" 
                  type="number" 
                  value={leverage}
                  onChange={(e) => setLeverage(parseFloat(e.target.value))}
                />
                <span className="text-white/20 text-sm font-mono">x</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Horizon</label>
              <div className="flex gap-2">
                {['1H', '4H', '24H', '7D'].map((time) => (
                  <button key={time} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${time === '4H' ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}>
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
            <div className="bg-[#1E1E1E] border-l-4 border-primary rounded-xl p-6 shadow-2xl">
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Projected Profit</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono text-white font-black">+{expectedReturn}</span>
                <span className="text-xs text-primary font-bold">XLM</span>
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-6 shadow-2xl">
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Risk Level</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white">Moderate</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  <div className="w-1.5 h-4 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-6 shadow-2xl">
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Confidence Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono text-primary font-black">87</span>
                <span className="text-xs text-white/20 font-bold">/100</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 shadow-2xl flex-grow relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-10 z-10">
              <h3 className="text-white font-bold text-sm tracking-tight">Profit vs. Time Projection</h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Optimized</span>
                </div>
              </div>
            </div>

            <div className="flex-grow relative min-h-[300px] z-10 flex items-end">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 80 Q 25 70, 50 40 T 80 20 T 100 10" fill="none" stroke="#FDDA24" strokeWidth="2" className="opacity-20"></path>
                <path d="M0 80 Q 20 75, 40 60 T 70 50 T 100 45" fill="none" stroke="white" strokeDasharray="2 2" strokeWidth="0.5" className="opacity-10"></path>
                <path d="M0 80 Q 25 70, 50 40 T 80 20 T 100 10 L 100 100 L 0 100 Z" fill="url(#yellow-glow)" opacity="0.05"></path>
                <defs>
                  <linearGradient id="yellow-glow" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#FDDA24"></stop>
                    <stop offset="100%" stopColor="transparent"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="w-full flex justify-between text-[10px] font-mono text-white/20 border-t border-white/5 pt-4 uppercase tracking-widest font-bold">
                <span>Start</span>
                <span>Peak</span>
                <span>Horizon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
