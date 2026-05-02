"use client";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import usePayment, { PaymentStep } from "@/hooks/usePayment";

const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? "Polygon" : "Polygon Amoy";

const stepConfig: Partial<Record<PaymentStep, { label: string; action?: string; color: string }>> = {
  connect:        { label: "Connect your MetaMask wallet to continue", action: "Connect Wallet", color: "blue" },
  switch_network: { label: `Switch your wallet to ${CHAIN_NAME}`, action: `Switch to ${CHAIN_NAME}`, color: "orange" },
  low_gas:        { label: "You need a small amount of MATIC to cover gas fees (~$0.001)", color: "orange" },
  low_balance:    { label: "Insufficient balance to complete this payment", color: "red" },
  ready:          { label: "Everything looks good — confirm the payment below", action: "Pay now", color: "green" },
  sending:        { label: "Waiting for your confirmation in MetaMask...", color: "blue" },
  pending:        { label: "Transaction submitted — waiting for blockchain confirmation", color: "blue" },
  confirmed:      { label: "Payment received!", color: "green" },
  expired:        { label: "This payment link has expired", color: "gray" },
  invalid_amount: { label: "Wrong amount was sent", color: "red" },
  error:          { label: "Something went wrong. Please try again.", color: "red" },
};

const colorClass: Record<string, string> = {
  blue:   "bg-blue-50 text-blue-600 border-blue-200",
  green:  "bg-green-50 text-green-600 border-green-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
  red:    "bg-red-50 text-red-600 border-red-200",
  gray:   "bg-gray-50 text-gray-500 border-gray-200",
};

function useCountdown(expiresAt: string | undefined) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => setTimeLeft(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

export default function PaymentView({ id }: { id: string }) {
  const { transaction, step, buyerBalance, maticBalance, errorMessage, connect, switchNetwork, pay } = usePayment(id);
  const timeLeft = useCountdown(transaction?.expiresAt);
  const config = stepConfig[step];

  const handleAction = () => {
    if (step === "connect") connect();
    else if (step === "switch_network") switchNetwork();
    else if (step === "ready") pay();
  };

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
        Loading payment...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center flex-1 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">Payment Request</p>
          {transaction && (
            <p className="text-xs text-gray-400 font-mono">
              To: {transaction.address.slice(0, 8)}...{transaction.address.slice(-6)}
            </p>
          )}
        </div>

        {/* Amount */}
        {transaction && (
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">
              {formatUnits(BigInt(transaction.expectedAmount), 6)}
            </p>
            <p className="text-lg text-gray-500 font-medium mt-1">{transaction.token}</p>
          </div>
        )}

        {/* Timer */}
        {timeLeft !== null && step !== "confirmed" && step !== "expired" && (
          <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border ${
            timeLeft <= 10 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${timeLeft <= 10 ? "bg-red-400" : "bg-yellow-400"}`} />
            <span className={`text-sm font-medium ${timeLeft <= 10 ? "text-red-600" : "text-yellow-600"}`}>
              {timeLeft > 0 ? `Expires in ${timeLeft}s` : "Expired"}
            </span>
          </div>
        )}

        {/* Status */}
        {config && (
          <div className={`px-4 py-3 rounded-xl border text-sm text-center ${colorClass[config.color]}`}>
            {config.label}
          </div>
        )}

        {/* Balances */}
        {buyerBalance && ["ready", "low_balance"].includes(step) && (
          <p className="text-center text-xs text-gray-400">
            Your balance: <span className="font-medium text-gray-600">{parseFloat(buyerBalance).toFixed(2)} {transaction?.token}</span>
          </p>
        )}
        {step === "low_gas" && maticBalance !== null && (
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400">
              Your MATIC balance: <span className="font-medium text-gray-600">{parseFloat(maticBalance).toFixed(6)} MATIC</span>
            </p>
            <p className="text-xs text-gray-400">
              Get MATIC from any exchange or ask the recipient to send you a small amount.
            </p>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <p className="text-xs text-red-500 text-center">{errorMessage}</p>
        )}

        {/* Action button */}
        {config?.action && (
          <button
            onClick={handleAction}
            disabled={["sending", "pending"].includes(step)}
            className="w-full py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {["sending", "pending"].includes(step) ? "Processing..." : config.action}
          </button>
        )}

        {/* Success icon */}
        {step === "confirmed" && (
          <div className="text-center text-4xl">✓</div>
        )}
      </div>
    </div>
  );
}
