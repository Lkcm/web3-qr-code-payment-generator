"use client";
import { useEffect, useState, useCallback } from "react";
import { formatUnits, parseAbi, createPublicClient, http, getAddress, parseEther, formatEther } from "viem";
import { getTransaction, Transaction } from "@/services/transactions";
import { connectMetaMask, switchToPolygon, executeTokenTransfer, getExpectedChainHex } from "@/lib/wallet";
import { CHAIN } from "@/lib/wallet";
import { useSocket } from "@/contexts/SocketContext";

const TOKEN_ADDRESS: Record<string, string> = {
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "",
  USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "",
};

const erc20BalanceAbi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

const publicClient = createPublicClient({ chain: CHAIN, transport: http() });

export type PaymentStep =
  | "loading"
  | "connect"
  | "switch_network"
  | "low_gas"
  | "low_balance"
  | "ready"
  | "sending"
  | "pending"
  | "confirmed"
  | "expired"
  | "invalid_amount"
  | "error";

const MIN_MATIC = parseEther("0.001");

const usePayment = (transactionId: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [step, setStep] = useState<PaymentStep>("loading");
  const [buyerAddress, setBuyerAddress] = useState<string | null>(null);
  const [buyerBalance, setBuyerBalance] = useState<string | null>(null);
  const [maticBalance, setMaticBalance] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    getTransaction(transactionId)
      .then((tx) => {
        setTransaction(tx);
        if (tx.status !== "pending") setStep(tx.status as PaymentStep);
      })
      .catch(() => setStep("error"));
  }, [transactionId]);

  useEffect(() => {
    if (!socket || !transaction) return;
    socket.emit("register", transaction.address);

    socket.on("transaction:update", (updated: Transaction) => {
      if (updated._id !== transaction._id) return;
      setTransaction(updated);
      if (updated.status !== "pending") setStep(updated.status as PaymentStep);
    });

    return () => { socket.off("transaction:update"); };
  }, [socket, transaction?._id, transaction?.address]);

  const checkWalletState = useCallback(async () => {
    if (!transaction || transaction.status !== "pending") return;
    if (!window.ethereum) { setStep("connect"); return; }

    const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
    if (accounts.length === 0) { setStep("connect"); return; }

    const address = accounts[0];
    setBuyerAddress(address);

    const chainId = await window.ethereum.request({ method: "eth_chainId" }) as string;
    if (chainId.toLowerCase() !== getExpectedChainHex().toLowerCase()) {
      setStep("switch_network");
      return;
    }

    const matic = await publicClient.getBalance({ address: address as `0x${string}` });
    setMaticBalance(formatEther(matic));
    if (matic < MIN_MATIC) { setStep("low_gas"); return; }

    const tokenAddress = TOKEN_ADDRESS[transaction.token];
    try {
      const balance = await publicClient.readContract({
        address: getAddress(tokenAddress),
        abi: erc20BalanceAbi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      setBuyerBalance(formatUnits(balance, 6));
      if (balance < BigInt(transaction.expectedAmount)) { setStep("low_balance"); return; }
    } catch {
      setStep("low_balance");
      return;
    }

    setStep("ready");
  }, [transaction]);

  useEffect(() => {
    if (transaction?.status === "pending") checkWalletState();
  }, [transaction, checkWalletState]);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on?.("accountsChanged", checkWalletState);
    window.ethereum.on?.("chainChanged", checkWalletState);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", checkWalletState);
      window.ethereum?.removeListener?.("chainChanged", checkWalletState);
    };
  }, [checkWalletState]);

  const connect = async () => {
    try {
      await connectMetaMask();
      await checkWalletState();
    } catch (e: unknown) {
      setErrorMessage((e as Error).message);
    }
  };

  const switchNetwork = async () => {
    try {
      await switchToPolygon();
      await checkWalletState();
    } catch (e: unknown) {
      setErrorMessage((e as Error).message);
    }
  };

  const pay = async () => {
    if (!transaction || !buyerAddress) return;
    setStep("sending");
    setErrorMessage(null);
    try {
      await executeTokenTransfer(
        buyerAddress,
        TOKEN_ADDRESS[transaction.token],
        transaction.address,
        transaction.expectedAmount
      );
      setStep("pending");
    } catch (e: unknown) {
      setErrorMessage((e as Error).message);
      setStep("ready");
    }
  };

  return { transaction, step, buyerAddress, buyerBalance, maticBalance, errorMessage, connect, switchNetwork, pay };
};

export default usePayment;
