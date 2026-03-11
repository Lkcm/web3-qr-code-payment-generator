import PaymentForm from "@/components/molecules/PaymentForm";
import TransactionsTable from "@/components/organisms/TransactionsTable";

export default function Home() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            <span className="text-blue-600">Web3</span> QR Payment Generator
          </h1>
          <PaymentForm />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <TransactionsTable />
        </div>

      </div>
    </main>
  );
}