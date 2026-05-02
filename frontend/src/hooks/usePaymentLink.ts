"use client";
import { useState } from "react";
import { createTransaction, TokenSymbol } from "@/services/transactions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const usePaymentLink = (address: string | null, token: TokenSymbol) => {
  const [amount, setAmount] = useState("");
  const [paymentUri, setPaymentUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!address || !amount) return;
    setLoading(true);
    try {
      const transaction = await createTransaction(address, amount, token);
      setPaymentUri(`${APP_URL}/pay/${transaction._id}`);
    } catch (e) {
      console.error("Failed to generate payment link:", e);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPaymentUri(null);
    setAmount("");
  };

  return { amount, setAmount, paymentUri, loading, generate, clear };
};

export default usePaymentLink;
