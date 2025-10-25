"use client"

import { useWallet } from "@/lib/wallet-context"

export function WalletButton() {
  const { isConnected, address, connect, disconnect } = useWallet()

  return (
    <button
      onClick={isConnected ? disconnect : connect}
      className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-sans font-medium text-sm border border-primary glass-strong"
    >
      {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
    </button>
  )
}
