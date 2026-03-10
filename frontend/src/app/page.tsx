import Button from "@/components/atoms/Button";

export default function Home() {
  return (
<main className="flex-1 flex justify-center items-center">
      <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          <span className="text-blue-600"> Web3</span> QR Code Payment Generator
          </h1>
          <div className="flex gap-2 items-center">
          <input className="border-2 focus:border-blue-600 w-full max-w-[400px] h-8 rounded-lg"/>
          <Button label="Generate payment link"/>
          </div>
       
      </div>
    </main>
  );
}
