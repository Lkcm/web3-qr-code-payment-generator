import { createPublicClient } from "viem";
import { CHAIN, TRANSPORT, TOKENS, erc20TransferAbi, TokenSymbol } from "./contracts.js";
import Transaction, { ITransaction } from "../models/Transaction.js";
import { emitTransactionUpdate } from "./socket.js";

const client = createPublicClient({
  chain: CHAIN,
  transport: TRANSPORT,
});

type PendingEntry = {
  _id: string;
  address: string;
  expectedAmount: string;
  token: TokenSymbol;
  expiresAt: Date;
};

const pendingMap = new Map<string, PendingEntry>();
const unwatchers = new Map<TokenSymbol, () => void>();
let expiryInterval: ReturnType<typeof setInterval> | null = null;

export function addToPendingMap(transaction: ITransaction): void {
  pendingMap.set(transaction._id.toString(), {
    _id: transaction._id.toString(),
    address: transaction.address,
    expectedAmount: transaction.expectedAmount,
    token: transaction.token,
    expiresAt: transaction.expiresAt,
  });
  console.log(`📋 Added to pending map: ${transaction._id} | map size: ${pendingMap.size}`);
  startWatching(transaction.token);
  startExpiryChecker();
}

function startWatching(token: TokenSymbol): void {
  if (unwatchers.has(token)) return;

  console.log(`👀 Starting ${token} watcher...`);

  const unwatch = client.watchContractEvent({
    address: TOKENS[token],
    abi: erc20TransferAbi,
    eventName: "Transfer",
    pollingInterval: 4_000,
    onLogs: async (logs) => {
      if (logs.length === 0) return;
      console.log(`📦 ${token} Transfer logs: ${logs.length} | pending: ${pendingMap.size}`);

      const tokenPending = [...pendingMap.values()].filter((e) => e.token === token);
      if (tokenPending.length === 0) return;

      for (const log of logs) {
        const { to, value } = log.args as { from: `0x${string}`; to: `0x${string}`; value: bigint };
        if (!to || value === undefined) continue;

        const toAddress = to.toLowerCase();
        const txValue = value.toString();

        const matchingEntries = tokenPending.filter(
          (e) => e.address.toLowerCase() === toAddress
        );

        if (matchingEntries.length === 0) continue;

        console.log(`🎯 ${token} Transfer to tracked wallet detected!`);
        console.log(`   └─ to: ${to}`);
        console.log(`   └─ value: ${value}`);

        const exactMatch = matchingEntries.find((e) => e.expectedAmount === txValue);

        if (exactMatch) {
          const alreadyProcessed = await Transaction.findOne({ txHash: log.transactionHash });
          if (alreadyProcessed) continue;

          const updated = await Transaction.findByIdAndUpdate(
            exactMatch._id,
            { status: "confirmed", txHash: log.transactionHash, receivedAmount: txValue },
            { new: true }
          );

          pendingMap.delete(exactMatch._id);
          console.log(`   └─ ✅ Transaction confirmed: ${log.transactionHash} | map size: ${pendingMap.size}`);

          if (updated) emitTransactionUpdate(exactMatch.address, updated);
        } else {
          console.log(`   └─ ⚠️ Amount mismatch — marking as invalid_amount`);
          const entryToMark = matchingEntries[0];
          const alreadyProcessed = await Transaction.findOne({ txHash: log.transactionHash });
          if (alreadyProcessed) continue;

          const updated = await Transaction.findByIdAndUpdate(
            entryToMark._id,
            { status: "invalid_amount", txHash: log.transactionHash, receivedAmount: txValue },
            { new: true }
          );

          pendingMap.delete(entryToMark._id);
          if (updated) emitTransactionUpdate(entryToMark.address, updated);
        }

        const tokenStillPending = [...pendingMap.values()].some((e) => e.token === token);
        if (!tokenStillPending) stopWatching(token);
      }
    },
    onError: (error) => {
      console.error(`⚠️ ${token} watcher error:`, error.message);
    },
  });

  unwatchers.set(token, unwatch);
}

function stopWatching(token: TokenSymbol): void {
  const unwatch = unwatchers.get(token);
  if (!unwatch) return;
  unwatch();
  unwatchers.delete(token);
  console.log(`🛑 ${token} watcher stopped — no pending transactions`);
}

function startExpiryChecker(): void {
  if (expiryInterval) return;

  expiryInterval = setInterval(async () => {
    if (pendingMap.size === 0) {
      stopExpiryChecker();
      return;
    }

    const now = new Date();

    for (const [id, entry] of pendingMap) {
      if (now <= entry.expiresAt) continue;

      pendingMap.delete(id);
      console.log(`⏰ Transaction expired: ${id}`);

      const updated = await Transaction.findByIdAndUpdate(
        id,
        { status: "expired" },
        { new: true }
      );
      if (updated) emitTransactionUpdate(entry.address, updated);

      const tokenStillPending = [...pendingMap.values()].some((e) => e.token === entry.token);
      if (!tokenStillPending) stopWatching(entry.token);
    }
  }, 5_000);
}

function stopExpiryChecker(): void {
  if (!expiryInterval) return;
  clearInterval(expiryInterval);
  expiryInterval = null;
  console.log("🛑 Expiry checker stopped");
}

export async function startWatcher(): Promise<void> {
  const pending = await Transaction.find({ status: "pending" });
  if (pending.length) {
    pending.forEach(addToPendingMap);
    console.log(`🔄 Restored ${pending.length} pending transaction(s) from DB`);
  } else {
    console.log("💤 No pending transactions, watcher idle");
  }
}
