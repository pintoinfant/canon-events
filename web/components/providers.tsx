"use client"

import { WagmiProvider } from "wagmi"
import { QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig, queryClient } from "@/lib/wagmi"
import type React from "react"

/**
 * Client-side Providers wrapper to avoid passing non-serializable class instances.
 * Added reconnectOnMount to ensure previously authorized accounts auto-reconnect.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig} reconnectOnMount>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  )
}