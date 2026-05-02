import { createWalletClient, custom, getAddress, parseAbi } from "viem";
import { polygon, polygonAmoy } from "viem/chains";
import { TokenSymbol } from "@/services/transactions";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export const CHAIN = process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? polygon : polygonAmoy;

const CHAIN_HEX = process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? "0x89" : "0x13882";

const CHAIN_PARAMS =
  process.env.NEXT_PUBLIC_CHAIN_ID === "137"
    ? {
        chainId: "0x89",
        chainName: "Polygon",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com"],
        blockExplorerUrls: ["https://polygonscan.com"],
      }
    : {
        chainId: "0x13882",
        chainName: "Polygon Amoy",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://rpc-amoy.polygon.technology"],
        blockExplorerUrls: ["https://amoy.polygonscan.com"],
      };

const TOKEN_META: Record<TokenSymbol, { address: string; decimals: number }> = {
  USDC: { address: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "", decimals: 6 },
  USDT: { address: process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "", decimals: 6 },
};

const erc20TransferAbi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
]);

export async function connectMetaMask() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
  const [address] = accounts;

  const client = createWalletClient({
    account: address as `0x${string}`,
    chain: CHAIN,
    transport: custom(window.ethereum),
  });

  return { address, client };
}

export async function switchToPolygon(): Promise<void> {
  if (!window.ethereum) throw new Error("MetaMask not found");

  // wallet_addEthereumChain handles both cases:
  // adds the chain if it doesn't exist, or switches to it if it does
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [CHAIN_PARAMS],
  });
}

export async function executeTokenTransfer(
  fromAddress: string,
  tokenAddress: string,
  toAddress: string,
  amount: string
): Promise<string> {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const walletClient = createWalletClient({
    account: fromAddress as `0x${string}`,
    chain: CHAIN,
    transport: custom(window.ethereum),
  });

  const hash = await walletClient.writeContract({
    address: getAddress(tokenAddress),
    abi: erc20TransferAbi,
    functionName: "transfer",
    args: [getAddress(toAddress), BigInt(amount)],
  });

  return hash;
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

export function getExpectedChainHex(): string {
  return CHAIN_HEX;
}
