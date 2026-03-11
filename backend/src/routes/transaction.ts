import { Router, Request, Response } from "express";
import { parseEther, createPublicClient, http} from "viem";
import { bscTestnet } from "viem/chains";
import Transaction from "../models/Transaction";

const router = Router();

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});


router.post("/", async (req: Request, res: Response) => {
  const { address, amount } = req.body;

  if (!address || !amount) {
    res.status(400).json({ error: "Address and amount are required" });
    return;
  }

  const currentBlock = await client.getBlockNumber();

  const transaction = await Transaction.create({
    address: address.toLowerCase(),
    expectedAmount: parseEther(amount).toString(),
    fromBlock: currentBlock.toString(),
  });

  res.status(201).json({ data: transaction });
});

router.get("/:id", async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json({ data: transaction });
});

router.get("/", async (_req: Request, res: Response) => {
  const transactions = await Transaction.find().sort({ createdAt: -1 });
  res.json({ data: transactions });
});

export default router;