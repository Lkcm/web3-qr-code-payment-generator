"use client";
import { useState } from "react";
import { parseEther } from "viem";
import { createTransaction } from "@/services/transactions";

const usePaymentLink = (address: string | null) => {
  const [amount, setAmount] = useState("");
  const [paymentUri, setPaymentUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!address || !amount) return;
    setLoading(true);
    try {
      await createTransaction(address, amount);
      const valueInWei = parseEther(amount);
      const uri = `ethereum:${address}@97?value=${valueInWei}`;
      setPaymentUri(uri);
    } catch (e) {
      console.error("Failed to generate payment link:", e);
    } finally {
      setLoading(false);
    }
  }

  const clear = () => {
    setPaymentUri(null);
    setAmount("");
  }

  return {
    amount,
    setAmount,
    paymentUri,
    loading,
    generate,
    clear,
  };
};

export default usePaymentLink;
