import { createWalletClient, custom } from "viem";
import { bscTestnet } from "viem/chains";

export async function connectMetaMask() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const [address] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const client = createWalletClient({
    account: address,
    chain: bscTestnet,
    transport: custom(window.ethereum),
  });

  return { address, client };
}