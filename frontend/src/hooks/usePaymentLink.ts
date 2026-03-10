import { useState } from "react";
import { parseEther } from "viem";

export function usePaymentLink(address: string | null) {
  const [amount, setAmount] = useState("");
  const [paymentUri, setPaymentUri] = useState<string | null>(null);

  function generate() {
    if (!address || !amount) return;
    const valueInWei = parseEther(amount);
    const uri = `ethereum:${address}@97?value=${valueInWei}`;
    setPaymentUri(uri);
  }

  function clear() {
    setPaymentUri(null);
  }

  return { amount, setAmount, paymentUri, generate, clear };
}