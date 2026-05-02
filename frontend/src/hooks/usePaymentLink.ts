"use client";
import { useState } from "react";
import { parseUnits } from "viem";
import { createTransaction, TokenSymbol } from "@/services/transactions";

const TOKEN_DECIMALS = 6;

const TOKEN_CONTRACT: Record<TokenSymbol, string> = {
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "",
  USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "",
};

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? "80002";

const usePaymentLink = (address: string | null, token: TokenSymbol) => {
  const [amount, setAmount] = useState("");
  const [paymentUri, setPaymentUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!address || !amount) return;
    setLoading(true);
    try {
      await createTransaction(address, amount, token);
      const contractAddress = TOKEN_CONTRACT[token];
      const amountInUnits = parseUnits(amount, TOKEN_DECIMALS);
      const uri = `ethereum:${contractAddress}@${CHAIN_ID}/transfer?address=${address}&uint256=${amountInUnits}`;
      setPaymentUri(uri);
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
