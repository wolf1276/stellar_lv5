"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useStellar } from '@/context/StellarContext';
import { stellar } from '@/lib/stellar-helper';
import { calculateOpportunityScore } from '@/lib/scoring';
import { nativeToScVal } from '@stellar/stellar-sdk';

// Replace with your actual deployed contract ID
const ARB_EXECUTOR_CONTRACT_ID = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

export default function ArbitrageExecutionPage() {
  const { address, balances, refreshBalances, kit } = useStellar();
  const [isExecuting, setIsExecuting] = useState(false);
  const [spread, setSpread] = useState(0.45);
  const [score, setScore] = useState(75);
  const [slippage, setSlippage] = useState<number | 'custom'>(0.1);
  const [customSlippage, setCustomSlippage] = useState('');

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
    if (!address || !kit) {
      toast.error('Connect your wallet to execute arbitrage.', {
        description: 'Use the Connect button in the top-right corner.',
      });
      return;
    }

    if (ARB_EXECUTOR_CONTRACT_ID.startsWith("C...")) {
      toast.error('Contract ID not configured', {
        description: 'Please deploy the ArbExecutor contract and update the ARB_EXECUTOR_CONTRACT_ID in app/arbitrage/page.tsx',
      });
      return;
    }

    setIsExecuting(true);
    try {
      // 1. Prepare steps (Simulation of a triangular arbitrage: XLM -> USDC -> yXLM -> XLM)
      const steps = [
        {
          pool: "GBBD67IF65Y6XGIBYI4L6T5XTA6O5PWHSTWVCX6O36S67554YTSAWBXI", // XLM/USDC Pool
          token_in: "CDLZFC3SYJYDZT7K67VZ75HPJVIEWCEUNHQUBSVOMOMK22M7Z3RVJ6Z3", // XLM Native Asset Contract ID on Testnet
          token_out: "CCW6S4S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7S7", // USDC Contract ID
          min_out: 1100n, // Use BigInt so it maps to i128 in Soroban
        },
        // Additional steps would go here
      ];

      // 2. Build Soroban Arguments
      const amountIn = 10000000000n; // 1000 XLM (with 7 decimals)
      const minAmountOut = 10100000000n; // 1010 XLM (expected profit)

      const scArgs = [
        nativeToScVal(steps),
        nativeToScVal(amountIn, { type: 'i128' }),
        nativeToScVal(minAmountOut, { type: 'i128' }),
      ];

      // 3. Build Invoke Contract XDR
      const xdr = await stellar.buildInvokeContractXDR(
        address,
        ARB_EXECUTOR_CONTRACT_ID,
        "execute_arbitrage",
        scArgs
      );

      // 4. Sign and Submit
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: "Test SDF Network ; September 2015"
      });

      const result = await stellar.submitXDR(signedTxXdr);

      if (result.success) {
        toast.success('Arbitrage execution confirmed!', {
          description: `Hash: ${result.hash?.substring(0, 16)}...`,
          action: {
            label: 'View Explorer',
            onClick: () => window.open(stellar.getExplorerLink(result.hash), '_blank'),
          },
        });
        refreshBalances();
      } else {
        toast.error('Execution failed', { description: result.error });
      }
    } catch (e: unknown) {
      console.error("Arb execution error:", e);
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("User rejected")) {
        toast.warning('Transaction rejected', { description: 'You cancelled the signing request.' });
      } else {
        toast.error('Execution error', { description: message });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Header Section */}
      <section className="px-8 md:px-12 py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-ink mb-2 tracking-tight">One-Click Arbitrage</h1>
          <p className="text-slate text-sm max-w-lg font-medium">Execute optimized multi-hop pathways across the Stellar network with institutional precision.</p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-8 md:px-12 py-12 bg-snow flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Pathway Selection */}
            <div className="lg:col-span-2 space-y-10">
              <div className="card-binance p-8 bg-white">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xs font-bold text-slate uppercase tracking-widest">Identified Pathway</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded">Heuristic Score: {score}</span>
                </div>
                
                <div className="flex items-center justify-between mt-8 relative">
                  <div className="absolute left-0 top-[20px] w-full h-px border-t border-dashed border-border-light -z-0"></div>
                  
                  <div className="flex flex-col items-center bg-white px-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-snow border border-border-light flex items-center justify-center mb-3">
                      <span className="font-bold text-ink text-xs">XLM</span>
                    </div>
                    <span className="text-[10px] text-slate font-bold uppercase tracking-tighter">SOURCE</span>
                  </div>

                  <span className="material-symbols-outlined text-slate/30 text-sm z-10">arrow_forward</span>

                  <div className="flex flex-col items-center bg-white px-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-snow border border-border-light flex items-center justify-center mb-3">
                      <span className="font-bold text-ink text-xs">USDC</span>
                    </div>
                    <span className="text-[10px] text-crypto-green font-bold">+{spread.toFixed(2)}%</span>
                  </div>

                  <span className="material-symbols-outlined text-slate/30 text-sm z-10">arrow_forward</span>

                  <div className="flex flex-col items-center bg-white px-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-snow border border-border-light flex items-center justify-center mb-3">
                      <span className="font-bold text-ink text-xs">yXLM</span>
                    </div>
                    <span className="text-[10px] text-crypto-green font-bold">+0.45%</span>
                  </div>

                  <span className="material-symbols-outlined text-slate/30 text-sm z-10">arrow_forward</span>

                  <div className="flex flex-col items-center bg-white px-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(240,185,11,0.2)]">
                      <span className="font-bold text-ink text-xs">XLM</span>
                    </div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">SETTLE</span>
                  </div>
                </div>
              </div>

              <div className="card-binance p-8 bg-white">
                <label className="block text-xs font-bold text-slate mb-6 uppercase tracking-widest">Execution Parameters</label>
                <div className="relative flex items-center border-b border-border-light focus-within:border-primary transition-colors pb-4">
                  <input className="bg-transparent border-none text-5xl font-bold text-ink w-full focus:ring-0 p-0 placeholder:text-slate/20" placeholder="0.00" type="text" defaultValue="10,000.00"/>
                  <span className="text-xl font-bold text-slate ml-4">XLM</span>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-xs text-slate font-medium">Available Assets: <span className="text-ink font-bold">{address ? `${parseFloat(balances.xlm).toLocaleString()} XLM` : "0.00 XLM"}</span></span>
                  <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">Max Amount</button>
                </div>
              </div>
            </div>

            {/* Execution Sidebar */}
            <div className="space-y-6">
              <div className="card-binance p-8 bg-white flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate uppercase tracking-widest mb-10 pb-2 border-b border-border-light">Execution Summary</h3>
                
                <div className="space-y-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate font-medium">Estimated Net Profit</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-crypto-green">~{(10000 * spread / 100).toFixed(2)} XLM</div>
                      <div className="text-xs text-slate font-medium mt-1">≈ ${((10000 * spread / 100) * 0.12).toFixed(2)} USD</div>
                    </div>
                  </div>
                  
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate font-medium">Gross Spread</span>
                        <span className="text-ink font-bold">{spread.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate font-medium">Network Fee (XLM)</span>
                        <span className="text-ink font-bold">0.00004</span>
                      </div>

                      {/* Slippage Tolerance Selector */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate font-medium">Slippage Tolerance</span>
                        <div className="flex items-center gap-1">
                          {[0.1, 0.5, 1.0].map((v) => (
                            <button
                              key={v}
                              onClick={() => { setSlippage(v); setCustomSlippage(''); }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                                slippage === v
                                  ? 'bg-primary text-ink border-primary'
                                  : 'bg-snow text-slate border-border-light hover:border-ink'
                              }`}
                            >
                              {v}%
                            </button>
                          ))}
                          <button
                            onClick={() => setSlippage('custom')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                              slippage === 'custom'
                                ? 'bg-primary text-ink border-primary'
                                : 'bg-snow text-slate border-border-light hover:border-ink'
                            }`}
                          >
                            Custom
                          </button>
                        </div>
                      </div>
                      {slippage === 'custom' && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate font-medium" />
                          <div className="flex items-center gap-1 border border-border-light rounded px-2 py-0.5 focus-within:border-ink">
                            <input
                              type="number" min="0" max="50" step="0.1"
                              placeholder="e.g. 2"
                              value={customSlippage}
                              onChange={(e) => setCustomSlippage(e.target.value)}
                              className="w-12 bg-transparent text-[10px] font-bold text-ink outline-none"
                            />
                            <span className="text-[10px] text-slate font-bold">%</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate font-medium">Settlement Speed</span>
                        <span className="text-crypto-green font-bold">~5s</span>
                      </div>
                    </div>
                </div>

                <div className="mt-12">
                  <button 
                    onClick={handleExecuteArb}
                    disabled={isExecuting}
                    className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">{isExecuting ? 'sync' : 'bolt'}</span>
                    <span>{isExecuting ? 'BROADCASTING...' : 'EXECUTE ARBITRAGE'}</span>
                  </button>
                  <p className="text-center text-[10px] text-slate mt-4 font-medium italic">Transactions are finalized instantly on-chain.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
