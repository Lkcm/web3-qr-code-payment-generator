import { createPublicClient, http, formatEther } from "viem";
import { polygon, polygonAmoy } from "viem/chains";
import { useEffect, useState } from "react";

const CHAIN = process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? polygon : polygonAmoy;

const publicClient = createPublicClient({
  chain: CHAIN,
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