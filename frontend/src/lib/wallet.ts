import { createWalletClient, custom, getAddress } from "viem";
import { polygon, polygonAmoy } from "viem/chains";
import { TokenSymbol } from "@/services/transactions";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown }) => Promise<string[]>;
    };
  }
}

const CHAIN = process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? polygon : polygonAmoy;

const TOKEN_META: Record<TokenSymbol, { address: string; decimals: number }> = {
  USDC: { address: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "", decimals: 6 },
  USDT: { address: process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "", decimals: 6 },
};

export async function connectMetaMask() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const [address] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const client = createWalletClient({
    account: address as `0x${string}`,
    chain: CHAIN,
    transport: custom(window.ethereum),
  });

  return { address, client };
}

export async function addTokenToWallet(token: TokenSymbol): Promise<void> {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const { address, decimals } = TOKEN_META[token];

  await window.ethereum.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: { address: getAddress(address), symbol: token, decimals },
    },
  });
}
