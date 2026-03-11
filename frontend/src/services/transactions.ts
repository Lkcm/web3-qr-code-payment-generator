const API_URL = "/api";

export type TransactionStatus = "pending" | "confirmed" | "invalid_amount" | "expired";

export interface Transaction {
  _id: string;
  address: string;
  expectedAmount: string;
  status: TransactionStatus;
  txHash: string | null;
  receivedAmount: string | null;
  createdAt: string;
}

export const createTransaction = async (address: string, amount: string): Promise<Transaction> =>  {
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, amount }),
  });

  if (!res.ok) throw new Error("Failed to create transaction");
  const { data } = await res.json();
  return data;
}

export const getTransaction = async (id: string): Promise<Transaction> => {
  const res = await fetch(`${API_URL}/transactions/${id}`);
  if (!res.ok) throw new Error("Failed to fetch transaction");
  const { data } = await res.json();
  return data;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch(`${API_URL}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const { data } = await res.json();
  return data;
}