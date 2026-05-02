import mongoose, { Document, Schema } from "mongoose";
import { TokenSymbol } from "../lib/contracts.js";

export type TransactionStatus = "pending" | "confirmed" | "invalid_amount" | "expired";

export interface ITransaction extends Document {
  address: string;
  expectedAmount: string;
  token: TokenSymbol;
  expiresAt: Date;
  status: TransactionStatus;
  txHash: string | null;
  receivedAmount: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    address: { type: String, required: true },
    expectedAmount: { type: String, required: true },
    token: { type: String, enum: ["USDC", "USDT"], required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "invalid_amount", "expired"],
      default: "pending",
    },
    txHash: { type: String, default: null },
    receivedAmount: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);