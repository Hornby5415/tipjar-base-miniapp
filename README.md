# Base Reward Tap

A mobile-first Base MiniApp built with Next.js, TypeScript, App Router, Wagmi, and Viem.

## Experience

- English-only interface
- One primary action: claim the daily reward
- Instant local points on the first interaction
- Optional onchain proof with Base attribution
- Native Wagmi setup with only `injected()` and `coinbaseWallet()`
- No RainbowKit and no WalletConnect project ID

## Attribution

Offchain attribution is hardcoded in `app/layout.tsx`:

```tsx
<meta name="base:app_id" content="BASE_DEV_VERIFY_TOKEN_PLACEHOLDER" />
```

Onchain attribution is configured in `lib/wagmi.ts` with `dataSuffix`, and every `writeContract` call also passes the same `dataSuffix` explicitly.

Replace these after Base verification:

```bash
NEXT_PUBLIC_BASE_APP_ID=your-base-verify-token
NEXT_PUBLIC_BUILDER_CODE_DATA_SUFFIX=0x...
```

The `base:app_id` tag must be edited directly in `app/layout.tsx`, not generated through the Next.js metadata API.

## Wallets

Supported wallet paths:

- Base App embedded wallet through `injected()`
- MetaMask through `injected()`
- OKX through `injected()`
- Coinbase Wallet through `coinbaseWallet()`

The Base App embedded wallet can auto-connect when detected. Users can still disconnect from the wallet button.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BUILDER_CODE_DATA_SUFFIX=0x
```

Use `NEXT_PUBLIC_CHAIN_ID=84532` for Base Sepolia.
