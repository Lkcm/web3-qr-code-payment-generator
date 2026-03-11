import { Router, Request, Response } from "express";
import { createPublicClient, http, parseEther } from "viem";
import { bscTestnet } from "viem/chains";
import Transaction from "../models/Transaction.js";
import { addToPendingMap } from "../lib/watcher.js";
import { emitTransactionUpdate } from "../lib/socket.js";

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(process.env.ANKR_RPC_URL),
});

const router = Router();

const EXPIRY_SECONDS = 30;

router.get("/", async (req: Request, res: Response) => {
  const { address } = req.query;
  const filter = address ? { address: (address as string).toLowerCase() } : {};
  const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
  res.json({ data: transactions });
});

router.get("/:id", async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json({ data: transaction });
});

router.post("/", async (req: Request, res: Response) => {
  const { address, amount } = req.body;

  if (!address || !amount) {
    res.status(400).json({ error: "Address and amount are required" });
    return;
  }

  const currentBlock = await client.getBlockNumber();
  const expiresAt = new Date(Date.now() + EXPIRY_SECONDS * 1000);

  const transaction = await Transaction.create({
    address: address.toLowerCase(),
    expectedAmount: parseEther(amount).toString(),
    fromBlock: currentBlock.toString(),
    expiresAt,
  });

  addToPendingMap(transaction);
  emitTransactionUpdate(transaction.address, transaction);

  res.status(201).json({ data: transaction });
});

export default router;