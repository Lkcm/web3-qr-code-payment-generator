import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/organisms/Header";
import { SocketProvider } from "@/contexts/SocketContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { TokenProvider } from "@/contexts/TokenContext";

export const metadata: Metadata = {
  title: "Web3 QR Code Payment Generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body className="flex flex-col min-h-screen">
        <WalletProvider>
          <TokenProvider>
            <SocketProvider>
              <Header />
              <main className="flex flex-col flex-1">
                {children}
              </main>
            </SocketProvider>
          </TokenProvider>
        </WalletProvider>
      </body>
    </html>
  );
}