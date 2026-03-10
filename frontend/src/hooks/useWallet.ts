"use client";
import { useState } from "react";
import { connectMetaMask } from "@/lib/wallet";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setLoading(true);
    setError(null);
    try {
      const { address } = await connectMetaMask();
      setAddress(address);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setAddress(null);
  }

  return { address, loading, error, connect, disconnect };
}