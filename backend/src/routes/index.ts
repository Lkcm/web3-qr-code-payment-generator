import { Router } from "express";
import transactionsRouter from "./transaction";

const router = Router();

router.use("/transactions", transactionsRouter);

router.get("/", (_req, res) => {
  res.json({ message: "API is running 🚀", version: "1.0.0" });
});

export default router;