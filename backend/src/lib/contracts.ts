import { parseAbi, http } from "viem";
import { polygon, polygonAmoy, hardhat } from "viem/chains";

function resolveChain() {
  switch (process.env.CHAIN) {
    case "mainnet": return polygon;
    case "local":   return hardhat;
    default:        return polygonAmoy;
  }
}

export const CHAIN = resolveChain();

export const TRANSPORT = http(process.env.RPC_URL);

export const TOKEN_DECIMALS = 6;

export const TOKENS = {
  USDC: process.env.USDC_ADDRESS as `0x${string}`,
  USDT: process.env.USDT_ADDRESS as `0x${string}`,
} as const;

export type TokenSymbol = keyof typeof TOKENS;

export const erc20TransferAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
