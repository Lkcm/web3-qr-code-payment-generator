import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
