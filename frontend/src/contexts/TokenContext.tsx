"use client";
import { createContext, useContext, useState } from "react";
import { TokenSymbol } from "@/services/transactions";

interface TokenContextType {
  token: TokenSymbol;
  setToken: (token: TokenSymbol) => void;
}

const TokenContext = createContext<TokenContextType>({
  token: "USDC",
  setToken: () => {},
});

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<TokenSymbol>("USDC");
  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  return useContext(TokenContext);
}
