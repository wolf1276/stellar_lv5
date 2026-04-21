import React from 'react';

export default function SupportPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Header Section */}
      <section className="px-8 md:px-12 py-12 border-b border-border-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold text-ink mb-2 tracking-tight">Support Center</h1>
            <p className="text-slate text-sm max-w-2xl font-medium">
              Get help with your integrations, operations, and troubleshooting for the SALA ecosystem.
            </p>
          </div>
          <button className="bg-primary text-ink px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-lg">support_agent</span>
            Open Ticket
          </button>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-8 md:px-12 py-12 bg-snow flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column - Main Content */}
            <div className="md:col-span-8 flex flex-col gap-8">
              <div className="card-binance p-8 bg-white shadow-sm">
                <h3 className="text-slate text-[10px] font-bold tracking-widest uppercase mb-8">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div className="border border-border-light rounded-lg p-5 bg-snow cursor-pointer hover:bg-white transition-all group">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-ink font-bold text-sm">Why did my transaction fail with tx_failed?</h4>
                      <span className="material-symbols-outlined text-slate group-hover:text-primary transition-colors">expand_more</span>
                    </div>
                    <p className="text-slate text-xs leading-relaxed font-medium">
                      Transaction failures typically occur due to sudden slippage beyond your configured tolerance, or insufficient base reserves to cover network fees. Check the Soroban limits and ensure your account has sufficient XLM.
                    </p>
                  </div>

                  <div className="border border-border-light rounded-lg p-5 bg-white cursor-pointer hover:bg-snow transition-all group">
                    <div className="flex justify-between items-center">
                      <h4 className="text-ink font-bold text-sm">How is the liquidation threshold calculated?</h4>
                      <span className="material-symbols-outlined text-slate group-hover:text-primary transition-colors">expand_more</span>
                    </div>
                  </div>

                  <div className="border border-border-light rounded-lg p-5 bg-white cursor-pointer hover:bg-snow transition-all group">
                    <div className="flex justify-between items-center">
                      <h4 className="text-ink font-bold text-sm">Can I adjust the polling rate for the Python Bot?</h4>
                      <span className="material-symbols-outlined text-slate group-hover:text-primary transition-colors">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Status */}
              <div className="card-binance p-8 bg-white shadow-sm">
                <h3 className="text-slate text-[10px] font-bold tracking-widest uppercase mb-8">Service Reliability</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5 p-4 border border-border-light rounded-lg bg-snow">
                    <span className="text-slate text-[10px] font-bold uppercase tracking-widest">Network</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-crypto-green rounded-full shadow-sm"></div>
                      <span className="text-ink font-bold text-xs">Operational</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 border border-border-light rounded-lg bg-snow">
                    <span className="text-slate text-[10px] font-bold uppercase tracking-widest">Horizon API</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-crypto-green rounded-full shadow-sm"></div>
                      <span className="text-ink font-bold text-xs">99.9% Uptime</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 border border-border-light rounded-lg bg-snow">
                    <span className="text-slate text-[10px] font-bold uppercase tracking-widest">Soroban RPC</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full shadow-sm"></div>
                      <span className="text-ink font-bold text-xs">Degraded</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 border border-border-light rounded-lg bg-snow">
                    <span className="text-slate text-[10px] font-bold uppercase tracking-widest">Indexers</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-crypto-green rounded-full shadow-sm"></div>
                      <span className="text-ink font-bold text-xs">Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Resources */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="card-binance p-6 bg-white hover:border-primary transition-all cursor-pointer group shadow-sm relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-snow group-hover:text-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-9xl">forum</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6 relative z-10">
                  <span className="material-symbols-outlined text-2xl">forum</span>
                </div>
                <h3 className="text-ink font-bold text-lg mb-2 relative z-10">Community Discord</h3>
                <p className="text-slate text-sm mb-6 relative z-10 font-medium leading-relaxed">
                  Join the official SALA Discord to chat with other operators and the core engineering team.
                </p>
                <button className="w-full bg-snow hover:bg-border-light text-ink font-bold text-[10px] uppercase tracking-widest py-3 rounded-md transition-colors relative z-10">
                  Join Server
                </button>
              </div>

              <div className="card-binance p-6 bg-white shadow-sm border border-border-light">
                <div className="w-12 h-12 rounded-full bg-slate/5 flex items-center justify-center text-slate mb-6">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <h3 className="text-ink font-bold text-lg mb-2">Email Support</h3>
                <p className="text-slate text-sm mb-6 font-medium leading-relaxed">
                  For enterprise queries, bug reports, and account issues, reach out directly.
                </p>
                <a href="mailto:support@sala.io" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                  support@sala.io <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
