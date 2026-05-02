"use client";
import { useWallet } from "@/contexts/WalletContext";
import { useBalance } from "@/hooks/useBalance";
import { addTokenToWallet } from "@/lib/wallet";
import Button from "@/components/atoms/Button";
import { TokenSymbol } from "@/services/transactions";

const TOKENS: TokenSymbol[] = ["USDC", "USDT"];

const ConnectWalletButton = () => {
  const { address, loading, connect, disconnect } = useWallet();
  const balance = useBalance(address);

  const label = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <div className="flex items-center gap-3">
      {address && (
        <div className="flex items-center gap-2">
          {balance && (
            <span className="text-sm text-gray-500 font-medium">
              {balance} MATIC
            </span>
          )}
          {TOKENS.map((token) => (
            <button
              key={token}
              onClick={() => addTokenToWallet(token)}
              title={`Add ${token} to MetaMask`}
              className="text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + {token}
            </button>
          ))}
        </div>
      )}
      <Button
        label={label}
        onClick={address ? disconnect : connect}
        loading={loading}
      />
    </div>
  );
};

export default ConnectWalletButton;
