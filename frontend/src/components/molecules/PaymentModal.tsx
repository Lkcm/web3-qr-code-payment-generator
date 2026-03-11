"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";

interface Props {
  uri: string;
  onClose: () => void;
}

const PaymentModal = ({ uri, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onClose]);

  const copyLink = () => {
    navigator.clipboard.writeText(uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Payment QR Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
          <QRCodeSVG value={uri} size={200} />
        </div>

        <p className="text-xs text-gray-400 text-center">
          Scan with Trust Wallet or any Web3 wallet to send payment
        </p>

        {/* Timer */}
        <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${timeLeft <= 10 ? "bg-red-50" : "bg-yellow-50"}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${timeLeft <= 10 ? "bg-red-400" : "bg-yellow-400"}`} />
          <span className={`text-sm font-medium ${timeLeft <= 10 ? "text-red-600" : "text-yellow-600"}`}>
            This link expires in {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-xs text-gray-500 truncate flex-1">{uri}</span>
          <Button label={copied ? "Copied!" : "Copy"} onClick={copyLink} />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;