"use client";
import { useWallet } from "@/hooks/useWallet";
import Button from "@/components/atoms/Button";

const ConnectWalletButton = () => {
  const { address, loading, connect, disconnect } = useWallet();

  const label = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <Button
      label={label}
      onClick={address ? disconnect : connect}
      loading={loading}
    />
  );
}

export default ConnectWalletButton