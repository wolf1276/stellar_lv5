import React from 'react';

export default function DocsPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Header Section */}
      <section className="px-8 md:px-12 py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-ink mb-2 tracking-tight">Documentation</h1>
          <p className="text-slate text-sm max-w-2xl font-medium">
            Comprehensive guides and API references for the Stellar Arbitrage and Liquidation Assistant.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-8 md:px-12 py-12 bg-snow flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <div className="card-binance p-8 bg-white hover:border-primary transition-all cursor-pointer group shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <span className="material-symbols-outlined text-8xl">rocket_launch</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <h3 className="text-ink font-bold text-lg mb-2">Getting Started</h3>
              <p className="text-slate text-sm mb-6 relative z-10 font-medium">
                Learn the basics of SALA, how to connect your wallet, and execute your first arbitrage trade.
              </p>
              <div className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Read Guide <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>

            {/* Smart Contracts */}
            <div className="card-binance p-8 bg-white hover:border-primary transition-all cursor-pointer group shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <span className="material-symbols-outlined text-8xl">code_blocks</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-2xl">code_blocks</span>
              </div>
              <h3 className="text-ink font-bold text-lg mb-2">Soroban Contracts</h3>
              <p className="text-slate text-sm mb-6 relative z-10 font-medium">
                Deep dive into our atomic execution engine and liquidation mechanism smart contracts.
              </p>
              <div className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                View Reference <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>

            {/* API Reference */}
            <div className="card-binance p-8 bg-white hover:border-primary transition-all cursor-pointer group shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <span className="material-symbols-outlined text-8xl">api</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-2xl">api</span>
              </div>
              <h3 className="text-ink font-bold text-lg mb-2">API Reference</h3>
              <p className="text-slate text-sm mb-6 relative z-10 font-medium">
                Integrate directly with the SALA backend for programmatic trade execution and monitoring.
              </p>
              <div className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                View Endpoints <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>

            {/* Risk Models */}
            <div className="card-binance p-8 bg-white hover:border-primary transition-all cursor-pointer group shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <span className="material-symbols-outlined text-8xl">troubleshoot</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-2xl">troubleshoot</span>
              </div>
              <h3 className="text-ink font-bold text-lg mb-2">Risk Models</h3>
              <p className="text-slate text-sm mb-6 relative z-10 font-medium">
                Understand the heuristics and logic behind slippage protection and capital exposure limits.
              </p>
              <div className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Read Docs <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>

            {/* System Architecture */}
            <div className="card-binance p-8 bg-white hover:border-primary transition-all cursor-pointer group shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <span className="material-symbols-outlined text-8xl">architecture</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-2xl">architecture</span>
              </div>
              <h3 className="text-ink font-bold text-lg mb-2">System Architecture</h3>
              <p className="text-slate text-sm mb-6 relative z-10 font-medium">
                High-level overview of the Python async bot and the Stellar Horizon network integration.
              </p>
              <div className="flex items-center text-primary text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                View Diagram <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
