import { parseAbi } from "viem";
import { polygon, polygonAmoy } from "viem/chains";

export const CHAIN = process.env.CHAIN === "mainnet" ? polygon : polygonAmoy;

export const TOKEN_DECIMALS = 6;

export const TOKENS = {
  USDC: process.env.USDC_ADDRESS as `0x${string}`,
  USDT: process.env.USDT_ADDRESS as `0x${string}`,
} as const;

export type TokenSymbol = keyof typeof TOKENS;

export const erc20TransferAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
