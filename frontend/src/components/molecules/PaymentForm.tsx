"use client";
import { useWallet } from "@/hooks/useWallet";
import usePaymentLink from "@/hooks/usePaymentLink";
import PaymentModal from "@/components/molecules/PaymentModal";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const PaymentForm = () => {
  const { address } = useWallet();
  const { amount, setAmount, paymentUri, loading, generate, clear } = usePaymentLink(address);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && address && amount) generate();
  };

  return (
    <div className="space-y-3"  onKeyDown={handleKeyDown}>
      <p className="text-gray-400 text-sm">
        {address
          ? `Receiving to: ${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connect your wallet to get started"}
      </p>
      <Input
        type="number"
        value={amount}
        onChange={setAmount}
        placeholder="Amount in BNB"
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
}

export default PaymentForm