import PaymentForm from "@/components/molecules/PaymentForm";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          <span className="text-blue-600">Web3</span> QR Payment Generator
        </h1>
        <PaymentForm />
      </div>
    </main>
  );
}