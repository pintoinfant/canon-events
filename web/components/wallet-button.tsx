"use client"

import { useAccount, useConnect, useDisconnect, useSwitchChain, useChains, useChainId } from "wagmi"
import { supportedChains, truncateAddress, defaultChain } from "@/lib/wagmi"
import { ChevronDown, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

/**
 * WalletButton (MetaMask only):
 * - Connect / Disconnect via metaMask connector
 * - Manual window.ethereum.request fallback if connector unavailable
 * - Error display & retry
 * - Status dot (green connected / red disconnected)
 * - Disabled state & tooltip if MetaMask not installed
 */
export function WalletButton() {
  const { address, isConnected, status } = useAccount()
  const { connectors, connect, isPending: isConnectPending, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain, isPending: isSwitchPending } = useSwitchChain()
  const configuredChains = useChains()
  const activeChainId = useChainId()
  const [open, setOpen] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [attemptedManual, setAttemptedManual] = useState(false)

  const metaMaskConnector = connectors.find(c => c.id === "metaMask")
  const hasEthereum = typeof window !== "undefined" && !!(window as any).ethereum

  const handleConnect = async () => {
    setManualError(null)
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
      return
    }
    // Fallback manual request if connector missing
    if (hasEthereum) {
      try {
        setAttemptedManual(true)
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        console.log("Manual accounts (MetaMask):", accounts)
      } catch (e: any) {
        setManualError(e?.message || "Failed to request accounts")
      }
    } else {
      setManualError("MetaMask not detected")
    }
  }

  // Log successful connection accounts
  useEffect(() => {
    if (isConnected && address) {
      console.log("Connected address:", address)
    }
  }, [isConnected, address])

  const currentChain =
    chains.find(c => c.id === activeChainId) ||
    configuredChains.find(c => c.id === activeChainId) ||
    defaultChain

  const showError = connectError?.message || manualError

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* Chain selector */}
        {isConnected && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="px-4 py-2.5 rounded-full border border-primary/60 bg-background/70 backdrop-blur-sm text-xs font-medium flex items-center gap-1 hover:bg-background/80 transition shadow-sm"
            >
              {currentChain?.name || "Chain"} <ChevronDown className="w-3 h-3" />
            </button>
            {open && (
              <div className="absolute z-50 mt-3 w-52 rounded-xl border border-white/15 bg-background/95 shadow-lg backdrop-blur-sm p-2">
                <ul className="space-y-1 text-xs">
                  {supportedChains.map(chain => {
                    const active = chain.id === activeChainId
                    return (
                      <li key={chain.id}>
                        <button
                          type="button"
                          disabled={active || isSwitchPending}
                          onClick={() => {
                            switchChain({ chainId: chain.id })
                            setOpen(false)
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-colors hover:bg-white/10 ${
                            active ? "text-primary font-semibold" : "text-foreground"
                          }`}
                        >
                          <span>{chain.name}</span>
                          {active && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 border border-primary/30">
                              Active
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Connect / Address button */}
        <button
          onClick={isConnected ? () => disconnect() : () => handleConnect()}
          disabled={(!hasEthereum && !metaMaskConnector) || isConnectPending || isSwitchPending}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity font-sans font-medium text-sm border border-primary glass-strong flex items-center gap-2 shadow-sm relative group"
          title={!hasEthereum ? "MetaMask not installed" : ""}
        >
          <span
            className={`absolute -left-2 w-3 h-3 rounded-full border border-background ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isConnectPending || status === "connecting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : isSwitchPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Switching...
            </>
          ) : isConnected ? (
            truncateAddress(address)
          ) : (
            "Connect MetaMask"
          )}
        </button>
      </div>

      {/* Error display */}
      {showError && !isConnected && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 max-w-[240px]">
          {showError}
          {!attemptedManual && (
            <button
              type="button"
              onClick={() => handleConnect()}
              className="ml-2 underline hover:no-underline text-red-600 dark:text-red-400"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Click-outside to close dropdown */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
