"use client";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { getTransactions, Transaction, TransactionStatus } from "@/services/transactions";

const POLL_INTERVAL = 5000;

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  confirmed: { label: "Confirmed", className: "bg-green-50 text-green-600 border-green-200" },
  invalid_amount: { label: "Invalid Amount", className: "bg-red-50 text-red-600 border-red-200" },
};

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTransactions() {
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        Loading transactions...
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <th className="text-left px-6 py-4">Address</th>
            <th className="text-left px-6 py-4">Expected</th>
            <th className="text-left px-6 py-4">Received</th>
            <th className="text-left px-6 py-4">Status</th>
            <th className="text-left px-6 py-4">Tx Hash</th>
            <th className="text-left px-6 py-4">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            const config = statusConfig[tx.status];
            return (
              <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-700">
                  {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {formatEther(BigInt(tx.expectedAmount))} BNB
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {tx.receivedAmount ? `${formatEther(BigInt(tx.receivedAmount))} BNB` : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.className}`}>
                    {config.label}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                  {tx.txHash ? `${tx.txHash.slice(0, 10)}...` : "—"}
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable