import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import Transaction from "../models/Transaction.js";

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(process.env.ANKR_RPC_URL),
});

export async function startWatcher(): Promise<void> {
  console.log("👀 Watching blockchain via watchBlocks...");

  client.watchBlocks({
    includeTransactions: true,
    emitMissed: true,      // garante que blocos perdidos sejam processados
    emitOnBegin: true,     // processa o bloco atual ao iniciar
    pollingInterval: 4_000, // BSC testnet tem ~3s por bloco
    onBlock: async (block) => {
      console.log(`📦 Block: ${block.number} | txs: ${block.transactions.length}`);

  const pendingTransactions = await Transaction.find({ status: "pending" });
  if (!pendingTransactions.length) {
    console.log(`   └─ No pending transactions, skipping`);
    return;
  }

  console.log(`   └─ ${pendingTransactions.length} pending transaction(s) to check`);

      const pendingAddresses = new Set(pendingTransactions.map((t) => t.address.toLowerCase()));

      for (const tx of block.transactions) {
        if (typeof tx === "string" || !tx.to) continue;
        if (!pendingAddresses.has(tx.to.toLowerCase())) continue;

        console.log(`🎯 TX to tracked wallet detected!`);
        console.log(`   └─ hash: ${tx.hash}`);
        console.log(`   └─ to: ${tx.to}`);
        console.log(`   └─ value: ${tx.value}`);

        const pending = pendingTransactions.find(
          (p) =>
            p.address.toLowerCase() === tx.to!.toLowerCase() &&
            p.expectedAmount === tx.value.toString()
        );

        if (!pending) {
          console.log(`   └─ ❌ No matching pending transaction`);
          continue;
        }

        const alreadyProcessed = await Transaction.findOne({ txHash: tx.hash });
        if (alreadyProcessed) continue;

        await Transaction.findByIdAndUpdate(pending._id, {
          status: "confirmed",
          txHash: tx.hash,
          receivedAmount: tx.value.toString(),
        });

        console.log(`   └─ ✅ Transaction confirmed: ${tx.hash}`);
      }
    },
    onError: (error) => {
      console.error("⚠️ Watcher error:", error.message);
    },
  });
}