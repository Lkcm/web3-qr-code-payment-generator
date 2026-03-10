import { createPublicClient, http, formatEther } from "viem";
import { bscTestnet } from "viem/chains";
import { useEffect, useState } from "react";

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

export function useBalance(address: string | null) {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return setBalance(null);

    publicClient
      .getBalance({ address: address as `0x${string}` })
      .then((val) => setBalance(formatEther(val).slice(0, 6)));
  }, [address]);

  return balance;
}