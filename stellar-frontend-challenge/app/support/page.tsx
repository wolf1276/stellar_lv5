import React from 'react';

export default function SupportPage() {
  return (
    <div className="px-6 md:px-12 pb-24 max-w-7xl mx-auto w-full flex flex-col gap-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-lora text-4xl md:text-5xl text-white mb-2 tracking-tight">Support Center</h1>
          <p className="text-gray-400 text-sm max-w-2xl font-['Inter']">
            Get help with your integrations, operations, and troubleshooting for SALA.
          </p>
        </div>
        <button className="bg-primary text-black px-6 py-2.5 rounded-md text-sm font-bold tracking-tight hover:opacity-90 transition-all flex items-center gap-2 shadow-lg">
          <span className="material-symbols-outlined text-lg">support_agent</span>
          Open Ticket
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column - Main Content */}
        <div className="md:col-span-8 flex flex-col gap-8">
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 shadow-2xl">
            <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">Frequently Asked Questions</h3>
            
            <div className="space-y-4">
              <div className="border border-white/10 rounded-lg p-5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold text-sm">Why did my transaction fail with tx_failed?</h4>
                  <span className="material-symbols-outlined text-white/40 group-hover:text-primary transition-colors">expand_more</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Transaction failures typically occur due to sudden slippage beyond your configured tolerance, or insufficient base reserves to cover network fees. Check the Soroban limits and ensure your account has sufficient XLM.
                </p>
              </div>

              <div className="border border-white/10 rounded-lg p-5 bg-transparent cursor-pointer hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-bold text-sm">How is the liquidation threshold calculated?</h4>
                  <span className="material-symbols-outlined text-white/40 group-hover:text-primary transition-colors">expand_more</span>
                </div>
              </div>

              <div className="border border-white/10 rounded-lg p-5 bg-transparent cursor-pointer hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-bold text-sm">Can I adjust the polling rate for the Python Bot?</h4>
                  <span className="material-symbols-outlined text-white/40 group-hover:text-primary transition-colors">expand_more</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* System Status */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 shadow-2xl">
            <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 p-4 border border-white/5 rounded-lg bg-black/20">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Network</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-white font-mono text-sm">Operational</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-4 border border-white/5 rounded-lg bg-black/20">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Horizon API</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-white font-mono text-sm">99.9% Uptime</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-4 border border-white/5 rounded-lg bg-black/20">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Soroban RPC</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                  <span className="text-white font-mono text-sm">Degraded</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-4 border border-white/5 rounded-lg bg-black/20">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Indexers</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-white font-mono text-sm">Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact & Resources */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] border border-white/5 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-primary/5 transition-colors">
              <span className="material-symbols-outlined text-9xl">forum</span>
            </div>
            <span className="material-symbols-outlined text-primary text-3xl mb-4 relative z-10">forum</span>
            <h3 className="text-white font-bold text-lg mb-2 relative z-10">Community Discord</h3>
            <p className="text-gray-400 text-sm mb-6 relative z-10">
              Join the official SALA Discord to chat with other operators and the core engineering team.
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-md transition-colors relative z-10">
              Join Server
            </button>
          </div>

          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-6 shadow-2xl">
            <span className="material-symbols-outlined text-white/40 text-3xl mb-4">mail</span>
            <h3 className="text-white font-bold text-lg mb-2">Email Support</h3>
            <p className="text-gray-400 text-sm mb-6">
              For enterprise queries, bug reports, and account issues, reach out directly.
            </p>
            <a href="mailto:support@sala.io" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              support@sala.io <span className="material-symbols-outlined text-xs">arrow_outward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
