"use client";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";
import Button from "@/components/atoms/Button";

const ConnectWalletButton = () => {
  const { address, loading, connect, disconnect } = useWallet();
  const balance = useBalance(address);

  const label = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <div className="flex items-center gap-3">
      {balance && (
        <span className="text-sm text-gray-500 font-medium">
          {balance} BNB
        </span>
      )}
      <Button
        label={label}
        onClick={address ? disconnect : connect}
        loading={loading}
      />
    </div>
  );
}

export default ConnectWalletButton