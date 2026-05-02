import { Router, Request, Response } from "express";
import { parseUnits } from "viem";
import Transaction from "../models/Transaction.js";
import { addToPendingMap } from "../lib/watcher.js";
import { emitTransactionUpdate } from "../lib/socket.js";
import { TOKEN_DECIMALS, TokenSymbol } from "../lib/contracts.js";

const router = Router();

const EXPIRY_SECONDS = 300;
const VALID_TOKENS: TokenSymbol[] = ["USDC", "USDT"];

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
  const { address, amount, token } = req.body;

  if (!address || amount === undefined || amount === null || !token) {
    res.status(400).json({ error: "Address, amount and token are required" });
    return;
  }

  if (!VALID_TOKENS.includes(token)) {
    res.status(400).json({ error: `Token must be one of: ${VALID_TOKENS.join(", ")}` });
    return;
  }

  const parsed = Number(amount);
  if (isNaN(parsed) || parsed <= 0) {
    res.status(400).json({ error: "Amount must be a valid positive number" });
    return;
  }

  const expiresAt = new Date(Date.now() + EXPIRY_SECONDS * 1000);

  const transaction = await Transaction.create({
    address: address.toLowerCase(),
    expectedAmount: parseUnits(amount, TOKEN_DECIMALS).toString(),
    token,
    expiresAt,
  });

  addToPendingMap(transaction);
  emitTransactionUpdate(transaction.address, transaction);

  res.status(201).json({ data: transaction });
});

export default router;