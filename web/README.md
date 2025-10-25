# Canon Event Web Frontend

This document supplements root docs with Wallet (MetaMask) integration details added to the UI header.

## Tech Stack
- Next.js 16 (App Router)
- wagmi 2 + viem 2 for EVM wallet + chain management
- @tanstack/react-query for wagmi caching
- Tailwind for styling
- MetaMask (Injected connector)

## Added Files
- [`web/lib/chains.ts`](web/lib/chains.ts): Chain definitions (Sepolia, Hedera Testnet)
- [`web/lib/wagmi.ts`](web/lib/wagmi.ts): wagmi config + helpers
- [`web/components/wallet-button.tsx`](web/components/wallet-button.tsx): Connect / Disconnect / Chain switch UI
- [`web/global.d.ts`](web/global.d.ts): TS module declarations
- Deprecated: [`web/lib/wallet-context.tsx`](web/lib/wallet-context.tsx) (now empty stub, can delete)

## Environment Variables
Add to `.env.local` (frontend):
```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
```
If not provided, defaults above are used.

## Chains
Defined in [`web/lib/chains.ts`](web/lib/chains.ts):
```ts
import { defineChain } from 'viem';

export const sepolia = defineChain({ id: 11155111, name: 'Sepolia', /* ... */ });
export const hederaTestnet = defineChain({ id: 296, name: 'Hedera Testnet', /* ... */ });
export const chains = [sepolia, hederaTestnet];
```

## wagmi Configuration
[`web/lib/wagmi.ts`](web/lib/wagmi.ts):
```ts
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia, hederaTestnet, chains } from './chains';

export const wagmiConfig = createConfig({
  chains,
  connectors: [injected({ shimDisconnect: true })],
  autoConnect: true,
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
    [hederaTestnet.id]: http(process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api'),
  },
  ssr: true,
  batch: { multicall: true },
});
```

## Global Providers
Updated [`web/app/layout.tsx`](web/app/layout.tsx):
```tsx
<QueryClientProvider client={queryClient}>
  <WagmiProvider config={wagmiConfig}>
    {children}
  </WagmiProvider>
</QueryClientProvider>
```

## Wallet Button Component
[`web/components/wallet-button.tsx`](web/components/wallet-button.tsx):
- Uses `useAccount`, `useConnect`, `useDisconnect`, `useSwitchChain`
- Displays truncated address (`0x1234...ABCD`)
- Chain dropdown (Sepolia / Hedera Testnet)
- Loading states: Connecting / Switching
- Auto connect on page reload (wagmi `autoConnect: true`)

## Removing Legacy Context
Former custom context replaced by wagmi. Stub left for safety:
- Delete file: [`web/lib/wallet-context.tsx`](web/lib/wallet-context.tsx) (no references remain)

## Usage Patterns
To gate pages by connection:
```tsx
import { useAccount } from 'wagmi';
const { isConnected } = useAccount();
if (!isConnected) { /* render prompt */ }
```

Get active chain:
```tsx
import { useChainId } from 'wagmi';
const chainId = useChainId();
```

Switch chain (example):
```tsx
import { useSwitchChain } from 'wagmi';
const { switchChain } = useSwitchChain();
switchChain({ chainId: 11155111 });
```

## Helper
Address truncation: `truncateAddress(address)` from [`web/lib/wagmi.ts`](web/lib/wagmi.ts).

## Testing Checklist
1. Open home page: header shows Connect Wallet.
2. Click Connect: MetaMask prompt appears, button shows truncated address.
3. Open chain menu: select Hedera Testnet; button shows Switching... then updates.
4. Refresh page: connection persists (autoConnect).
5. Disconnect: button returns to Connect Wallet.

## Optional Enhancements
- Toast notifications on chain / account changes (use existing toast system)
- Add ENS name resolution for addresses (future)
- Add WalletConnect connector if multi-wallet support needed

## Safety / Edge Cases
- If MetaMask not installed: injected connector returns undefined; button stays on Connect Wallet.
- Dropdown auto-closes on outside click (fixed overlay).
- Chain IDs validated against supported set.

## Deleting Legacy File
After verification, remove:
```bash
rm web/lib/wallet-context.tsx
```

## Summary
Integration complete: MetaMask connection, chain switching, persistence, UI states now handled via wagmi + viem with minimal footprint.