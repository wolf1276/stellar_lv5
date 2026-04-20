"use client";

import React, { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { useStellar } from '@/context/StellarContext';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentFormProps {
  onSuccess: () => void;
}

const PaymentForm = ({ onSuccess }: PaymentFormProps) => {
  const { address, kit, refreshBalances } = useStellar();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !kit) return setError("Please connect wallet first");
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Build XDR
      const xdr = await stellar.buildPaymentXDR(
        address,
        recipient,
        amount,
        memo
      );

      // Step 2: Sign with Wallet Kit
      const { signedTxXdr } = await kit.signTransaction(xdr);

      // Step 3: Submit to Horizon
      const result = await stellar.submitXDR(signedTxXdr);

      if (result.success) {
        setSuccess(`Payment successful! Hash: ${stellar.formatAddress(result.hash, 8, 8)}`);
        setRecipient('');
        setAmount('');
        setMemo('');
        refreshBalances();
        onSuccess();
      } else {
        setError(`Transaction failed: ${result.error}`);
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to send payment. User may have rejected transaction.");
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-white/10 text-6xl mb-6">lock</span>
        <h3 className="text-white font-bold text-lg mb-2 tracking-tight">Treasury Locked</h3>
        <p className="text-white/40 text-sm max-w-[240px] leading-relaxed italic">Please connect your Freighter wallet to authorize outgoing transfers.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-8 shadow-2xl h-full flex flex-col">
      <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">Outbound Transfer</h3>
      
      <form onSubmit={handleSubmit} className="space-y-8 flex-grow flex flex-col">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-3">Destination Address</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-xs focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
              placeholder="G..." 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-3">Amount (XLM)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                type="number" 
                step="0.0001" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-3">Memo (Optional)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="Reference" 
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex gap-4 mt-auto">
          <span className="material-symbols-outlined text-primary text-xl shrink-0">info</span>
          <p className="text-white/40 text-[10px] leading-relaxed font-medium">
            Authorized transfers are immutable. Ensure the recipient address is verified before confirming. Network fee: 0.00001 XLM.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-lg font-bold uppercase tracking-widest">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] p-3 rounded-lg font-bold uppercase tracking-widest">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          className="w-full bg-primary text-black py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 shadow-lg mt-4 flex items-center justify-center gap-3"
          disabled={loading || !recipient || !amount}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              Authorizing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">send</span>
              Confirm & Authorize
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
