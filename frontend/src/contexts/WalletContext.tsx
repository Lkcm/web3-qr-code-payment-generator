"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { connectMetaMask } from "@/lib/wallet";

const STORAGE_KEY = "wallet_connected";

interface WalletContextType {
  address: string | null;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  loading: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wasConnected = localStorage.getItem(STORAGE_KEY);
    if (wasConnected) connect();
  }, []);

  const connect = async () => {
    console.log("🔌 Connecting wallet...");
    setLoading(true);
    setError(null);
    try {
      const { address } = await connectMetaMask();
      console.log("✅ Connected:", address);
      setAddress(address);
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e: any) {
      console.error("❌ Connection error:", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WalletContext.Provider value={{ address, loading, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);