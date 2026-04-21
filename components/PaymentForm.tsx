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
      const xdr = await stellar.buildPaymentXDR(
        address,
        recipient,
        amount,
        memo
      );

      const { signedTxXdr } = await kit.signTransaction(xdr);

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
      <div className="card-binance p-8 text-center flex flex-col items-center justify-center min-h-[440px] bg-white">
        <div className="w-20 h-20 rounded-full bg-snow flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-slate text-4xl">lock</span>
        </div>
        <h3 className="text-ink font-bold text-xl mb-3">Vault Connection Required</h3>
        <p className="text-slate text-sm max-w-[280px] leading-relaxed">Please connect your Stellar wallet via the navigation bar to authorize outbound asset transfers.</p>
      </div>
    );
  }

  return (
    <div className="card-binance p-8 shadow-2xl h-full flex flex-col bg-white">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-light">
        <h3 className="text-ink font-bold text-lg">Send Assets</h3>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">Fast Transfer</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-ink mb-2 block">Recipient Address</label>
            <input 
              className="w-full bg-snow border border-border-light rounded-md px-4 py-3 text-ink font-mono text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate/40"
              placeholder="Ex: GD3... (G-Address)" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-ink mb-2 block">Amount (XLM)</label>
              <input 
                className="w-full bg-snow border border-border-light rounded-md px-4 py-3 text-ink font-bold text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate/40"
                type="number" 
                step="0.0001" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink mb-2 block">Memo (Optional)</label>
              <input 
                className="w-full bg-snow border border-border-light rounded-md px-4 py-3 text-ink text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate/40"
                placeholder="Text/ID" 
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-snow p-4 rounded-md border border-border-light flex gap-4 mt-auto">
          <span className="material-symbols-outlined text-primary text-xl shrink-0">info</span>
          <p className="text-slate text-[11px] leading-relaxed font-medium">
            Authorized transfers are immutable on the Stellar ledger. Always double-check addresses. Network fee: 0.00001 XLM.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-crypto-red/5 border border-crypto-red/10 text-crypto-red text-xs p-4 rounded-md font-bold">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-crypto-green/5 border border-crypto-green/10 text-crypto-green text-xs p-4 rounded-md font-bold">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          className="btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
          disabled={loading || !recipient || !amount}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              Authorizing Transaction...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">send</span>
              Confirm Asset Transfer
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;

