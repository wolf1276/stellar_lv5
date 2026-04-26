"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stellar, StellarAsset } from '@/lib/stellar-helper';
import { Networks } from '@stellar/stellar-sdk';

interface StellarContextType {
  address: string | null;
  setAddress: (addr: string | null) => void;
  balances: { xlm: string; assets: StellarAsset[] };
  refreshBalances: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kit: any;
  notifications: AppAlert[];
  addAlert: (alert: Omit<AppAlert, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
}

export interface AppAlert {
  id: string;
  type: 'opportunity' | 'success' | 'warning';
  title: string;
  description: string;
  timestamp: number;
}

const StellarContext = createContext<StellarContextType | undefined>(undefined);

export function StellarProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddressState] = useState<string | null>(null);
  const [balances, setBalances] = useState<{ xlm: string; assets: StellarAsset[] }>({ 
    xlm: "0.0000", 
    assets: [] 
  });

  const setAddress = useCallback((addr: string | null) => {
    setAddressState(addr);
    if (addr) {
      localStorage.setItem('sala_wallet', addr);
    } else {
      localStorage.removeItem('sala_wallet');
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('sala_wallet');
    if (cached) {
      // Use a microtask to avoid synchronous setState in effect body
      Promise.resolve().then(() => setAddressState(cached));
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kit, setKit] = useState<any>(null);
  const [notifications, setNotifications] = useState<AppAlert[]>([]);

  const addAlert = useCallback((alert: Omit<AppAlert, 'id' | 'timestamp'>) => {
    setNotifications((prev) => [
      { ...alert, id: crypto.randomUUID(), timestamp: Date.now() },
      ...prev.slice(0, 19), // keep max 20
    ]);
  }, []);

  const clearAlerts = useCallback(() => setNotifications([]), []);

  useEffect(() => {
    const initKit = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { StellarWalletsKit } = await import('@creit.tech/stellar-wallets-kit');
          const { defaultModules } = await import('@creit.tech/stellar-wallets-kit/modules/utils');
          console.log("StellarWalletsKit found:", !!StellarWalletsKit);
          console.log("defaultModules found:", !!defaultModules);
          
          StellarWalletsKit.init({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            network: Networks.TESTNET as any,
            modules: defaultModules(),
          });
          
          console.log("Setting kit in state...");
          setKit(() => StellarWalletsKit);
          console.log("Kit set in state.");
        } catch (error) {
          console.error("Failed to initialize StellarWalletsKit", error);
        }
      }
    };
    initKit();
  }, []);

  const fetchingRef = React.useRef(false);

  const refreshBalances = useCallback(async () => {
    if (!address || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const data = await stellar.getBalance(address);
      setBalances(data);
    } catch (error) {
      console.error("Context balance fetch failed", error);
    } finally {
      fetchingRef.current = false;
    }
  }, [address]);

  useEffect(() => {
    const syncBalances = async () => {
      if (address) {
        await refreshBalances();
      } else {
        setBalances({ xlm: "0.0000", assets: [] });
      }
    };
    syncBalances();
  }, [address, refreshBalances]);

  return (
    <StellarContext.Provider value={{ 
      address, 
      setAddress, 
      balances, 
      refreshBalances, 
      kit,
      notifications,
      addAlert,
      clearAlerts,
    }}>
      {children}
    </StellarContext.Provider>
  );
}

export const useStellar = () => {
  const context = useContext(StellarContext);
  if (!context) {
    throw new Error("useStellar must be used within a StellarProvider");
  }
  return context;
};
