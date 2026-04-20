import React from 'react';

export default function DocsPage() {
  return (
    <div className="px-6 md:px-12 pb-24 max-w-7xl mx-auto w-full flex flex-col gap-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-lora text-4xl md:text-5xl text-white mb-2 tracking-tight">Documentation</h1>
          <p className="text-gray-400 text-sm max-w-2xl font-['Inter']">
            Comprehensive guides and API references for the Stellar Arbitrage and Liquidation Assistant.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Getting Started */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">rocket_launch</span>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl mb-4">rocket_launch</span>
          <h3 className="text-white font-bold text-lg mb-2">Getting Started</h3>
          <p className="text-gray-400 text-sm mb-6 relative z-10">
            Learn the basics of SALA, how to connect your wallet, and execute your first arbitrage trade.
          </p>
          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Read Guide <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </div>
        </div>

        {/* Smart Contracts */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">code_blocks</span>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl mb-4">code_blocks</span>
          <h3 className="text-white font-bold text-lg mb-2">Soroban Contracts</h3>
          <p className="text-gray-400 text-sm mb-6 relative z-10">
            Deep dive into our atomic execution engine and liquidation mechanism smart contracts.
          </p>
          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            View Reference <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </div>
        </div>

        {/* API Reference */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">api</span>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl mb-4">api</span>
          <h3 className="text-white font-bold text-lg mb-2">API Reference</h3>
          <p className="text-gray-400 text-sm mb-6 relative z-10">
            Integrate directly with the SALA backend for programmatic trade execution and monitoring.
          </p>
          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            View Endpoints <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </div>
        </div>

        {/* Risk Models */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">troubleshoot</span>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl mb-4">troubleshoot</span>
          <h3 className="text-white font-bold text-lg mb-2">Risk Models</h3>
          <p className="text-gray-400 text-sm mb-6 relative z-10">
            Understand the heuristics and logic behind slippage protection and capital exposure limits.
          </p>
          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Read Docs <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">architecture</span>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl mb-4">architecture</span>
          <h3 className="text-white font-bold text-lg mb-2">System Architecture</h3>
          <p className="text-gray-400 text-sm mb-6 relative z-10">
            High-level overview of the Python async bot and the Stellar Horizon network integration.
          </p>
          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            View Diagram <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
}
