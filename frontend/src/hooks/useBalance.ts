import { createPublicClient, http, formatUnits, parseAbi, getAddress } from "viem";
import { useEffect, useState } from "react";
import { TokenSymbol } from "@/services/transactions";
import { CHAIN } from "@/lib/wallet";

const TOKEN_ADDRESS: Record<TokenSymbol, string> = {
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "",
  USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "",
};

const erc20BalanceAbi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
});

export function useBalance(address: string | null, token: TokenSymbol) {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return setBalance(null);

    const contractAddress = TOKEN_ADDRESS[token];
    if (!contractAddress) return;

    publicClient
      .readContract({
        address: getAddress(contractAddress),
        abi: erc20BalanceAbi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      })
      .then((val) => setBalance(formatUnits(val, 6).slice(0, 8)))
      .catch(() => setBalance("0"));
  }, [address, token]);

  return balance;
}
