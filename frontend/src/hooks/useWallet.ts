"use client";
import { useState, useEffect } from "react";
import { connectMetaMask } from "@/lib/wallet";

const STORAGE_KEY = "wallet_connected";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wasConnected = localStorage.getItem(STORAGE_KEY);
    if (wasConnected) connect();
  }, []);

  async function connect() {
    setLoading(true);
    setError(null);
    try {
      const { address } = await connectMetaMask();
      setAddress(address);
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return { address, loading, error, connect, disconnect };
}