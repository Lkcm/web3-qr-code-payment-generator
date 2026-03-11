"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useWallet } from "@/hooks/useWallet";

const SOCKET_URL = process.env.NEXT_SOCKET_URL || "http://localhost:3001";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { address } = useWallet();

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"] });

    s.on("connect", () => {
      setConnected(true);
      console.log("🔌 Socket connected:", s.id);
      if (address) {
        console.log("📡 Registering address:", address);
        s.emit("register", address);
      }
    });

    s.on("disconnect", () => {
      setConnected(false);
      console.log("❌ Socket disconnected");
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  // Re-register when address changes
  useEffect(() => {
    if (socket && connected && address) {
      socket.emit("register", address);
    }
  }, [address, socket, connected]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}