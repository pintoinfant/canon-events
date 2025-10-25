import { defineChain } from "viem"
import { createConfig, http } from "wagmi"
import { injected } from "wagmi/connectors"

export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/testnet",
    },
  },
})

export const config = createConfig({
  chains: [hederaTestnet],
  connectors: [injected({ target: "metaMask" })],
  transports: {
    [hederaTestnet.id]: http(),
  },
})