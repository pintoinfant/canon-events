import { createConfig, http } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';
import { sepolia, hederaTestnet } from './chains';

/**
 * wagmi configuration restricted to MetaMask only.
 * Removes injected/other connectors to prevent Coinbase or others from appearing.
 */
export const wagmiConfig = createConfig({
  chains: [sepolia, hederaTestnet] as const,
  connectors: [
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
    [hederaTestnet.id]: http(process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api'),
  },
  ssr: true,
  batch: { multicall: true },
});

export const queryClient = new QueryClient();

export function truncateAddress(address?: string, size: number = 4) {
  if (!address) return '';
  return `${address.slice(0, 2 + size)}...${address.slice(-size)}`;
}

export const supportedChains = [sepolia, hederaTestnet] as const;
export const defaultChain = sepolia;