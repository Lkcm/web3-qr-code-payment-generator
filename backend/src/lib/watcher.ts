import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import Transaction, { ITransaction } from "../models/Transaction.js";
import { emitTransactionUpdate } from "./socket.js";

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(process.env.ANKR_RPC_URL),
});

type PendingEntry = {
  _id: string;
  address: string;
  expectedAmount: string;
  expiresAt: Date;
};

const pendingMap = new Map<string, PendingEntry>();
let unwatch: (() => void) | null = null;

export function addToPendingMap(transaction: ITransaction): void {
  pendingMap.set(transaction._id.toString(), {
    _id: transaction._id.toString(),
    address: transaction.address,
    expectedAmount: transaction.expectedAmount,
    expiresAt: transaction.expiresAt,
  });
  console.log(`📋 Added to pending map: ${transaction._id} | map size: ${pendingMap.size}`);
  startWatching();
}

function startWatching(): void {
  if (unwatch) return; // already watching

  console.log("👀 Starting watcher...");
  unwatch = client.watchBlocks({
    includeTransactions: true,
    emitMissed: true,
    emitOnBegin: true,
    pollingInterval: 4_000,
    onBlock: async (block) => {
      console.log(`📦 Block: ${block.number} | txs: ${block.transactions.length} | pending: ${pendingMap.size}`);

      const now = new Date();

      // Check for expired transactions
      for (const [id, entry] of pendingMap) {
        if (now > entry.expiresAt) {
          pendingMap.delete(id);
          console.log(`⏰ Transaction expired: ${id}`);

          const updated = await Transaction.findByIdAndUpdate(
            id,
            { status: "expired" },
            { new: true }
          );
          if (updated) emitTransactionUpdate(entry.address, updated);
        }
      }

      if (pendingMap.size === 0) {
        stopWatching();
        return;
      }

      const pendingAddresses = new Set([...pendingMap.values()].map((e) => e.address.toLowerCase()));

      for (const tx of block.transactions) {
        if (typeof tx === "string" || !tx.to) continue;
        if (!pendingAddresses.has(tx.to.toLowerCase())) continue;

        console.log(`🎯 TX to tracked wallet detected!`);
        console.log(`   └─ hash: ${tx.hash}`);
        console.log(`   └─ to: ${tx.to}`);
        console.log(`   └─ value: ${tx.value}`);

        const entry = [...pendingMap.values()].find(
          (e) =>
            e.address.toLowerCase() === tx.to!.toLowerCase() &&
            e.expectedAmount === tx.value.toString()
        );

        if (!entry) {
          console.log(`   └─ ❌ No matching pending transaction`);
          continue;
        }

        const alreadyProcessed = await Transaction.findOne({ txHash: tx.hash });
        if (alreadyProcessed) continue;

        const updated = await Transaction.findByIdAndUpdate(
          entry._id,
          { status: "confirmed", txHash: tx.hash, receivedAmount: tx.value.toString() },
          { new: true }
        );

        pendingMap.delete(entry._id);
        console.log(`   └─ ✅ Transaction confirmed: ${tx.hash} | map size: ${pendingMap.size}`);

        if (updated) emitTransactionUpdate(entry.address, updated);

        if (pendingMap.size === 0) stopWatching();
      }
    },
    onError: (error) => {
      console.error("⚠️ Watcher error:", error.message);
    },
  });
}

function stopWatching(): void {
  if (!unwatch) return;
  unwatch();
  unwatch = null;
  console.log("🛑 Watcher stopped — no pending transactions");
}

export async function startWatcher(): Promise<void> {
  // Re-populate map from DB on startup
  const pending = await Transaction.find({ status: "pending" });
  if (pending.length) {
    pending.forEach(addToPendingMap);
    console.log(`🔄 Restored ${pending.length} pending transaction(s) from DB`);
  } else {
    console.log("💤 No pending transactions, watcher idle");
  }
}