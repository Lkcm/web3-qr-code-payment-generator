import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/organisms/Header";

export const metadata: Metadata = {
  title: "Web3 QR Code Payment Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
   <body className="flex flex-col min-h-screen">
 <Header/>
 <main className="flex flex-col flex-1">
    {children}
  </main>
    </body>
  </html>
  );
}
