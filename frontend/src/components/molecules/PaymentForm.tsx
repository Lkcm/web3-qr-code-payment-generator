"use client";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import usePaymentLink from "@/hooks/usePaymentLink";
import PaymentModal from "@/components/molecules/PaymentModal";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import { TokenSymbol } from "@/services/transactions";

const TOKENS: TokenSymbol[] = ["USDC", "USDT"];

const PaymentForm = () => {
  const { address } = useWallet();
  const [token, setToken] = useState<TokenSymbol>("USDC");
  const { amount, setAmount, paymentUri, loading, generate, clear } = usePaymentLink(address, token);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && address && amount) generate();
  };

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown}>
      <p className="text-gray-400 text-sm">
        {address
          ? `Receiving to: ${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connect your wallet to get started"}
      </p>

      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {TOKENS.map((t) => (
          <button
            key={t}
            onClick={() => setToken(t)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              token === t ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Input
        type="number"
        value={amount}
        onChange={setAmount}
        placeholder={`Amount in ${token}`}
      />
      <Button
        label="Generate Payment Link"
        onClick={generate}
        loading={loading}
        disabled={!address || !amount}
      />
      {paymentUri && <PaymentModal uri={paymentUri} onClose={clear} />}
    </div>
  );
};

export default PaymentForm;
