"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStellar } from '@/context/StellarContext';
import PaymentForm from './PaymentForm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-binance-dark/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          <div className="flex items-center justify-between p-6 border-b border-border-light bg-snow">
            <h3 className="text-xl font-bold text-ink">{title}</h3>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate hover:bg-slate/10 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-0">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const DashboardModals = ({ 
  activeModal, 
  onClose 
}: { 
  activeModal: 'deposit' | 'transfer' | null, 
  onClose: () => void 
}) => {
  const { address } = useStellar();

  return (
    <>
      {/* Deposit Modal */}
      <Modal 
        isOpen={activeModal === 'deposit'} 
        onClose={onClose} 
        title="Deposit Assets"
      >
        <div className="p-8 space-y-8">
          <div className="text-center">
            <p className="text-slate text-sm font-medium mb-6">Receive assets from another wallet or exchange to your SALA vault.</p>
            
            <div className="bg-snow p-6 rounded-xl border border-dashed border-border-light mb-8">
              <div className="w-48 h-48 bg-white mx-auto rounded-lg flex items-center justify-center border border-border-light shadow-sm mb-4">
                {/* Simplified QR Placeholder */}
                <div className="w-40 h-40 grid grid-cols-4 grid-rows-4 gap-1 p-2 opacity-20">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="bg-ink rounded-sm" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-1">Your Public Address</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-ink font-mono text-xs break-all px-2 py-1 bg-white rounded border border-border-light">
                  {address || "Wallet not connected"}
                </code>
                {address && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      alert("Address copied!");
                    }}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href="https://laboratory.stellar.org/#friendbot?network=testnet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full btn-primary flex items-center justify-center gap-2 no-underline"
              >
                <span className="material-symbols-outlined">faucet</span>
                Get Testnet XLM (Friendbot)
              </a>
              <p className="text-[10px] text-slate italic">
                Only use Testnet funds. Never send real mainnet assets to a testnet address.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal 
        isOpen={activeModal === 'transfer'} 
        onClose={onClose} 
        title="Transfer Assets"
      >
        <div className="p-0">
          <PaymentForm onSuccess={onClose} />
        </div>
      </Modal>
    </>
  );
};
