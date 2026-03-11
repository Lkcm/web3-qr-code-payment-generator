import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import Transaction from "../models/Transaction";

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

const checkPendingTransactions = async () : Promise<void> => {
  const pendingTransactions = await Transaction.find({ status: "pending" });
  if (!pendingTransactions.length) return;

  const currentBlock = await client.getBlockNumber();

  for (const pending of pendingTransactions) {
    const address = pending.address as `0x${string}`;
    const fromBlock = BigInt(pending.fromBlock);

    for (let i = fromBlock; i <= currentBlock; i++) {
      const fullBlock = await client.getBlock({
        blockNumber: i,
        includeTransactions: true,
      });

      for (const tx of fullBlock.transactions) {
        if (typeof tx === "string" || !tx.to) continue;
        if (tx.to.toLowerCase() !== address.toLowerCase()) continue;
        if (tx.value.toString() !== pending.expectedAmount) continue;

        const alreadyProcessed = await Transaction.findOne({ txHash: tx.hash });
        if (alreadyProcessed) continue;

        await Transaction.findByIdAndUpdate(pending._id, {
          status: "confirmed",
          txHash: tx.hash,
          receivedAmount: tx.value.toString(),
        });

        console.log(`✅ Transaction confirmed: ${tx.hash}`);
      }
    }

    // Update fromBlock to avoid re-scanning old blocks
    await Transaction.findByIdAndUpdate(pending._id, {
      fromBlock: currentBlock.toString(),
    });
  }
}

export async function startWatcher(): Promise<void> {
  console.log("👀 Watching blockchain...");
  setInterval(checkPendingTransactions, 5000);
}