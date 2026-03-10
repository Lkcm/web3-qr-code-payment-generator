"use client";
import { useWallet } from "@/hooks/useWallet";
import { usePaymentLink } from "@/hooks/usePaymentLink";
import PaymentModal from "@/components/molecules/PaymentModal";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const PaymentForm = () => {
  const { address } = useWallet();
  const { amount, setAmount, paymentUri, generate, clear } = usePaymentLink(address);

  return (
    <div className="flex flex-col gap-2">
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
        disabled={!address || !amount}
      />
      {paymentUri && <PaymentModal uri={paymentUri} onClose={clear} />}
    </div>
  );
}

export default PaymentForm