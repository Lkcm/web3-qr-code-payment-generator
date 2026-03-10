import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import Transaction from "../models/Transaction";

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

export async function startWatcher(): Promise<void> {
  console.log("👀 Watching blockchain...");

  client.watchBlocks({
    onBlock: async (block) => {
      const fullBlock = await client.getBlock({
        blockHash: block.hash,
        includeTransactions: true,
      });

      for (const tx of fullBlock.transactions) {
        if (typeof tx === "string" || !tx.to) continue;

        const pending = await Transaction.findOne({
          address: tx.to.toLowerCase(),
          status: "pending",
        });

        if (!pending) continue;

        const expectedWei = BigInt(pending.expectedAmount);

        if (tx.value === expectedWei) {
          await Transaction.findByIdAndUpdate(pending._id, {
            status: "confirmed",
            txHash: tx.hash,
            receivedAmount: tx.value.toString(),
          });
          console.log(`✅ Transaction confirmed: ${tx.hash}`);
        } else {
          await Transaction.findByIdAndUpdate(pending._id, {
            status: "invalid_amount",
            txHash: tx.hash,
            receivedAmount: tx.value.toString(),
          });
          console.log(`❌ Invalid amount for tx: ${tx.hash}`);
        }
      }
    },
  });
}